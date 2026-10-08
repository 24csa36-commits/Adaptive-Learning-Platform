package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MonitoringBatchRequest {
    private Long sessionId;
    private List<EventDto> events;

    @Data
    public static class EventDto {
        private String type; // e.g. FOCUS_LOST
        private LocalDateTime startTs;
        private Long durationMs;
        private String context; // LEARNING, ASSESSMENT
        private String source;
    }
}
