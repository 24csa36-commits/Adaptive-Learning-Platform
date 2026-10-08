package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class MonitoringEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MonitoringSession monitoringSession;
    
    private Long userId;
    private Long lessonId;
    
    @Enumerated(EnumType.STRING)
    private MonitoringContext context;
    
    @Enumerated(EnumType.STRING)
    private MonitoringEventType eventType;
    
    private LocalDateTime startTimestamp;
    private Long durationMs;
    private String source;
}
