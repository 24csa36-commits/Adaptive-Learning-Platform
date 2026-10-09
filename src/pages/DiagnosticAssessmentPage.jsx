import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';
import MonitoringWidget from '../components/MonitoringWidget';
import ComputerVisionWebcam from '../components/ComputerVisionWebcam';

const DiagnosticAssessmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { startSession, closeSession, recordAnomaly } = useMonitoring();
  
  const { currentRole, targetRole, currentSkills } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Timer per question (e.g. 60 seconds)
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Anti-Cheat System
  const [warnings, setWarnings] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Initialize Monitoring Layer Session
  useEffect(() => {
    startSession({ context: 'ASSESSMENT', courseId: 1, lessonId: 1 });
    return () => {
      closeSession();
    };
  }, []);

  // 0. Real-time Computer Vision proctoring is managed by ComputerVisionWebcam component

  // 1. Fetch AI Diagnostic Questions based on Target Role
  useEffect(() => {
    if (!targetRole) {
      navigate('/onboarding');
      return;
    }

    const fetchDiagnosticTest = async () => {
      try {
        // Hitting our AI endpoint to generate a custom 10-question diagnostic test
        // Forcing strict JSON array return
        const prompt = `Generate a strict 10-question JSON array diagnostic test for a candidate who wants to become a '${targetRole}'. 
        They currently know: ${currentSkills?.join(', ')}. 
        Include topics like Networking, OS, and Cloud Platforms (or whatever is relevant to ${targetRole}). 
        Include difficulty levels (EASY, MEDIUM, HARD). 
        Format: [{"id":1,"text":"...","options":["A","B","C","D"],"correctAnswer":"A","topic":"OS","difficulty":"MEDIUM"}]`;

        const res = await fetch('http://localhost:8080/api/adaptive-quiz/generate-diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              targetRole: targetRole, 
              currentSkills: currentSkills?.join(', ') || 'None'
          })
        });
        
        const data = await res.json();
        // Since we hijack the adaptive endpoint, we parse the array
        const parsedQuestions = JSON.parse(data.response);
        
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        } else if (parsedQuestions && typeof parsedQuestions === 'object' && parsedQuestions.text) {
          setQuestions([parsedQuestions]);
        } else {
          throw new Error("Empty or invalid questions received from AI service");
        }
      } catch (err) {
        console.error("AI Generation failed, using robust fallback questions.", err);
        setQuestions([
          { id: 1, text: `What is the primary function of a Load Balancer in a ${targetRole} architecture?`, options: ["Database caching", "Distributing network traffic across healthy servers", "Encrypting client passwords", "Compiling production source code"], correctAnswer: "Distributing network traffic across healthy servers", topic: "Networking", difficulty: "EASY" },
          { id: 2, text: `Which OS concept is most critical for a ${targetRole} to manage memory and prevent out-of-memory crashes?`, options: ["Virtual Memory and Paging", "GUI Rendering Pipeline", "File Extension Association", "CSS Layout Engine"], correctAnswer: "Virtual Memory and Paging", topic: "OS", difficulty: "MEDIUM" },
          { id: 3, text: "How does CPU cache-line pre-fetching give Arrays an advantage over Linked Lists?", options: ["Contiguous memory enables fast sequential L1/L2 cache prefetching", "Arrays compress memory footprint automatically", "Linked lists require double CPU arithmetic cycles", "Arrays bypass RAM entirely"], correctAnswer: "Contiguous memory enables fast sequential L1/L2 cache prefetching", topic: "Data Structures", difficulty: "MEDIUM" },
          { id: 4, text: "What happens when two threads access a shared mutable variable without synchronization?", options: ["A compiler warning is generated", "Race conditions and inconsistent reads can occur", "The JVM terminates the process", "The operating system serializes access automatically"], correctAnswer: "Race conditions and inconsistent reads can occur", topic: "Concurrency", difficulty: "HARD" },
          { id: 5, text: "Which database index structure is most commonly used for fast range-based and equality queries in relational DBs?", options: ["B+ Tree", "Hash Table", "Binary Search Tree", "Linked List"], correctAnswer: "B+ Tree", topic: "Databases", difficulty: "MEDIUM" },
          { id: 6, text: "In RESTful API design, which HTTP method is considered idempotent and used to replace an entire resource?", options: ["PUT", "POST", "PATCH", "DELETE"], correctAnswer: "PUT", topic: "API Design", difficulty: "EASY" },
          { id: 7, text: "According to the CAP Theorem, what tradeoff must a distributed system make in the presence of a network partition?", options: ["Consistency vs Availability", "Latency vs Throughput", "Security vs Durability", "Concurrency vs Isolation"], correctAnswer: "Consistency vs Availability", topic: "Distributed Systems", difficulty: "HARD" },
          { id: 8, text: "What strategy effectively prevents the 'Cache Stampede' problem when an expensive cache key expires?", options: ["Mutex locking or probabilistic early expiration", "Increasing database query timeout", "Purging all related keys", "Doubling Redis memory allocation"], correctAnswer: "Mutex locking or probabilistic early expiration", topic: "Caching", difficulty: "HARD" },
          { id: 9, text: "What is the average time complexity of lookups in a well-balanced Hash Table?", options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], correctAnswer: "O(1)", topic: "Data Structures", difficulty: "EASY" },
          { id: 10, text: "What is the main benefit of containerizing applications using Docker in modern deployment pipelines?", options: ["Reproducible runtime environments across development and production", "Automatic database indexing", "Bypassing network security firewalls", "Eliminating all runtime memory allocation"], correctAnswer: "Reproducible runtime environments across development and production", topic: "DevOps", difficulty: "EASY" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosticTest();
  }, [targetRole, navigate, currentSkills]);

  // 2. Anti-Cheat: Visibility Change (Tab Switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isTerminated && !isLoading) {
        handleSuspiciousActivity("Tab switching or window minimized detected.");
      }
    };

    const handleBlur = () => {
      if (!isTerminated && !isLoading) {
        handleSuspiciousActivity("Window focus lost.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [warnings, isTerminated, isLoading]);

  const handleSuspiciousActivity = (reason) => {
    if (isTerminated) return;
    
    // Ingest anomaly to backend monitoring layer
    recordAnomaly('FOCUS_LOST', 3500, 'ANTI_CHEAT_SUSPICIOUS');

    const newWarnings = warnings + 1;
    setWarnings(newWarnings);
    
    if (newWarnings >= 3) {
      setIsTerminated(true);
      setShowWarningModal(false);
      closeSession();
    } else {
      setShowWarningModal(true);
      // Auto-hide warning after 3 seconds
      setTimeout(() => setShowWarningModal(false), 4000);
    }
  };

  // 3. Per-Question Timer
  useEffect(() => {
    if (isLoading || isTerminated || showWarningModal) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isTerminated, showWarningModal]);

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTimeLeft(60); // Reset timer for next question
    } else {
      handleSubmitDiagnostic();
    }
  };

  const handleSelectOption = (option) => {
    setAnswers({ ...answers, [currentQuestionIdx]: option });
  };

  const checkAnswerCorrect = (userAns, correctAns, options = []) => {
    if (!userAns || !correctAns) return false;
    const u = userAns.toString().trim();
    const c = correctAns.toString().trim();

    // 1. Direct case-insensitive equality
    if (u.toLowerCase() === c.toLowerCase()) return true;

    // 2. Normalized match (strip leading 'A.', 'B)', '(C)', etc.)
    const cleanU = u.toLowerCase().replace(/^[a-d][\.\)\:\-\s]+/i, '').trim();
    const cleanC = c.toLowerCase().replace(/^[a-d][\.\)\:\-\s]+/i, '').trim();
    if (cleanU && cleanC && cleanU === cleanC) return true;

    // 3. If correct answer is single letter (e.g. 'A' or 'B')
    const letterMatch = c.match(/^[A-D]$/i);
    if (letterMatch && options && options.length > 0) {
      const letterIdx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
      if (options[letterIdx]) {
        const optText = options[letterIdx].toString().trim();
        if (optText.toLowerCase() === u.toLowerCase()) return true;
        if (optText.toLowerCase().replace(/^[a-d][\.\)\:\-\s]+/i, '').trim() === cleanU) return true;
      }
    }

    // 4. If user selected answer is single letter
    const userLetterMatch = u.match(/^[A-D]$/i);
    if (userLetterMatch && options && options.length > 0) {
      const letterIdx = userLetterMatch[0].toUpperCase().charCodeAt(0) - 65;
      if (options[letterIdx]) {
        const optText = options[letterIdx].toString().trim();
        if (optText.toLowerCase() === c.toLowerCase()) return true;
        if (optText.toLowerCase().replace(/^[a-d][\.\)\:\-\s]+/i, '').trim() === cleanC) return true;
      }
    }

    // 5. Substring containment
    if (cleanC.length > 8 && cleanU.includes(cleanC)) return true;
    if (cleanU.length > 8 && cleanC.includes(cleanU)) return true;

    return false;
  };

  const handleSubmitDiagnostic = () => {
    // Evaluate performance with precise matching
    let correctCount = 0;
    const topicScores = {};

    questions.forEach((q, index) => {
      const userSelected = answers[index];
      const isCorrect = checkAnswerCorrect(userSelected, q.correctAnswer, q.options);
      if (isCorrect) correctCount++;

      const topic = q.topic || 'General';
      if (!topicScores[topic]) topicScores[topic] = { total: 0, correct: 0 };
      
      topicScores[topic].total++;
      if (isCorrect) topicScores[topic].correct++;
    });

    const diagnosticResult = {
      score: Math.round((correctCount / questions.length) * 100),
      correctCount,
      totalQuestions: questions.length,
      topicScores
    };

    // Mark the user as having completed the onboarding to unlock the dashboard
    if (updateProfile) {
       updateProfile({ 
           hasCompletedOnboarding: true,
           learningGoal: targetRole,
           currentSkills: currentSkills || [], diagnosticResult: diagnosticResult
       });
    }
    
    // Close monitoring session
    closeSession();
    
    navigate('/analytics', { state: { diagnosticResult } });
  };

  if (isLoading) {
    return (
      <MainLayout hideSidebar={true}>
        <div className="min-h-[calc(100vh-65px)] bg-slate-950 flex flex-col items-center justify-center text-white">
          <Brain className="text-primary-500 animate-pulse mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-2">Generating Dynamic Assessment</h2>
          <p className="text-slate-400">Tailoring 10+ questions for a {targetRole} profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (isTerminated) {
    return (
      <MainLayout hideSidebar={true}>
        <div className="min-h-[calc(100vh-65px)] bg-slate-950 flex flex-col items-center justify-center text-white p-4">
          <div className="bg-rose-950/50 border border-rose-500/30 p-10 rounded-3xl max-w-lg text-center">
            <ShieldAlert className="text-rose-500 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-black text-rose-500 mb-4">ASSESSMENT TERMINATED</h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              We detected repeated suspicious activity (switching tabs, losing window focus, or looking away from the camera). 
              To maintain the integrity of our verified profiles, your session has been restricted.
            </p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const question = questions[currentQuestionIdx];

  return (
    <MainLayout hideSidebar={true}>
      <div className="min-h-[calc(100vh-65px)] bg-slate-950 py-6 text-slate-100 font-sans">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex justify-between items-center shadow-lg">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md mb-2 inline-block border border-rose-400/20">
                  Strict Proctored Assessment
                </span>
                <h1 className="text-xl font-bold">Target: {targetRole}</h1>
              </div>
              
              <div className="flex items-center gap-6">
                <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl border ${timeLeft < 15 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  <Clock size={20} /> 00:{timeLeft.toString().padStart(2, '0')}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400">Question {currentQuestionIdx + 1} of {questions.length}</div>
                  <div className="text-xs text-slate-500">Topic: <span className="text-primary-400">{question?.topic || 'General'}</span></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl min-h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-xs font-bold px-2 py-1 rounded border ${
                  question?.difficulty === 'HARD' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                  question?.difficulty === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {question?.difficulty || 'MEDIUM'}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-8">{question?.text}</h2>

              <div className="space-y-3">
                {question?.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestionIdx] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/20 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{opt}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary-400 bg-primary-500' : 'border-slate-700'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Nav */}
            <div className="flex justify-end">
               <button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestionIdx]}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
               >
                 {currentQuestionIdx === questions.length - 1 ? "Submit Assessment" : "Next Question"}
               </button>
            </div>

          </div>

          {/* Right Sidebar: Webcam & Proctoring Status */}
          <div className="space-y-6">
            
            {/* Real-Time Computer Vision Proctor Feed */}
            <ComputerVisionWebcam 
              onAnomaly={recordAnomaly}
              onViolationStrike={(reason) => handleSuspiciousActivity(reason)}
              isActive={!isTerminated && !isLoading}
            />

            {/* Strike System */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg">
              <h3 className="font-bold text-sm text-slate-400 mb-4 uppercase tracking-wider">Integrity Status</h3>
              
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3].map(strike => (
                  <div key={strike} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                      warnings >= strike 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                        : 'bg-slate-800 border-slate-700 text-slate-600'
                    }`}>
                      X
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Strike {strike}</span>
                  </div>
                ))}
              </div>

              {warnings > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex gap-2 text-amber-400 text-xs mt-4 font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  Suspicious activity logged. You have {3 - warnings} warning(s) remaining.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Warning Overlay Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-500 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">
            <AlertTriangle className="text-amber-500 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-white mb-2">Warning Received</h3>
            <p className="text-slate-300 mb-6">
              You must remain on this tab and keep the window in focus. This action has been logged as Strike {warnings}. 
              Further violations will result in termination.
            </p>
            <div className="text-xs text-amber-500 font-bold animate-pulse">Resuming assessment...</div>
          </div>
        </div>
      )}

      {/* Live Monitoring HUD */}
      <MonitoringWidget />
    </MainLayout>
  );
};

export default DiagnosticAssessmentPage;
