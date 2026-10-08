import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { mockQuiz } from '../data/mockData';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Brain, Loader2, ShieldCheck } from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import MonitoringWidget from '../components/MonitoringWidget';

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession, closeSession, recordAnomaly } = useMonitoring();
  const questionStartTimeRef = useRef(Date.now());
  const courseContext = location.state || {
    courseTitle: "Java Programming Masterclass",
    moduleTitle: "Java Concurrency & Multithreading",
    lessonContent: "Video Transcript: In Java, multithreading allows concurrent execution of two or more parts of a program for maximum utilization of CPU. Threads can be created by implementing the Runnable interface or extending the Thread class. Synchronization is essential to avoid race conditions. We can use the 'synchronized' block or concurrent locks like ReentrantLock to secure critical sections."
  };
  const [masteryScore, setMasteryScore] = useState(50.0);
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("AI Adaptive Knowledge Check");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. Start the Adaptive Session & Monitoring Layer
  useEffect(() => {
    startSession({ context: 'ASSESSMENT', courseId: 1, lessonId: 1 });

    const startAdaptiveSession = async () => {
      setIsLoading(true);
      try {
        // Create session in DB
        const startRes = await fetch('http://localhost:8080/api/adaptive-quiz/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            topic: courseContext.moduleTitle,
            lessonContent: courseContext.lessonContent,
            initialScore: 50.0
          })
        });
        const sessionData = await startRes.json();
        setSessionId(sessionData.id);

        // Fetch very first AI Question
        const qRes = await fetch(`http://localhost:8080/api/adaptive-quiz/${sessionData.id}/generate-first`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: courseContext.moduleTitle })
        });
        
        const qData = await qRes.json();
        const firstQ = JSON.parse(qData.response); // Parse AI JSON
        
        if (firstQ.error) {
            console.error("AI returned error:", firstQ.error);
            alert("Failed to start quiz: " + firstQ.error);
        } else {
            setQuestions([firstQ]);
            questionStartTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Error starting adaptive session", err);
      } finally {
        setIsLoading(false);
      }
    };

    startAdaptiveSession();

    return () => {
      closeSession();
    };
  }, []);

  const handleSelectOption = (option) => {
    setAnswers({ ...answers, [currentQuestionIndex]: option });
  };

  const handleNextAdaptiveQuestion = async () => {
    if (!answers[currentQuestionIndex]) return; 
    
    // Check for rapid answer anomaly (< 2000ms)
    const elapsed = Date.now() - questionStartTimeRef.current;
    if (elapsed < 2000) {
      recordAnomaly('ANSWER_TIMING_ANOMALY', elapsed, 'RAPID_SUBMISSION');
    }
    questionStartTimeRef.current = Date.now();
    
    setIsLoading(true);
    const currentQ = questions[currentQuestionIndex];
    const userSelected = answers[currentQuestionIndex];
    const isCorrect = userSelected === currentQ.correctAnswer;

    try {
      // Send answer to backend (Updates DB state & LearnerMastery, returns next question)
      const res = await fetch(`http://localhost:8080/api/adaptive-quiz/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            previousQuestionText: currentQ.text,
            userAnswer: userSelected,
            wasCorrect: isCorrect
        })
      });
      
      const data = await res.json();
      const rawJson = JSON.parse(data.response); // Parse the AI JSON string returned inside the AIResponse wrapper
      
      if (rawJson.error) {
          console.error("Backend failed to generate question:", rawJson.error);
          alert("Failed to generate the next question: " + rawJson.error);
          return;
      }

      if (rawJson.completed) {
          setIsCompleted(true);
          setMasteryScore(rawJson.finalScore);
          
          let correctCount = 0;
          for (let i = 0; i < questions.length; i++) {
              if (answers[i] === questions[i].correctAnswer) correctCount++;
          }
          
          let generatedDiagnostic = {
              strengths: [],
              misconceptions: [],
              recommendedNextStep: ""
          };
          
          if (rawJson.finalScore >= 75) {
              generatedDiagnostic.strengths.push(`Excellent mastery of ${courseContext.moduleTitle}.`);
              generatedDiagnostic.misconceptions.push("Minor edge cases to refine.");
              generatedDiagnostic.recommendedNextStep = "Proceed to the next advanced module.";
          } else if (rawJson.finalScore >= 40) {
              generatedDiagnostic.strengths.push(`Basic understanding of ${courseContext.moduleTitle}.`);
              generatedDiagnostic.misconceptions.push("Struggled with intermediate application of the concepts.");
              generatedDiagnostic.recommendedNextStep = "Review the core examples before proceeding.";
          } else {
              generatedDiagnostic.strengths.push("Attempted the questions.");
              generatedDiagnostic.misconceptions.push(`Fundamental misunderstanding of ${courseContext.moduleTitle}.`);
              generatedDiagnostic.recommendedNextStep = "Please consult the AI Mentor for a deep dive explanation.";
          }

          navigate('/quiz-result', {
            state: {
              score: Math.round(rawJson.finalScore),
              correctAnswers: correctCount,
              totalQuestions: questions.length,
              timeTaken: 120,
              quizTitle: quizTitle,
              diagnostic: generatedDiagnostic
            }
          });
          return;
      }
      
      setQuestions(prev => [...prev, rawJson]);
      setCurrentQuestionIndex(prev => prev + 1);
      
    } catch (err) {
      console.error("Error fetching adaptive question:", err);
    }
    setIsLoading(false);
  };

  if (isLoading && questions.length === 0) {
    return (
      <MainLayout hideSidebar={true}>
        <div className="min-h-[calc(100vh-65px)] bg-slate-900 flex flex-col items-center justify-center text-white">
          <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 text-indigo-400 mb-4 animate-pulse">
            <Brain size={48} />
          </div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-primary-400" /> Initializing Adaptive Assessment...
          </h2>
        </div>
      </MainLayout>
    );
  }

  const question = questions[currentQuestionIndex];
  
  if (!question) return null; // Safe guard

  return (
    <MainLayout hideSidebar={true}>
      <div className="min-h-[calc(100vh-65px)] bg-slate-950 py-8 text-slate-100 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles size={10} /> Continuous Adaptive Test (CAT)
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{quizTitle}</h1>
              <p className="text-slate-400 text-xs mt-1">Question {currentQuestionIndex + 1}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MonitoringWidget minimal={true} />
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border bg-slate-800 text-slate-200 border-slate-700">
                 <span className="text-sm text-slate-400">Session ID:</span> <span className="text-primary-400">#{sessionId}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl mb-6 min-h-[380px]">

            <h2 className="text-lg md:text-xl font-semibold text-white mb-8 leading-relaxed">
              <span className="text-primary-400 font-bold mr-2">Q{currentQuestionIndex + 1}.</span>
              {question.text}
            </h2>

            <div className="space-y-3.5">
              {question.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}`}>
                      <strong className="text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</strong> {option}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary-400 bg-primary-500' : 'border-slate-700 group-hover:border-slate-500'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleNextAdaptiveQuestion}
              disabled={isLoading || !answers[currentQuestionIndex]}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm ${
                !answers[currentQuestionIndex] || isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-500'
              }`}
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Evaluating Answer...</>
              ) : (
                <>Submit & Get Next <ChevronRight size={18} /></>
              )}
            </button>
          </div>

        </div>
      </div>
      <MonitoringWidget />
    </MainLayout>
  );
};

export default QuizPage;
