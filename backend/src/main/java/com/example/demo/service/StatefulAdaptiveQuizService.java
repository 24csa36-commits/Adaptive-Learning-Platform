package com.example.demo.service;

import com.example.demo.model.AdaptiveQuizSession;
import com.example.demo.repository.AdaptiveQuizSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class StatefulAdaptiveQuizService {

    private final AdaptiveQuizSessionRepository repository;
    private final GroqAIService aiService;
    private final AdaptiveEngineService mathEngine;
    private final ObjectMapper objectMapper;
    private final LearnerStateService learnerStateService;
    private final DecisionEngineService decisionEngineService;

    public StatefulAdaptiveQuizService(AdaptiveQuizSessionRepository repository, 
                                       GroqAIService aiService, 
                                       AdaptiveEngineService mathEngine,
                                       LearnerStateService learnerStateService,
                                       DecisionEngineService decisionEngineService) {
        this.repository = repository;
        this.aiService = aiService;
        this.mathEngine = mathEngine;
        this.learnerStateService = learnerStateService;
        this.decisionEngineService = decisionEngineService;
        this.objectMapper = new ObjectMapper();
    }

    public AdaptiveQuizSession startSession(Long userId, String topic, String lessonContent, Double initialScore) {
        AdaptiveQuizSession session = new AdaptiveQuizSession();
        session.setUserId(userId);
        session.setTopic(topic);
        session.setLessonContent(lessonContent);
        session.setCurrentMasteryScore(initialScore != null ? initialScore : 50.0);
        session.setQuestionsAskedCount(0);
        session.setCorrectCount(0);
        session.setCompleted(false);
        session.setHistoryJson("[]");
        session.setStartedAt(LocalDateTime.now());
        session.setLastUpdatedAt(LocalDateTime.now());
        
        return repository.save(session);
    }

    public java.util.List<AdaptiveQuizSession> getHistory(Long userId) {
        return repository.findByUserIdOrderByStartedAtDesc(userId);
    }

    public String getFirstQuestion(Long sessionId) {
        AdaptiveQuizSession session = repository.findById(sessionId).orElseThrow();
        
        double score = session.getCurrentMasteryScore();
        
        // Calculate Learner State & Decision Engine
        com.example.demo.dto.LearnerStateDto state = learnerStateService.evaluateState(session.getUserId(), null, null);
        state.setMastery(score);
        state.setUnderstanding(score);
        com.example.demo.dto.NextActionDto nextAction = decisionEngineService.determineNextAction(state);
        
        String aiInstruction = String.format(
            "Current Mastery: %.1f. Decision Engine Action: %s (%s). Recommended Difficulty: %s. " +
            "Instruction: Generate a standard introductory question to establish baseline knowledge. Test the same concept from a fresh angle.",
            score, nextAction.getAction(), nextAction.getReason(), nextAction.getRecommendedDifficulty()
        );
        
        return generateAndValidateQuestion(session.getTopic(), session.getLessonContent(), aiInstruction, session, null, null, null, null);
    }

    public String getNextQuestion(Long sessionId, String previousQuestion, String userAnswer, boolean wasCorrect) {
        AdaptiveQuizSession session = repository.findById(sessionId).orElseThrow();
        
        // 1. Update stats
        if (wasCorrect) {
            session.setCorrectCount(session.getCorrectCount() + 1);
        }
        
        // 2. Mathematically calculate new mastery using single authoritative source
        double newScore = mathEngine.calculateNewScore(session.getCurrentMasteryScore(), wasCorrect);
        session.setCurrentMasteryScore(newScore);
        
        // 3. Increment counter
        session.setQuestionsAskedCount(session.getQuestionsAskedCount() + 1);
        
        // 4. Calculate Learner State & Decision Engine
        com.example.demo.dto.LearnerStateDto state = learnerStateService.evaluateState(session.getUserId(), null, null);
        // Override state mastery with the immediate local quiz mastery for this session context
        state.setMastery(newScore);
        state.setUnderstanding(newScore);
        
        com.example.demo.dto.NextActionDto nextAction = decisionEngineService.determineNextAction(state);
        
        // 5. Check if finished (e.g. max 5 questions)
        if (session.getQuestionsAskedCount() >= 5) {
            session.setCompleted(true);
            session.setLastUpdatedAt(LocalDateTime.now());
            repository.save(session);
            
            try {
                // Return NextActionDto merged into final result
                String actionJson = objectMapper.writeValueAsString(nextAction);
                return "{\"completed\": true, \"finalScore\": " + newScore + ", \"nextAction\": " + actionJson + "}";
            } catch (Exception e) {
                return "{\"completed\": true, \"finalScore\": " + newScore + "}";
            }
        }
        
        // Extract authoritative conceptId from the last question in the session history
        String currentConceptId = null;
        try {
            ArrayNode historyArray = (ArrayNode) objectMapper.readTree(session.getHistoryJson());
            if (historyArray.size() > 0) {
                JsonNode lastNode = historyArray.get(historyArray.size() - 1);
                if (lastNode.hasNonNull("conceptId")) {
                    currentConceptId = lastNode.get("conceptId").asText();
                }
            }
        } catch (Exception e) {}

        boolean requiresSameConcept = false;
        if (currentConceptId != null && !nextAction.getAction().equals("ADVANCE")) {
            requiresSameConcept = true;
        }

        String aiInstruction;
        if (requiresSameConcept) {
            aiInstruction = String.format(
                "Current Mastery: %.1f. Decision Engine Action: %s (%s). Recommended Difficulty: %s. " +
                "Instruction: Generate a NEW question testing exactly this conceptId.\n" +
                "Required conceptId: %s\n" +
                "Do NOT change the conceptId.\n" +
                "Use a different wording, example, scenario, or reasoning approach.\n" +
                "Do NOT repeat any previous question.",
                newScore, nextAction.getAction(), nextAction.getReason(), nextAction.getRecommendedDifficulty(),
                currentConceptId
            );
        } else {
            aiInstruction = String.format(
                "Current Mastery: %.1f. Decision Engine Action: %s (%s). Recommended Difficulty: %s. " +
                "Instruction: Generate a NEW question testing a DIFFERENT, logical next concept.\n" +
                "The new conceptId MUST be explicitly different from the previous conceptId (%s).\n" +
                "Do NOT repeat any previous question.",
                newScore, nextAction.getAction(), nextAction.getReason(), nextAction.getRecommendedDifficulty(),
                currentConceptId != null ? currentConceptId : "N/A"
            );
        }
        
        // 7. Call common generation and validation logic
        return generateAndValidateQuestion(session.getTopic(), session.getLessonContent(), aiInstruction, session, previousQuestion, userAnswer, requiresSameConcept ? currentConceptId : null, currentConceptId);
    }

    private String generateAndValidateQuestion(String topic, String lessonContent, String instruction, AdaptiveQuizSession session, String prevQ, String userAns, String requiredConceptId, String previousConceptId) {
        int maxRetries = 3;
        String acceptedQuestionJson = null;
        JsonNode acceptedNode = null;

        for (int i = 0; i < maxRetries; i++) {
            String candidateJson = aiService.generateAdaptiveQuestion(
                topic,
                lessonContent,
                instruction, 
                session.getHistoryJson(), 
                prevQ, 
                userAns
            );

            try {
                JsonNode node = objectMapper.readTree(candidateJson);
                
                // Validate JSON structure
                if (!node.hasNonNull("text") || !node.hasNonNull("options") || !node.hasNonNull("correctAnswer") || !node.hasNonNull("explanation")) {
                    continue; // Missing required fields, retry
                }

                // Validate Concept
                if (requiredConceptId != null && !requiredConceptId.equals("N/A")) {
                    if (!node.hasNonNull("conceptId") || !node.get("conceptId").asText().equals(requiredConceptId)) {
                        continue; // Concept mismatch, reject and regenerate
                    }
                } else if (previousConceptId != null) {
                    // We are advancing to a new concept, so it MUST NOT be the same as the previous one
                    if (node.hasNonNull("conceptId") && node.get("conceptId").asText().equals(previousConceptId)) {
                        continue; // Rejected because it gave the same concept when it should have advanced
                    }
                }
                
                String newQuestionText = node.get("text").asText();
                
                // Duplicate check
                if (isDuplicate(newQuestionText, session.getHistoryJson())) {
                    continue; // Duplicate found, retry
                }

                // Passed all checks!
                acceptedQuestionJson = candidateJson;
                acceptedNode = node;
                break;
            } catch (Exception e) {
                // Malformed JSON, retry
                continue;
            }
        }

        if (acceptedQuestionJson == null) {
            return "{\"error\": \"Could not generate a unique, valid question after retries.\"}";
        }

        // Append accepted question to history
        try {
            ArrayNode historyArray = (ArrayNode) objectMapper.readTree(session.getHistoryJson());
            historyArray.add(acceptedNode);
            session.setHistoryJson(objectMapper.writeValueAsString(historyArray));
        } catch (Exception e) {
            System.err.println("Failed to update historyJson");
        }

        session.setLastUpdatedAt(LocalDateTime.now());
        repository.save(session);
        
        return acceptedQuestionJson;
    }

    /**
     * Modular helper to check if a new question is a duplicate of past questions.
     * Ready to be swapped with pgvector cosine similarity later.
     */
    private boolean isDuplicate(String newQuestion, String historyJson) {
        try {
            JsonNode historyArray = objectMapper.readTree(historyJson);
            String newQNormalized = newQuestion.toLowerCase().replaceAll("[^a-z0-9 ]", "");

            for (JsonNode node : historyArray) {
                String oldQ = node.get("text").asText();
                String oldQNormalized = oldQ.toLowerCase().replaceAll("[^a-z0-9 ]", "");
                
                // Exact or normalized match
                if (newQNormalized.equals(oldQNormalized)) {
                    return true;
                }
                
                // Basic Jaccard-style similarity for obvious rephrasing
                if (calculateSimilarity(newQNormalized, oldQNormalized) > 0.7) {
                    return true;
                }
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }

    private double calculateSimilarity(String s1, String s2) {
        java.util.Set<String> words1 = new java.util.HashSet<>(java.util.Arrays.asList(s1.split("\\s+")));
        java.util.Set<String> words2 = new java.util.HashSet<>(java.util.Arrays.asList(s2.split("\\s+")));
        java.util.Set<String> intersection = new java.util.HashSet<>(words1);
        intersection.retainAll(words2);
        java.util.Set<String> union = new java.util.HashSet<>(words1);
        union.addAll(words2);
        if (union.isEmpty()) return 0.0;
        return (double) intersection.size() / union.size();
    }
}
