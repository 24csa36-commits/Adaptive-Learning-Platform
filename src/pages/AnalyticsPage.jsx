import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { mockAnalytics } from '../data/mockData';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { TrendingUp, Clock, Activity, Target, Brain, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [dbCourses, setDbCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCourses(data);
      })
      .catch(err => console.error(err));
  }, []);
  
  const location = useLocation();
  const diagnosticResult = location.state?.diagnosticResult;

  // Dynamic Skill Gap Data based on Onboarding
  const targetRole = user?.learningGoal || 'Junior Backend Engineer';
  const knownSkills = user?.currentSkills || [];
  
  const getRoleRequiredSkills = (role) => {
    const r = role.toLowerCase();
    if (r.includes('cloud')) return ['AWS', 'Kubernetes', 'Terraform', 'Networking', 'Security', 'Docker'];
    if (r.includes('front') || r.includes('react')) return ['React', 'TypeScript', 'Tailwind', 'Web Vitals', 'State Management', 'Testing'];
    if (r.includes('data')) return ['SQL', 'Python', 'Machine Learning', 'Data Modeling', 'Statistics', 'Spark'];
    return ['System Design', 'Algorithms', 'Databases', 'API Design', 'Security', 'CI/CD'];
  };

  const requiredSkills = getRoleRequiredSkills(targetRole);

  const radarData = requiredSkills.map(skill => {
    let currentScore = 10;
    
    if (diagnosticResult?.topicScores) {
       // Look for this skill in the topic scores
       const foundTopicKey = Object.keys(diagnosticResult.topicScores).find(t => t.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(t.toLowerCase()));
       if (foundTopicKey) {
           const scoreStats = diagnosticResult.topicScores[foundTopicKey];
           currentScore = (scoreStats.correct / scoreStats.total) * 100;
       } else {
           // Topic wasn't tested, fallback to known skills
           currentScore = knownSkills.some(k => k.toLowerCase() === skill.toLowerCase()) ? 70 : 10;
       }
    } else {
       // Original mock logic fallback if no diagnostic taken right now
       const knowsIt = knownSkills.some(k => k.toLowerCase() === skill.toLowerCase());
       currentScore = knowsIt ? 85 : Math.floor(Math.random() * 20) + 10;
    }

    return {
      subject: skill,
      current: currentScore,
      target: 85,
      fullMark: 100
    };
  });
  
  const weakTopics = radarData.filter(d => d.target - d.current > 20);

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Analytics</h1>
            <p className="text-slate-500 mt-2">Track your progress, identify patterns, and optimize your study habits.</p>
          </div>
          <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl font-semibold border border-primary-100 flex items-center gap-2">
            <Target size={20} /> Overall Progress: {user?.overallReadiness || 75}%
          </div>
        </div>

        {/* Diagnostic Results Banner */}
        {diagnosticResult && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="bg-emerald-500 text-white p-4 rounded-full flex-shrink-0">
              <Award size={36} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-900 mb-2">Diagnostic Complete!</h2>
              <p className="text-emerald-800">
                You scored <strong className="text-emerald-900 text-lg">{diagnosticResult.score.toFixed(0)}%</strong> overall 
                ({diagnosticResult.correctCount} out of {diagnosticResult.totalQuestions} correct). 
                We have analyzed your answers and plotted your true skill gaps below.
              </p>
            </div>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Time Spent', value: '42h 15m', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Quiz Avg Score', value: '85%', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Code Challenges', value: '34 Completed', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Current Streak', value: `${user?.streak || 1} Days`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Learning Consistency Line Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-primary-500" size={20} /> Learning Consistency (Hours/Day)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAnalytics.learningConsistency} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 8, stroke: '#bfdbfe', strokeWidth: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Mastery Radar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Brain className="text-indigo-500" size={20} /> Skill Gap Analysis
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  
                  {/* Target Outline (Gray dashed) */}
                  <Radar name={`Target (${targetRole})`} dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  
                  {/* Current Mastery (Indigo filled) */}
                  <Radar name="Current Mastery" dataKey="current" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                  
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Diagnostic Action Plan */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Target className="text-rose-500" size={28} /> Diagnostic Report & Action Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weaknesses / What you lack */}
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
                <Activity className="text-rose-600" size={20} /> Critical Skill Gaps
              </h3>
              <p className="text-rose-800 text-sm mb-4">Based on your assessment, you lack proficiency in the following core areas required for a {targetRole}:</p>
              <ul className="space-y-3">
                {weakTopics.length > 0 ? weakTopics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                    <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0 mt-0.5">!</div>
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <span className="font-bold text-slate-800 block">{topic.subject}</span>
                        <span className="text-xs text-slate-500">Gap: {topic.target - topic.current}% below target</span>
                      </div>
                      <a 
                         href={topic.subject.toLowerCase().includes('java') ? "https://www.youtube.com/watch?v=grEKMHGYyns" : `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.subject + " tutorial")}`}
                         target="_blank" rel="noreferrer"
                         className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors whitespace-nowrap"
                      >
                         Watch Video
                      </a>
                    </div>
                  </li>
                )) : (
                  <li className="text-emerald-600 font-bold">You have no critical gaps for this role! Great job!</li>
                )}
              </ul>
            </div>

            {/* Action Plan */}
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20} /> Immediate Next Steps
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-indigo-900 text-sm"><strong className="block">Review Core Theory</strong> Brush up on the fundamental concepts of {weakTopics[0]?.subject || 'your weakest topic'}.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-indigo-900 text-sm"><strong className="block">Complete Recommended Modules</strong> Finish the curated video lessons below tailored to your gaps.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <p className="text-indigo-900 text-sm"><strong className="block">Re-evaluate</strong> Take a focused mini-quiz in 48 hours to measure improvement.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="mt-8">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-emerald-500" size={20} /> Curated Courses to Bridge Your Gap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbCourses.length > 0 ? dbCourses.map((course, i) => (
                <Link to={`/courses/${course.id}`} key={course.id || i} className="border border-slate-200 rounded-xl p-5 hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group block">
                  <div className="text-xs font-bold text-primary-600 bg-primary-50 inline-block px-2 py-1 rounded mb-2">{course.category || 'Specialization'}</div>
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-primary-600">{course.title}</h4>
                  <p className="text-slate-500 text-sm flex items-center gap-1"><Clock size={14} /> {course.duration || 'Self-paced'}</p>
                </Link>
              )) : (
                <p className="text-slate-500 text-sm col-span-3">No specialized courses available right now.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
