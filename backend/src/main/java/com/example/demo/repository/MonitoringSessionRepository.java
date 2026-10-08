package com.example.demo.repository;

import com.example.demo.model.MonitoringSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoringSessionRepository extends JpaRepository<MonitoringSession, Long> {
    java.util.Optional<MonitoringSession> findFirstByUserIdOrderByStartedAtDesc(Long userId);
}
