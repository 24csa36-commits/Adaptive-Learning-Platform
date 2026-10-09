import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { mockCourses } from '../data/mockData';
import { 
  Flame, BookOpen, Target, Award, PlayCircle, 
  Activity, Code, PieChart, Lightbulb, CheckCircle2,
  BrainCircuit, ArrowRight, MessageSquare, Sparkles, ShieldCheck
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monitoringStats, setMonitoringStats] = useState({
    engagementScore: 94,
    monitoringCoverage: '98%',
    integrityStatus: 'VALIDATED'
  });

  useEffect(() => {
    fetch('http://localhost:8080/api/monitoring/users/1/latest-engagement')
      .then(res => res.json())
      .then(data => {
        if (data && (data.engagementScore !== undefined || data.monitoringCoverage)) {
          setMonitoringStats({
            engagementScore: data.engagementScore !== undefined ? Math.round(data.engagementScore) : 94,
            monitoringCoverage: data.monitoringCoverage || '98%',
            integrityStatus: data.integrityStatus || (data.engagementScore < 50 ? 'FLAGGED' : 'VALIDATED')
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        } else {
          throw new Error("Empty course list");
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Using Java course fallback for dashboard:", err);
        const javaCourse = mockCourses.find(c => c.title.toLowerCase().includes('java')) || mockCourses[0];
        setCourses([javaCourse]);
        setLoading(false);
      });
  }, [user]);

  const activeCourse = courses[0];
  const targetRoleName = user?.learningGoal || 'Full Stack Engineer';
  const isCloudRole = targetRoleName.toLowerCase().includes('cloud');
  const isFrontendRole = targetRoleName.toLowerCase().includes('frontend') || targetRoleName.toLowerCase().includes('react');
  
  const getDynamicWeakTopics = () => {
    if (user?.diagnosticResult?.topicScores) {
      const scores = user.diagnosticResult.topicScores;
      const calculatedGaps = Object.keys(scores)
        .filter(topic => (scores[topic].correct / scores[topic].total) < 0.7); // < 70% is a gap
      
      if (calculatedGaps.length >= 0) {
        return calculatedGaps.slice(0, 3);
      }
    }
    
    // Fallback if no actual gaps or no diagnostic result
    return isCloudRole ? ['VPC Peering', 'IAM Security', 'Kubernetes'] : 
           isFrontendRole ? ['React Suspense', 'State Management', 'Web Vitals'] : 
           ['Dynamic Programming', 'Graph Cycle Detection', 'Distributed Locking'];
  };

  const weakTopics = getDynamicWeakTopics();

  const workflowSteps = [
    { title: 'Learn', desc: 'Video Lessons', icon: BookOpen, path: `/learn/${activeCourse?.id || 1}/1`, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    { title: 'Quiz', desc: 'Adaptive MCQs', icon: Activity, path: '/quiz', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
    { title: 'AI Mentor', desc: '24/7 Doubt Bot', icon: MessageSquare, path: '/ai-mentor', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
    { title: 'Interview', desc: 'FAANG Scenario', icon: Award, path: '/interview', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen animated-bg text-slate-100 p-6 lg:p-10 relative overflow-hidden font-sans">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-8 rounded-3xl border border-slate-700/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white">
                  Welcome back, <span className="text-primary-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">{user?.name || 'Learner'}</span>! 👋
                </h1>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> {user?.skillLevel || 'Intermediate'}
                </span>
              </div>
              <p className="text-slate-300 text-sm">
                Target Role: <strong className="text-white">{user?.learningGoal || 'Full Stack Engineer'}</strong> • Focus on consistent daily practice.
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/30 flex items-center gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                <Flame className="text-orange-400 animate-pulse-slow" size={26} />
                <div>
                  <p className="text-[10px] text-orange-300/80 font-bold uppercase tracking-wider">Consistency Streak</p>
                  <p className="text-xl font-black text-orange-400">{user?.streak || 1} Days</p>
                </div>
              </div>

              <div className="bg-primary-500/10 px-5 py-3 rounded-2xl border border-primary-500/30 flex items-center gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <Target className="text-primary-400 animate-pulse-slow" size={26} />
                <div>
                  <p className="text-[10px] text-primary-300/80 font-bold uppercase tracking-wider">Hiring Bar Readiness</p>
                  <p className="text-xl font-black text-primary-400">{user?.overallReadiness || 75}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Linear Learning Workflow */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="text-primary-400" /> Pedagogical Learning Path
                  </h2>
                  <span className="text-xs text-slate-400">Step-by-Step Mastery</span>
                </div>
                
                <div className="glass-panel p-6 rounded-3xl relative border border-slate-700/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
                    {workflowSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <Link to={step.path} className="group relative flex flex-col items-center flex-1 w-full sm:w-auto">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 ${step.bg} border ${step.border} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 z-10`}>
                            <step.icon size={24} className={step.color} />
                          </div>
                          <h3 className="font-bold text-white text-xs text-center">{step.title}</h3>
                          <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider mt-0.5">{step.desc}</p>
                        </Link>
                        {idx < workflowSteps.length - 1 && (
                          <div className="hidden sm:flex items-center justify-center w-6 text-slate-600">
                            <ArrowRight size={16} className="animate-pulse-slow" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>

              {/* Continue Learning Course */}
              <section>
                <h2 className="text-lg font-bold text-white mb-4">Current Active Syllabus</h2>
                {activeCourse ? (
                  <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center group border border-slate-700/50 hover:border-primary-500/50 transition-colors">
                    <div className="w-full md:w-3/4">
                      <span className="text-[10px] font-bold text-primary-300 bg-primary-500/20 border border-primary-500/30 px-2.5 py-0.5 rounded-full mb-2.5 inline-block uppercase tracking-wider">
                        {activeCourse.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                        {activeCourse.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{activeCourse.description}</p>
                      
                      <div className="w-full bg-slate-800/50 rounded-full h-2 mb-2 border border-slate-700/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-indigo-400 h-full rounded-full" style={{ width: `${activeCourse.progress || 30}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{activeCourse.progress || 30}% Completed</p>
                    </div>

                    <div className="w-full md:w-1/4 flex justify-end">
                      <Link 
                        to={`/learn/${activeCourse.id}/1`} 
                        className="w-full md:w-auto bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      >
                        <PlayCircle size={18} /> Continue Lesson
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl p-8 text-center text-slate-400 border-dashed">
                    <p>No active courses found.</p>
                    <Link to="/skills" className="text-primary-400 font-bold hover:text-primary-300 mt-2 inline-block">Explore Skills →</Link>
                  </div>
                )}
              </section>

              {/* AI Diagnostic Plan */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lightbulb className="text-yellow-400 animate-pulse-slow" size={20} /> Adaptive Recommendations
                  </h2>
                </div>
                <div className="glass-panel rounded-3xl p-0 overflow-hidden border border-slate-700/50">
                  <ul className="divide-y divide-slate-800/50 text-xs">
                    <li className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                      <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">Two Pointers Technique Refinement</h4>
                        <p className="text-slate-400 mt-0.5">Recommended practice to reduce algorithmic time complexity from O(N²) to O(N).</p>
                      </div>
                      <Link 
                        to="/ai-mentor" 
                        state={{ initialPrompt: `Help me understand the Two Pointers Technique.` }}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Ask AI
                      </Link>
                    </li>
                    <li className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                      <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 text-indigo-400">
                        <Sparkles size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">Simulate FAANG Scenario Interview</h4>
                        <p className="text-slate-400 mt-0.5">Defend distributed concurrency locks and cache stampede solutions before the AI hiring panel.</p>
                      </div>
                      <Link to="/interview" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                        Start Mock
                      </Link>
                    </li>
                  </ul>
                </div>
              </section>

            </div>

            {/* Right Sidebar Area */}
            <div className="space-y-8">
              
              {/* Needs Attention / Weak Topics */}
              <div className="glass-panel border-rose-500/30 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm relative z-10">
                  <Activity className="text-rose-400" size={18} /> Diagnostic Focus Areas
                </h3>
                <div className="space-y-3 relative z-10 text-xs">
                  {weakTopics.length > 0 ? weakTopics.map((topic, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <span className="font-bold text-rose-200">{topic}</span><div className="flex gap-2"><a href={topic.toLowerCase().includes("java") ? "https://www.youtube.com/watch?v=grEKMHGYyns" : `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial")}`} target="_blank" rel="noreferrer" className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors flex items-center gap-1"><PlayCircle size={12} /> Watch Video</a>
                      <Link 
                        to="/ai-mentor" 
                        state={{ initialPrompt: `Explain ${topic} with clean step-by-step code and FAANG interview trade-offs.` }}
                        className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors"
                      >
                        Ask AI
                      </Link>
                      </div>
                    </div>
                  )) : ( <div className="text-emerald-400 font-bold p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2"><CheckCircle2 size={16} /> No critical skill gaps!</div> )}
                </div>
              </div>

              {/* Performance Mini-Stats */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm relative z-10">
                  <PieChart className="text-primary-400" size={18} /> Validated Proof-of-Work
                </h3>
                <div className="space-y-4 relative z-10 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">Concept Mastery</span>
                      <span className="font-bold text-emerald-400">88%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">Originality & Authorship</span>
                      <span className="font-bold text-primary-400">96%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
                <Link to="/skill-report" className="mt-6 block w-full text-center py-2.5 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 rounded-xl text-xs font-bold text-primary-300 transition-all">
                  Open Recruiter Talent Passport &rarr;
                </Link>
              </div>

              {/* Monitoring & Integrity Layer */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                    <ShieldCheck className="text-emerald-400" size={18} /> Monitoring & Integrity Layer
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {monitoringStats.integrityStatus}
                  </span>
                </div>
                
                <div className="space-y-4 relative z-10 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">Live Engagement Score</span>
                      <span className="font-bold text-emerald-400">{monitoringStats.engagementScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${monitoringStats.engagementScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-medium">Session Telemetry Coverage</span>
                      <span className="font-bold text-indigo-400">{monitoringStats.monitoringCoverage}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${parseInt(monitoringStats.monitoringCoverage) || 95}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-slate-400">Proctoring Telemetry</span>
                    <span className="text-slate-200 font-semibold">Continuous Behavioral Auditing</span>
                  </div>
                </div>

                <Link to="/analytics" className="mt-5 block w-full text-center py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 transition-all">
                  Inspect Engagement Analytics &rarr;
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
