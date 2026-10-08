import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { mockUser } from '../data/mockData';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer 
} from 'recharts';
import { Target, Download, Share2, Briefcase, Code, BrainCircuit, MessageSquare, CheckCircle2 } from 'lucide-react';

const InterviewReadinessPage = () => {
  const readinessData = [
    { subject: 'Conceptual', A: 85, fullMark: 100 },
    { subject: 'Problem Solving', A: 75, fullMark: 100 },
    { subject: 'Coding', A: 65, fullMark: 100 },
    { subject: 'System Design', A: 40, fullMark: 100 },
    { subject: 'Communication', A: 90, fullMark: 100 },
  ];

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-indigo-900 rounded-3xl p-8 border border-indigo-800 shadow-lg relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <span className="text-sm font-bold text-indigo-300 bg-indigo-950/50 px-4 py-1.5 rounded-full inline-block mb-4 border border-indigo-700">
                AI Readiness Assessment
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Interview Readiness</h1>
              <p className="text-lg text-indigo-200 mb-8 max-w-xl">
                Based on your learning history, quiz performance, and coding practice, our AI has generated a comprehensive readiness profile for a <strong className="text-white">{mockUser.learningGoal}</strong> role.
              </p>
              <div className="flex gap-4">
                <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors hover:bg-indigo-50">
                  <Briefcase size={20} /> Start Mock Interview
                </button>
                <button className="bg-indigo-800 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-indigo-600 transition-colors">
                  <Download size={20} /> Export Report
                </button>
              </div>
            </div>
            
            <div className="md:w-1/3 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={552}
                    strokeDashoffset={552 - (552 * 72) / 100}
                    className="text-emerald-400 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black">72<span className="text-2xl text-indigo-300">%</span></span>
                  <span className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mt-1">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Radar Chart Analysis */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Target className="text-primary-500" size={20} /> Dimension Breakdown
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={readinessData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Readiness" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 space-y-3">
              {readinessData.map((data, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">{data.subject}</span>
                    <span className="text-slate-900">{data.A}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${data.A}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Modes & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BrainCircuit className="text-indigo-500" size={20} /> AI Recommendations
              </h3>
              <p className="text-slate-600 mb-6 text-sm">To reach an 85%+ readiness score, focus on the following personalized roadmap:</p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                    <Code className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Improve Coding Speed</h4>
                    <p className="text-sm text-slate-500 mt-1">Your logic is sound, but you take 20% longer than average on Medium difficulty problems. Practice timed challenges.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                    <Target className="text-amber-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Learn System Design Basics</h4>
                    <p className="text-sm text-slate-500 mt-1">System Design is your weakest area. Start the "Intro to Distributed Systems" course to boost this dimension.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mock Interview Modes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Available Mock Interviews</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Technical MCQ', desc: 'Rapid-fire conceptual questions.', icon: Target },
                  { title: 'Coding Interview', desc: 'Live algorithmic problem solving.', icon: Code },
                  { title: 'Scenario-Based', desc: 'System design and architecture.', icon: BrainCircuit },
                  { title: 'HR & Behavioral', desc: 'Soft skills and communication.', icon: MessageSquare }
                ].map((mode, idx) => (
                  <button key={idx} className="flex flex-col items-start p-4 border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
                    <mode.icon size={24} className="text-slate-400 group-hover:text-primary-600 mb-3" />
                    <h4 className="font-bold text-slate-900 mb-1">{mode.title}</h4>
                    <p className="text-xs text-slate-500">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewReadinessPage;
