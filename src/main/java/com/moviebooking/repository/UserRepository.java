package com.moviebooking.repository;

import com.moviebooking.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Locale;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean emailExists(String email) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users WHERE LOWER(email) = ?",
            Integer.class, email
        );

        return count != null && count > 0;
    }

    public void register(User user) {
        String sql = """
            INSERT INTO users (name, email, password, phone)
            VALUES (?, ?, ?, ?)
            """;

        jdbcTemplate.update(
            sql,
            user.getName(),
            user.getEmail(),
            user.getPassword(),
            user.getPhone()
        );
    }

    public User findByEmail(String email) {
        String sql = """
            SELECT user_id, name, email, password, phone
            FROM users
            WHERE LOWER(email) = ?
            """;

        return jdbcTemplate.query(
            sql,
            (rs, rowNum) -> new User(
                rs.getInt("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password"),
                rs.getString("phone")
            ),
            email.toLowerCase(Locale.ROOT)
        ).stream().findFirst().orElse(null);
    }

    public User findByLoginIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return findByEmail(identifier);
        }

        String normalizedPhone = identifier.replaceAll("[^0-9]", "");
        if (normalizedPhone.isEmpty()) {
            return null;
        }

        String sql = """
            SELECT user_id, name, email, password, phone
            FROM users
            WHERE REGEXP_REPLACE(phone, '[^0-9]', '') = ?
            """;

        return jdbcTemplate.query(
            sql,
            (rs, rowNum) -> new User(
                rs.getInt("user_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password"),
                rs.getString("phone")
            ),
            normalizedPhone
        ).stream().findFirst().orElse(null);
    }
}
