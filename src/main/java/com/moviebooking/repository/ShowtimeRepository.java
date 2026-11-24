package com.moviebooking.repository;

import com.moviebooking.model.Seat;
import com.moviebooking.model.Showtime;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ShowtimeRepository {

    private final JdbcTemplate jdbcTemplate;

    public ShowtimeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Showtime> getShowtimes(int movieId) {

        String debugSql = """
            SELECT DATABASE() AS db_name,
                   CURDATE() AS db_date,
                   COUNT(*) AS total
            FROM showtimes
            WHERE movie_id = ?
            AND show_date >= CURDATE()
            """;

        System.out.println("SHOWTIME DEBUG: " +
                jdbcTemplate.queryForMap(debugSql, movieId));

        String sql = """
            SELECT showtime_id, movie_id, theater_id, show_date,
                   show_time, show_type
            FROM showtimes
            WHERE movie_id = ?
            AND show_date >= CURDATE()
            ORDER BY show_date, show_time
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Showtime(
                rs.getInt("showtime_id"),
                rs.getInt("movie_id"),
                rs.getInt("theater_id"),
                rs.getString("show_date"),
                rs.getString("show_time"),
                rs.getString("show_type")
            ), movieId);
    }

    public List<Seat> getSeats(int showtimeId) {

        String sql = """
            SELECT s.seat_id, s.theater_id, s.seat_number,
                   s.seat_type, s.price
            FROM seats s
            JOIN show_seats ss ON s.seat_id = ss.seat_id
            WHERE ss.showtime_id = ?
            ORDER BY SUBSTRING(s.seat_number, 1, 1),
                     CAST(SUBSTRING(s.seat_number, 2) AS UNSIGNED)
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Seat(
                rs.getInt("seat_id"),
                rs.getInt("theater_id"),
                rs.getString("seat_number"),
                rs.getString("seat_type"),
                rs.getDouble("price")
            ), showtimeId);
    }
}