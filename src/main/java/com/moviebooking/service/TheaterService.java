package com.moviebooking.service;

import com.moviebooking.model.Theater;
import com.moviebooking.repository.TheaterRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TheaterService {

    private final TheaterRepository theaterRepository;

    public TheaterService(TheaterRepository theaterRepository) {
        this.theaterRepository = theaterRepository;
    }

    public List<Theater> getAllTheaters() {
        return theaterRepository.getAllTheaters();
    }
}
