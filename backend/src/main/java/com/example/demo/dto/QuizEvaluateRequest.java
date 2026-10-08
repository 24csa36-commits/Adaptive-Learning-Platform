package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class QuizEvaluateRequest {
    private String quizTitle;
    private List<Map<String, Object>> questions;
    private Map<String, String> userAnswers;
    private Integer timeTakenSeconds;
}
