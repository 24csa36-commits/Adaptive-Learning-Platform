package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class MonitoringSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private Long courseId;
    private Long lessonId;
    
    @Enumerated(EnumType.STRING)
    private MonitoringContext context;
    
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    
    // Coverage percentage or status indicating if camera/monitor was active
    private String monitoringCoverage;
}
