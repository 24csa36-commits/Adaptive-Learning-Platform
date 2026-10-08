package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Attempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "learning_item_id")
    private LearningItem learningItem;
    
    @Enumerated(EnumType.STRING)
    private LearningItem.ItemType type; // VIDEO, QUIZ, CODING
    
    private Double score;
    private Integer testsPassed;
    private Integer testsTotal;
    private Integer attemptNumber;
    private Integer hintsUsed;
    private Integer timeSpentSeconds;
    private Double difficulty; // Inherited or computed difficulty (0.0 - 1.0)
    
    private LocalDateTime timestamp;
}
