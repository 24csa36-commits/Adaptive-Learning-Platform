import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { 
  Award, Clock, Target, CheckCircle2, XCircle, ArrowRight, 
  BookOpen, BrainCircuit, Sparkles, MessageSquareQuote, ShieldAlert 
} from 'lucide-react';

const QuizResultPage = () => {
  const location = useLocation();
  const result = location.state || {
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    timeTaken: 0,
    quizTitle: "Quiz Results",
    diagnostic: {
      strengths: ["No data available. Please complete a quiz."],
      misconceptions: ["No data available."],
      recommendedNextStep: "Return to the learning module to start a new quiz."
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const diagnostic = result.diagnostic || {
    strengths: ["Good grasp of algorithmic time complexities."],
    misconceptions: ["Review memory locality and pointer dereferencing trade-offs."],
    recommendedNextStep: "Clarify any lingering doubts with the 24/7 AI Mentor before starting Coding Practice."
  };

  const passed = result.score >= 70;

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase font-black tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 mb-2 inline-block">
            AI Adaptive Evaluation
          </span>
          <h1 className="text-3xl font-black text-slate-900">{result.quizTitle || "Knowledge Check Results"}</h1>
          <p className="text-slate-500 text-sm mt-1">Multi-Dimensional Performance & Conceptual Diagnosis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Score Card */}
          <div className="md:col-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="relative mb-4">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="10" fill="transparent"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * result.score) / 100}
                  className={`${result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-4xl font-black ${getScoreColor(result.score)}`}>{result.score}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Mastery</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {result.score >= 80 ? 'Exceptional Concept Mastery!' : result.score >= 60 ? 'Good Effort!' : 'Needs Conceptual Review'}
            </h2>
            <p className="text-slate-500 text-xs">
              {result.correctAnswers} out of {result.totalQuestions} questions answered accurately.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle2 size={20} /></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct</h3>
              </div>
              <p className="text-2xl font-black text-slate-900">{result.correctAnswers}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><XCircle size={20} /></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incorrect</h3>
              </div>
              <p className="text-2xl font-black text-slate-900">{result.totalQuestions - result.correctAnswers}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={20} /></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Taken</h3>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatTime(result.timeTaken)}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><Target size={20} /></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed / Question</h3>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {Math.round(result.timeTaken / (result.totalQuestions || 1))}s
              </p>
            </div>
          </div>
        </div>

        {/* AI Performance & Misconception Analysis */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Diagnostic Misconception Analysis</h2>
                <p className="text-xs text-slate-400">Targeted learning insights extracted from your quiz attempt</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" /> Groq AI Calibrated
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Validated Concepts
              </h3>
              <ul className="space-y-2">
                {diagnostic.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-amber-400 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ShieldAlert size={16} /> Misconceptions to Address
              </h3>
              <ul className="space-y-2">
                {diagnostic.misconceptions?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-indigo-950/70 rounded-2xl p-5 border border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <MessageSquareQuote size={16} className="text-indigo-400" /> Recommended Action
              </h3>
              <p className="text-indigo-200 text-xs">{diagnostic.recommendedNextStep}</p>
            </div>

            <Link 
              to="/ai-mentor" 
              state={{ initialPrompt: `Hi Mentor, in my recent quiz on "${result.quizTitle}", I struggled with: ${diagnostic.misconceptions?.[0] || 'memory concepts'}. Can you explain this with a clear intuitive example?` }}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/50 flex items-center gap-2"
            >
              Ask AI Mentor Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link to="/courses/1" className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-7 py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors">
            <BookOpen size={16} /> Review Course Syllabus
          </Link>
          <Link to="/coding" className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-lg shadow-primary-200">
            Proceed to Interactive Coding Practice <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </MainLayout>
  );
};

export default QuizResultPage;
