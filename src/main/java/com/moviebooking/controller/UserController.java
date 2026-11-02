
package com.moviebooking.controller;

import com.moviebooking.model.User;
import com.moviebooking.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> details) {
        try {
            User user = new User(
                0,
                details.get("name"),
                details.get("email"),
                details.get("password"),
                details.get("phone")
            );
            String message = userService.register(user);
            return ResponseEntity.ok(
                Map.of("message", message)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(
                Map.of("error", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> details) {

        try {
            User user = userService.login(
                details.getOrDefault("identifier", details.get("email")),
                details.get("password")
            );

            return ResponseEntity.ok(
                Map.of(
                    "userId", user.getUserId(),
                    "name", user.getName(),
                    "email", user.getEmail()
                )
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.badRequest().body(
                Map.of("error", String.valueOf(e.getMessage()))
            );
        }
    }
}
