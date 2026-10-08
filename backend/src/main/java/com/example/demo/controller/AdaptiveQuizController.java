package com.example.demo.controller;

import com.example.demo.model.AdaptiveQuizSession;
import com.example.demo.model.LearningItem;
import com.example.demo.repository.LearningItemRepository;
import com.example.demo.service.StatefulAdaptiveQuizService;
import com.example.demo.service.GroqAIService;
import org.springframework.web.bind.annotation.*;
import lombok.Data;
import java.util.List;

@RestController
@RequestMapping("/api/adaptive-quiz")
@CrossOrigin(origins = "http://localhost:5173")
public class AdaptiveQuizController {

    private final StatefulAdaptiveQuizService quizService;
    private final GroqAIService aiService;
    private final LearningItemRepository learningItemRepository;

    public AdaptiveQuizController(StatefulAdaptiveQuizService quizService, GroqAIService aiService, LearningItemRepository learningItemRepository) {
        this.quizService = quizService;
        this.aiService = aiService;
        this.learningItemRepository = learningItemRepository;
    }

    @PostMapping("/start")
    public AdaptiveQuizSession startSession(@RequestBody StartRequest request) {
        return quizService.startSession(request.getUserId(), request.getTopic(), request.getLessonContent(), request.getInitialScore());
    }
    
    @PostMapping("/{sessionId}/generate-first")
    public com.example.demo.dto.AIResponse generateFirstQuestion(@PathVariable Long sessionId, @RequestBody StartRequest request) {
        String jsonQuestion = quizService.getFirstQuestion(sessionId);
        return new com.example.demo.dto.AIResponse(jsonQuestion);
    }

    @PostMapping("/{sessionId}/answer")
    public com.example.demo.dto.AIResponse submitAnswerAndGetNext(@PathVariable Long sessionId, @RequestBody AnswerRequest request) {
        String json = quizService.getNextQuestion(
            sessionId, 
            request.getPreviousQuestionText(), 
            request.getUserAnswer(), 
            request.isWasCorrect()
        );
        return new com.example.demo.dto.AIResponse(json);
    }
    
    @PostMapping("/generate-diagnostic")
    public com.example.demo.dto.AIResponse generateDiagnostic(@RequestBody DiagnosticRequest request) {
        String instruction = String.format(
            "Generate a strict 10-question JSON array diagnostic test for a candidate who wants to become a '%s'.\n" +
            "CRITICAL REQUIREMENT: The questions MUST STRICTLY AND EXCLUSIVELY test the specific skills the user claims to know: %s.\n" +
            "Do NOT ask any general role questions. ONLY ask questions about the exact skills listed above.\n" +
            "Distribute the 10 questions evenly across these specific skills.\n" +
            "Include difficulty levels (EASY, MEDIUM, HARD).\n" +
            "Format: [{\"id\":1,\"text\":\"...\",\"options\":[\"Option 1 Text\",\"Option 2 Text\",\"Option 3 Text\",\"Option 4 Text\"],\"correctAnswer\":\"The EXACT text of the correct option\",\"topic\":\"The Specific Skill Tested\",\"difficulty\":\"MEDIUM\"}]",
            request.getTargetRole(), request.getCurrentSkills()
        );

        String json = aiService.generateDiagnosticQuiz(request.getTargetRole(), instruction);
        return new com.example.demo.dto.AIResponse(json);
    }

    @GetMapping("/history/{userId}")
    public List<AdaptiveQuizSession> getHistory(@PathVariable Long userId) {
        return quizService.getHistory(userId);
    }

    @Data
    public static class StartRequest {
        private Long userId;
        private String topic;
        private String lessonContent;
        private Double initialScore;
    }

    @Data
    public static class AnswerRequest {
        private String previousQuestionText;
        private String userAnswer;
        private boolean wasCorrect;
    }

    @Data
    public static class DiagnosticRequest {
        private String targetRole;
        private String currentSkills;
    }
}
