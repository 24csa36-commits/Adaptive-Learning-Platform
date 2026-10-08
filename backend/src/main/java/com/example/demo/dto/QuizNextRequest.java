package com.example.demo.dto;

import lombok.Data;

@Data
public class QuizNextRequest {
    private String topic;              // The subject (e.g., "LSTM")
    private String previousQuestion;   // The text of the last question asked
    private String userAnswer;         // The option the user selected
    private boolean wasCorrect;        // Did they get it right?
    private double currentMasteryScore; // The user's current score in this topic (0.0 to 100.0)
}