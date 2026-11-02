package com.moviebooking.controller;

import com.moviebooking.model.Seat;
import com.moviebooking.model.Showtime;
import com.moviebooking.service.ShowtimeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "http://localhost:5173")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimes(@PathVariable int movieId) {
        return showtimeService.getShowtimes(movieId);
    }

    @GetMapping("/{showtimeId}/seats")
    public List<Seat> getSeats(@PathVariable int showtimeId) {
        return showtimeService.getSeats(showtimeId);
    }
}
