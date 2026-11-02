package com.moviebooking.service;

import com.moviebooking.model.Seat;
import com.moviebooking.model.Showtime;
import com.moviebooking.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    public List<Showtime> getShowtimes(int movieId) {
        return showtimeRepository.getShowtimes(movieId);
    }

    public List<Seat> getSeats(int showtimeId) {
        return showtimeRepository.getSeats(showtimeId);
    }
}
