import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { 
  Download, Share2, Award, CheckCircle2, Zap, BrainCircuit, 
  Target, Briefcase, ShieldCheck, Flame, Github, Sparkles, Activity, Clock 
} from 'lucide-react';

const SkillReportPage = () => {
  const { user } = useAuth();
  
  // Fallbacks just in case
  const safeUser = user || {
      name: "Learner",
      email: "learner@example.com",
      skillLevel: "Intermediate",
      learningGoal: "Software Engineer",
      streak: 1,
      overallReadiness: 75
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert("Public Recruiter Talent Passport link copied to clipboard!");
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-900">Candidate Talent Passport</h1>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" /> Verifiable Proof of Work
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Multi-Dimensional Technical Evaluation & Behavioral Focus Metrics • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Share2 size={15} /> Share Passport Link
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-xs hover:bg-primary-700 transition-colors shadow-md shadow-primary-200"
            >
              <Download size={15} /> Export PDF Report
            </button>
          </div>
        </div>

        {/* Talent Passport Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Passport Header Banner */}
          <div className="bg-slate-950 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-800">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                {safeUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{safeUser.name}</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {safeUser.skillLevel}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mb-2">{safeUser.email}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-1.5"><Target size={14} className="text-indigo-400" /> {safeUser.learningGoal}</span>
                  <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-400" /> {safeUser.streak} Day Learning Habit</span>
                </div>
              </div>
            </div>
            
            <div className="text-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shrink-0">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Overall Recruiter Readiness</p>
              <p className="text-4xl font-black text-emerald-400">{safeUser.overallReadiness}%</p>
              <span className="text-[10px] font-bold text-emerald-500/80">FAANG Hiring Bar Certified</span>
            </div>
          </div>

          <div className="p-8 space-y-10">
            
            {/* The 4 Behavioral & Technical Intelligence Pillars */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Activity size={18} className="text-primary-600" /> Multi-Dimensional Competency Audit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Concept Mastery', score: 88, desc: 'Theory, time/space complexity', color: 'emerald' },
                  { label: 'Self-Learning Consistency', score: 95, desc: 'Daily habit & resilience', color: 'emerald' },
                  { label: 'Coding Stamina & Focus', score: 85, desc: 'Active problem-solving time', color: 'primary' },
                  { label: 'GitHub Proof-of-Work', score: 92, desc: 'Architecture & originality verified', color: 'emerald' },
                  { label: 'FAANG Scenario Interview', score: 90, desc: 'Architectural trade-off defense', color: 'indigo' },
                  { label: 'Communication Bar', score: 88, desc: 'Clarity in system design reasoning', color: 'primary' },
                ].map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-xs">{metric.label}</span>
                      <span className="font-black text-slate-900 text-xs">{metric.score}/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{metric.desc}</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${metric.score >= 90 ? 'bg-emerald-500' : 'bg-primary-600'}`} 
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified GitHub Projects Proof-of-Work */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Github size={20} className="text-white" />
                  <h3 className="font-bold text-sm">Verified GitHub Proof-of-Work Repositories</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> Authenticity Audited
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <h4 className="font-bold text-white">Task Management Web App (Full Stack)</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">React • State Lifecycles • REST API • High Originality (96%)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                      Comprehension Passed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Strengths & Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Zap size={16} className="text-amber-500" /> Validated Core Strengths
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>Deep conceptual grasp of memory locality, CPU cache lines, and contiguous array structures.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>Remarkable self-learning discipline ({safeUser.streak} consecutive active days).</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>Strong architectural reasoning under high concurrency in FAANG scenario interviews.</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <BrainCircuit size={16} className="text-indigo-500" /> Focus Roadmap for 99th Percentile
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <Target size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>Practice timed algorithmic optimization to improve problem-solving speed on Hard-level challenges.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <Target size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>Explore distributed lock leases (Redlock) and idempotency keys in distributed system designs.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center pt-4">
              <Link to="/interview-readiness" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-8 py-3 rounded-xl transition-all shadow-md">
                Back to Interview Readiness Dashboard
              </Link>
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default SkillReportPage;
