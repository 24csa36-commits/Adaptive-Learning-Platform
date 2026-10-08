package com.example.demo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.*;
@Repository
public interface ItemConceptRepository extends JpaRepository<ItemConcept, Long> {
    java.util.List<ItemConcept> findByLearningItemId(Long learningItemId);
}
