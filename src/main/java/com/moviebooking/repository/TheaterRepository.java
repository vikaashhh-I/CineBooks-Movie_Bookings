package com.moviebooking.repository;

import com.moviebooking.model.Theater;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class TheaterRepository {

    private final JdbcTemplate jdbcTemplate;

    public TheaterRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Theater> getAllTheaters() {
        String sql = "SELECT * FROM theaters";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Theater(
                rs.getInt("theater_id"),
                rs.getString("theater_name"),
                rs.getString("location")
            )
        );
    }
}
