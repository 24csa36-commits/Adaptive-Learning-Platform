package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty() ||
            req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                false, "Email and Password are required.", null, null, null, null, null, null, null, null
            ));
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                false, "An account with this email already exists.", null, null, null, null, null, null, null, null
            ));
        }

        User user = new User();
        user.setName(req.getName() != null && !req.getName().trim().isEmpty() ? req.getName().trim() : "Learner");
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(req.getPassword());
        user.setSkillLevel(req.getSkillLevel() != null ? req.getSkillLevel() : "Intermediate");
        user.setLearningGoal(req.getLearningGoal() != null ? req.getLearningGoal() : "Full Stack Engineer");
        user.setStreak(1);
        user.setOverallReadiness(75);
        user.setFocusIndex(85);

        User saved = userRepository.save(user);
        String token = "JWT_" + UUID.randomUUID().toString().replace("-", "");

        return ResponseEntity.ok(new AuthResponse(
            true, "Registration successful!", token,
            saved.getId(), saved.getName(), saved.getEmail(),
            saved.getSkillLevel(), saved.getLearningGoal(),
            saved.getStreak(), saved.getOverallReadiness()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                false, "Email and Password are required.", null, null, null, null, null, null, null, null
            ));
        }

        Optional<User> userOpt = userRepository.findByEmail(req.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(req.getPassword())) {
            return ResponseEntity.status(401).body(new AuthResponse(
                false, "Invalid email or password. Please try again.", null, null, null, null, null, null, null, null
            ));
        }

        User user = userOpt.get();
        String token = "JWT_" + UUID.randomUUID().toString().replace("-", "");

        return ResponseEntity.ok(new AuthResponse(
            true, "Login successful!", token,
            user.getId(), user.getName(), user.getEmail(),
            user.getSkillLevel(), user.getLearningGoal(),
            user.getStreak(), user.getOverallReadiness()
        ));
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<AuthResponse> getProfile(@PathVariable String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
            .map(u -> ResponseEntity.ok(new AuthResponse(
                true, "Profile loaded", "VALID",
                u.getId(), u.getName(), u.getEmail(),
                u.getSkillLevel(), u.getLearningGoal(),
                u.getStreak(), u.getOverallReadiness()
            )))
            .orElse(ResponseEntity.notFound().build());
    }
}
