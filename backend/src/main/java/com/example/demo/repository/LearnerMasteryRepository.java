package com.example.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.*;
@Repository
public interface LearnerMasteryRepository extends JpaRepository<LearnerMastery, Long> {
    java.util.Optional<LearnerMastery> findByUserIdAndConceptId(Long userId, Long conceptId);
    java.util.List<LearnerMastery> findByUserId(Long userId);
}
