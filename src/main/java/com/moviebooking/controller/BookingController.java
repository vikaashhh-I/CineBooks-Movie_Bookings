package com.moviebooking.controller;

import com.moviebooking.model.BookingRequest;
import com.moviebooking.service.BookingService;
import com.moviebooking.service.UserAccountUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/showtime/{showtimeId}/seats")
    public List<Map<String, Object>> getAvailableSeats(
            @PathVariable int showtimeId) {

        return bookingService.getAvailableSeats(showtimeId);
    }

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getUserBookings(
            @PathVariable int userId) {

        return bookingService.getUserBookings(userId);
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody BookingRequest request) {

        try {
            return ResponseEntity.ok(bookingService.createBooking(request));
        } catch (UserAccountUnavailableException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
