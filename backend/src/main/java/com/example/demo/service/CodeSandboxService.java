package com.example.demo.service;

import com.example.demo.dto.CodeEvaluationRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CodeSandboxService {

    /**
     * Executes the provided code against a set of test cases.
     * In a production environment, this would run in an isolated Docker container.
     * For Phase 1 structure, this is a mock implementation that parses the JSON testCases
     * and evaluates the code.
     * 
     * @param request The code submission
     * @param testCasesJson JSON string defining the test cases (inputs and expected outputs)
     * @return A map containing execution results: score, testsPassed, testsTotal, etc.
     */
    public Map<String, Object> executeCode(CodeEvaluationRequest request, String testCasesJson) {
        // Mock evaluation logic
        // If code contains the word "return", we pretend it passed half the tests.
        // If it contains the exact logic, we pretend it passed all.
        int totalTests = 5;
        int testsPassed = 0;
        
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            if (request.getCode().contains("for") || request.getCode().contains("while")) {
                testsPassed = 3; // Partial pass for using a loop
            }
            if (request.getCode().contains("return")) {
                testsPassed += 2; // Pass more if returning something
            }
        }
        
        // Cap testsPassed at totalTests
        testsPassed = Math.min(testsPassed, totalTests);
        double score = (double) testsPassed / totalTests;

        return Map.of(
            "score", score,
            "testsPassed", testsPassed,
            "testsTotal", totalTests,
            "feedback", score == 1.0 ? "All tests passed!" : "Some tests failed. Check your logic."
        );
    }
}
