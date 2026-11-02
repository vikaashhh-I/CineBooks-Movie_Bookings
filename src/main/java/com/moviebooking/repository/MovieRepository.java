
package com.moviebooking.repository;

import com.moviebooking.model.Movie;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class MovieRepository {

    private final JdbcTemplate jdbcTemplate;

    public MovieRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Movie> getAllMovies() {

        String sql = "SELECT * FROM movies";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Movie(
                rs.getInt("movie_id"),
                rs.getString("title"),
                rs.getString("genre"),
                rs.getString("language"),
                rs.getInt("duration"),
                rs.getString("description")
            )
        );
    }
}
