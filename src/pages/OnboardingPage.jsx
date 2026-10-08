import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Briefcase, Target, Code, BrainCircuit, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const SKILL_OPTIONS = [
  "Java", "Python", "React", "Node.js", "SQL", 
  "AWS", "Docker", "Kubernetes", "Linux", "Networking",
  "System Design", "Spring Boot", "Machine Learning"
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleStartDiagnostic = (e) => {
    e.preventDefault();
    if (!targetRole) return;
    
    setIsSubmitting(true);
    
    // In a real app, we'd save this to the DB.
    // For now, we navigate directly to the Proctored Diagnostic Assessment
    // passing the targetRole so the AI knows what questions to generate.
    setTimeout(() => {
      navigate('/diagnostic-assessment', {
        state: {
          currentRole,
          targetRole,
          currentSkills: selectedSkills
        }
      });
    }, 1000);
  };

  return (
    <MainLayout hideSidebar={true}>
      <div className="min-h-[calc(100vh-65px)] bg-slate-950 py-12 flex items-center justify-center font-sans px-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-400 mb-6 border border-primary-500/20">
              <BrainCircuit size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">AI Career Profiling</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Before we begin your journey, tell us where you are and where you want to be. 
              Our AI will build a rigorous, custom diagnostic assessment based on your target role.
            </p>
          </div>

          <form onSubmit={handleStartDiagnostic} className="space-y-8">
            
            {/* Current Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <Briefcase size={18} className="text-indigo-400" /> What is your current role?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Computer Science Student, Junior Developer"
                value={currentRole}
                onChange={e => setCurrentRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            {/* Target Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <Target size={18} className="text-rose-400" /> What is your TARGET role?
              </label>
              <input 
                type="text" 
                placeholder="e.g. Cloud Engineer, Senior Backend Engineer"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-semibold"
                required
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> 
                The diagnostic test will be strictly tailored to the skills required for this exact role.
              </p>
            </div>

            {/* Current Skills */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Code size={18} className="text-emerald-400" /> What skills do you already have? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        isSelected 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/80 text-sm">
              <ShieldCheck size={24} className="text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-400 block mb-1">Strict Proctoring Enabled</strong>
                The following diagnostic assessment requires webcam and screen focus permissions. Any suspicious activity will result in immediate termination of the test.
              </div>
            </div>

            <button
              type="submit"
              disabled={!targetRole || isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Initializing Secure Environment..." : "Begin Proctored Diagnostic"}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>

          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default OnboardingPage;
