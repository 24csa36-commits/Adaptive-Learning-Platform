package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String skillLevel = "Intermediate";
    private String learningGoal = "Full Stack Engineer";
}
