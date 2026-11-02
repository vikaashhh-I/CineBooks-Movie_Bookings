package com.moviebooking.service;

import com.moviebooking.model.BookingRequest;
import com.moviebooking.repository.BookingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Map<String, Object>> getAvailableSeats(int showtimeId) {
        return bookingRepository.getAvailableSeats(showtimeId);
    }

    public List<Map<String, Object>> getUserBookings(int userId) {
        return bookingRepository.getUserBookings(userId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createBooking(BookingRequest request) {

        if (request == null || request.getUserId() <= 0 ||
            request.getShowtimeId() <= 0) {
            throw new RuntimeException("Invalid user or showtime.");
        }

        List<Integer> seatIds = request.getShowSeatIds();

        if (seatIds == null || seatIds.isEmpty()) {
            throw new RuntimeException("Please select at least one seat.");
        }

        if (seatIds.stream().anyMatch(seatId -> seatId == null || seatId <= 0)) {
            throw new RuntimeException("Invalid seat selection.");
        }

        if (new HashSet<>(seatIds).size() != seatIds.size()) {
            throw new RuntimeException("Duplicate seats are not allowed.");
        }

        if (request.getPaymentMethod() == null ||
            request.getPaymentMethod().isBlank()) {
            throw new RuntimeException("Select a payment method.");
        }

        if (!bookingRepository.userExists(request.getUserId())) {
            throw new UserAccountUnavailableException();
        }

        List<Integer> sortedSeatIds = new ArrayList<>(seatIds);
        sortedSeatIds.sort(Integer::compareTo);

        List<Map<String, Object>> seats =
            bookingRepository.lockSeats(
                request.getShowtimeId(), sortedSeatIds
            );

        if (seats.size() != seatIds.size()) {
            throw new RuntimeException("Invalid seat selection.");
        }

        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> seat : seats) {
            if (!"AVAILABLE".equalsIgnoreCase(
                    String.valueOf(seat.get("status")))) {
                throw new RuntimeException(
                    "One or more selected seats are already booked."
                );
            }

            total = total.add(
                new BigDecimal(seat.get("price").toString())
            );
        }

        int bookingId = bookingRepository.createBooking(
            request.getUserId(),
            request.getShowtimeId(),
            total
        );

        for (Map<String, Object> seat : seats) {
            int showSeatId = ((Number) seat.get(
                "show_seat_id"
            )).intValue();

            BigDecimal price = new BigDecimal(
                seat.get("price").toString()
            );

            bookingRepository.addBookingSeat(
                bookingId, showSeatId, price
            );
        }

        int updated = bookingRepository.markSeatsBooked(sortedSeatIds);

        if (updated != sortedSeatIds.size()) {
            throw new RuntimeException(
                "Seat booking failed. Please try again."
            );
        }

        bookingRepository.createPayment(
            bookingId, total, request.getPaymentMethod()
        );

        bookingRepository.confirmBooking(bookingId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Booking successful!");
        response.put("bookingId", bookingId);
        response.put("totalAmount", total);
        response.put("bookingStatus", "CONFIRMED");
        response.put("paymentStatus", "SUCCESS");

        return response;
    }
}
