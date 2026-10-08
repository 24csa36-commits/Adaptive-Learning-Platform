package com.example.demo.controller;

import com.example.demo.dto.AttemptRequest;
import com.example.demo.model.Attempt;
import com.example.demo.model.ItemConcept;
import com.example.demo.model.LearnerMastery;
import com.example.demo.model.LearningItem;
import com.example.demo.repository.AttemptRepository;
import com.example.demo.repository.ItemConceptRepository;
import com.example.demo.repository.LearnerMasteryRepository;
import com.example.demo.repository.LearningItemRepository;
import com.example.demo.service.MasteryEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-items")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningItemController {

    private final LearningItemRepository learningItemRepository;
    private final ItemConceptRepository itemConceptRepository;
    private final AttemptRepository attemptRepository;
    private final LearnerMasteryRepository learnerMasteryRepository;
    private final MasteryEngine masteryEngine;

    public LearningItemController(LearningItemRepository learningItemRepository,
                                  ItemConceptRepository itemConceptRepository,
                                  AttemptRepository attemptRepository,
                                  LearnerMasteryRepository learnerMasteryRepository,
                                  MasteryEngine masteryEngine) {
        this.learningItemRepository = learningItemRepository;
        this.itemConceptRepository = itemConceptRepository;
        this.attemptRepository = attemptRepository;
        this.learnerMasteryRepository = learnerMasteryRepository;
        this.masteryEngine = masteryEngine;
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningItem> getLearningItem(@PathVariable Long id) {
        return learningItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/attempts")
    public ResponseEntity<java.util.Map<String, String>> submitAttempt(@PathVariable Long id, @RequestBody AttemptRequest request) {
        LearningItem item = learningItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("LearningItem not found"));
        
        com.example.demo.model.User user = new com.example.demo.model.User();
        user.setId(request.getStudentId() != null ? request.getStudentId() : 1L);

        // 1. Create and save the Attempt
        Attempt attempt = new Attempt();
        attempt.setUser(user);
        attempt.setLearningItem(item);
        attempt.setType(item.getType() == LearningItem.ItemType.QUIZ ? LearningItem.ItemType.QUIZ : LearningItem.ItemType.CODING);
        attempt.setScore(request.getScore());
        attempt.setHintsUsed(request.getHintsUsed() != null ? request.getHintsUsed() : 0);
        attempt.setTimeSpentSeconds(request.getTimeSpentMs() != null ? (int)(request.getTimeSpentMs() / 1000) : 60);
        attempt.setDifficulty(request.getItemDifficulty() != null ? request.getItemDifficulty() : 0.5);
        attempt.setTimestamp(java.time.LocalDateTime.now());
        
        attemptRepository.save(attempt);

        // 2. Fetch linked concepts and update Mastery Engine
        List<ItemConcept> itemConcepts = itemConceptRepository.findByLearningItemId(id);
        for (ItemConcept ic : itemConcepts) {
            Optional<LearnerMastery> masteryOpt = learnerMasteryRepository.findByUserIdAndConceptId(user.getId(), ic.getConcept().getId());
            
            LearnerMastery mastery = masteryOpt.orElseGet(() -> {
                LearnerMastery newMastery = new LearnerMastery();
                newMastery.setUser(user);
                newMastery.setConcept(ic.getConcept());
                return newMastery;
            });
            
            // Calculate new score via Engine
            mastery = masteryEngine.updateMastery(mastery, attempt, itemConcepts);
            learnerMasteryRepository.save(mastery);
        }

        return ResponseEntity.ok(java.util.Map.of("message", "Attempt processed. Mastery updated for " + itemConcepts.size() + " concept(s)."));
    }
}
