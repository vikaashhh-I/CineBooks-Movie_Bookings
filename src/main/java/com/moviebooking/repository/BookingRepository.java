package com.moviebooking.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getAvailableSeats(int showtimeId) {
        String sql = """
            SELECT ss.show_seat_id, s.seat_number,
                   s.seat_type, s.price, ss.status
            FROM show_seats ss
            JOIN seats s ON ss.seat_id = s.seat_id
            WHERE ss.showtime_id = ?
            ORDER BY SUBSTRING(s.seat_number, 1, 1),
                     CAST(SUBSTRING(s.seat_number, 2) AS UNSIGNED)
            """;

        return jdbcTemplate.queryForList(sql, showtimeId);
    }

    public List<Map<String, Object>> lockSeats(
            int showtimeId, List<Integer> seatIds) {

        String placeholders = String.join(
            ",", Collections.nCopies(seatIds.size(), "?")
        );

        String sql = """
            SELECT ss.show_seat_id, s.price, ss.status
            FROM show_seats ss
            JOIN seats s ON ss.seat_id = s.seat_id
            WHERE ss.showtime_id = ?
            AND ss.show_seat_id IN (
            """ + placeholders + ") ORDER BY ss.show_seat_id FOR UPDATE";

        List<Object> params = new ArrayList<>();
        params.add(showtimeId);
        params.addAll(seatIds);

        return jdbcTemplate.queryForList(sql, params.toArray());
    }

    public boolean userExists(int userId) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE user_id = ?",
            Integer.class, userId
        );

        return count != null && count > 0;
    }

    public int createBooking(
            int userId, int showtimeId, BigDecimal totalAmount) {

        String sql = """
            INSERT INTO bookings
            (user_id, showtime_id, total_amount, booking_status)
            VALUES (?, ?, ?, 'PENDING')
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                sql, Statement.RETURN_GENERATED_KEYS
            );
            statement.setInt(1, userId);
            statement.setInt(2, showtimeId);
            statement.setBigDecimal(3, totalAmount);
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Could not create booking");
        }

        return key.intValue();
    }

    public void addBookingSeat(
            int bookingId, int showSeatId, BigDecimal price) {

        jdbcTemplate.update(
            """
            INSERT INTO booking_seats
            (booking_id, show_seat_id, price)
            VALUES (?, ?, ?)
            """,
            bookingId, showSeatId, price
        );
    }

    public int markSeatsBooked(List<Integer> seatIds) {
        String placeholders = String.join(
            ",", Collections.nCopies(seatIds.size(), "?")
        );

        String sql = """
            UPDATE show_seats
            SET status = 'BOOKED'
            WHERE status = 'AVAILABLE'
            AND show_seat_id IN (
            """ + placeholders + ")";

        return jdbcTemplate.update(sql, seatIds.toArray());
    }

    public void createPayment(
            int bookingId, BigDecimal amount, String method) {

        jdbcTemplate.update(
            """
            INSERT INTO payments
            (booking_id, amount, payment_method, payment_status)
            VALUES (?, ?, ?, 'SUCCESS')
            """,
            bookingId, amount, method
        );
    }

    public void confirmBooking(int bookingId) {
        jdbcTemplate.update(
            """
            UPDATE bookings
            SET booking_status = 'CONFIRMED'
            WHERE booking_id = ?
            """,
            bookingId
        );
    }

    public List<Map<String, Object>> getUserBookings(int userId) {
        String sql = """
            SELECT b.booking_id, m.title, m.language, t.theater_name,
                   t.location, st.show_type,
                   st.show_date, st.show_time, b.total_amount,
                   b.booking_status, b.booking_date,
                   GROUP_CONCAT(
                       DISTINCT s.seat_number
                       ORDER BY SUBSTRING(s.seat_number, 1, 1),
                                CAST(SUBSTRING(s.seat_number, 2) AS UNSIGNED)
                       SEPARATOR ','
                   ) AS seat_numbers
            FROM bookings b
            JOIN showtimes st ON b.showtime_id = st.showtime_id
            JOIN movies m ON st.movie_id = m.movie_id
            JOIN theaters t ON st.theater_id = t.theater_id
            LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
            LEFT JOIN show_seats ss ON bs.show_seat_id = ss.show_seat_id
            LEFT JOIN seats s ON ss.seat_id = s.seat_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id, m.title, m.language, t.theater_name,
                     t.location, st.show_type, st.show_date, st.show_time,
                     b.total_amount, b.booking_status, b.booking_date
            ORDER BY b.booking_date DESC
            """;

        return jdbcTemplate.queryForList(sql, userId);
    }
}
