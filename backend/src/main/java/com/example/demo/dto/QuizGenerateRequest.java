package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizGenerateRequest {
    private String courseTitle;
    private String moduleTitle;
    private String lessonContent;
    private Integer numQuestions = 3;
    private List<String> weakTopics;
}
