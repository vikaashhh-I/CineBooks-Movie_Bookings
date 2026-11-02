package com.moviebooking.service;

import com.moviebooking.model.User;
import com.moviebooking.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Registration details are required.");
        }

        String name = user.getName() == null ? "" : user.getName().trim();
        String email = user.getEmail() == null
            ? ""
            : user.getEmail().trim().toLowerCase(Locale.ROOT);
        String password = user.getPassword();

        if (name.isBlank() || email.isBlank()
                || password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                "Name, email and password are required."
            );
        }

        user.setName(name);
        user.setEmail(email);

        if (userRepository.emailExists(email)) {
            throw new IllegalStateException(
                "Email already registered. Please log in or use another email."
            );
        }

        user.setPassword(passwordEncoder.encode(password));
        userRepository.register(user);

        return "Registration successful!";
    }

    public User login(String identifier, String password) {
        if (identifier == null || identifier.isBlank() || password == null) {
            throw new RuntimeException(
                "Email address or phone number and password are required."
            );
        }

        User user = userRepository.findByLoginIdentifier(identifier.trim());

        if (user == null
                || !passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException(
                "Invalid email address, phone number, or password."
            );
        }

        return user;
    }
}
