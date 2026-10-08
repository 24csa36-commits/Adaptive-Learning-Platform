const assert = require('assert');

function evaluateQuiz(questions, answers) {
    let correctAnswerCount = 0;
    for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correctAnswer) correctAnswerCount++;
    }
    return correctAnswerCount;
}

const mockQuestions = [
    { correctAnswer: "A" },
    { correctAnswer: "B" },
    { correctAnswer: "C" },
    { correctAnswer: "A" },
    { correctAnswer: "B" }
];

// Test A: All incorrectAnswer
const answersA = { 0: "X", 1: "X", 2: "X", 3: "X", 4: "X" };
assert.strictEqual(evaluateQuiz(mockQuestions, answersA), 0, "Test A Failed");

// Test B: All correctAnswer
const answersB = { 0: "A", 1: "B", 2: "C", 3: "A", 4: "B" };
assert.strictEqual(evaluateQuiz(mockQuestions, answersB), 5, "Test B Failed");

// Test C: Mixed (3 correctAnswer, 2 incorrectAnswer)
const answersC = { 0: "A", 1: "X", 2: "C", 3: "A", 4: "X" };
assert.strictEqual(evaluateQuiz(mockQuestions, answersC), 3, "Test C Failed");

console.log("All evaluation tests passed!");
