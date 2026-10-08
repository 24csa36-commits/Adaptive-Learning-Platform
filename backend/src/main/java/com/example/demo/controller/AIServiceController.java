package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.GroqAIService;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.AdaptiveEngineService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIServiceController {

    private final GroqAIService aiService;
    private final AdaptiveEngineService adaptiveEngine; // <--- ADD THIS
    // Update the constructor to inject both services
    public AIServiceController(GroqAIService aiService, AdaptiveEngineService adaptiveEngine) {
        this.aiService = aiService;
        this.adaptiveEngine = adaptiveEngine;
    }

    @PostMapping("/mentor")
    public AIResponse askMentor(@RequestBody ChatRequest request) {
        String response = aiService.getMentorResponse(request.getMessage());
        return new AIResponse(response);
    }

    @PostMapping("/evaluate-code")
    public AIResponse evaluateCode(@RequestBody CodeEvaluationRequest request) {
        String response = aiService.evaluateCode(request.getCode(), request.getLanguage(), request.getProblemDescription());
        return new AIResponse(response);
    }

    @PostMapping("/interview/start")
    public AIResponse startInterview(@RequestBody InterviewStartRequest request) {
        String response = aiService.startScenarioInterview(request);
        return new AIResponse(response);
    }

    @PostMapping("/interview/reply")
    public AIResponse replyInterview(@RequestBody InterviewReplyRequest request) {
        String response = aiService.replyScenarioInterview(request);
        return new AIResponse(response);
    }

    @PostMapping("/interview/evaluate")
    public AIResponse evaluateInterview(@RequestBody InterviewEvaluateRequest request) {
        String response = aiService.evaluateScenarioInterview(request);
        return new AIResponse(response);
    }

    @PostMapping("/quiz/generate")
    public AIResponse generateQuiz(@RequestBody QuizGenerateRequest request) {
        String response = aiService.generateQuiz(request);
        return new AIResponse(response);
    }

    @PostMapping("/quiz/evaluate")
    public AIResponse evaluateQuiz(@RequestBody QuizEvaluateRequest request) {
        String response = aiService.evaluateQuizDiagnostic(request);
        return new AIResponse(response);
    }

    @PostMapping("/project/verify")
    public AIResponse verifyProject(@RequestBody ProjectVerifyRequest request) {
        String response = aiService.verifyProject(request);
        return new AIResponse(response);
    }
    
    @PostMapping("/quiz/generate-adaptive")
    public AIResponse generateAdaptiveQuiz(@RequestBody QuizNextRequest request) {
        // 1. Pass the frontend data into our custom Mathematical Algorithm
        String algorithmInstructions = adaptiveEngine.determineNextStep(request);
        
        // 2. Pass the Algorithm's output into the AI Content Generator
        String jsonQuestion = aiService.generateAdaptiveQuestion(
            request.getTopic(), 
            null, // Stateless route doesn't have lessonContent yet
            algorithmInstructions, 
            "[]", 
            request.getPreviousQuestion(), 
            request.getUserAnswer()
        );
        
        // 3. Return the generated JSON to the React Frontend
        return new AIResponse(jsonQuestion);
    }
}
