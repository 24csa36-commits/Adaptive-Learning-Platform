package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AdaptiveQuizSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private String topic;
    
    @Column(columnDefinition = "TEXT")
    private String lessonContent;
    
    private Double currentMasteryScore;
    private Integer questionsAskedCount;
    private Integer correctCount;
    
    private boolean completed;
    
    @Column(columnDefinition = "TEXT")
    private String historyJson; // Storing the history of Q&A
    
    private LocalDateTime startedAt;
    private LocalDateTime lastUpdatedAt;
}
