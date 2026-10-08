package com.example.demo.repository;

import com.example.demo.model.AdaptiveQuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdaptiveQuizSessionRepository extends JpaRepository<AdaptiveQuizSession, Long> {
    java.util.List<AdaptiveQuizSession> findByUserIdOrderByStartedAtDesc(Long userId);
}
