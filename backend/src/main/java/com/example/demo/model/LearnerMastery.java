package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class LearnerMastery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "concept_id")
    private Concept concept;
    
    private Double currentScore; // 0.0 to 1.0
    private LocalDateTime lastEvidenceAt;
    private Integer evidenceCount;
    
    @Transient
    public Double getDecayedScore(LocalDateTime now) {
        if (lastEvidenceAt == null || currentScore == null) return 0.0;
        
        long daysSince = java.time.Duration.between(lastEvidenceAt, now).toDays();
        // Simple decay: loose 2% per day of inactivity after 7 days
        if (daysSince > 7) {
            double decayFactor = Math.pow(0.98, daysSince - 7);
            return currentScore * decayFactor;
        }
        return currentScore;
    }
}
