import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, User, Mail, Lock, Target, AlertCircle, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: 'Full Stack Engineer',
    level: 'Intermediate'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.level,
      formData.goal
    );
    setLoading(false);

    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-900/50">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white">SkillIntel</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-white">
          Create Candidate Profile
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800 backdrop-blur-xl">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm rounded-xl py-2.5 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Alex Johnson"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm rounded-xl py-2.5 outline-none transition-all placeholder:text-slate-600"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm rounded-xl py-2.5 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Confirm Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm rounded-xl py-2.5 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Career Role</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Target className="h-4 w-4 text-slate-500" />
                  </div>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm rounded-xl py-2.5 outline-none transition-all"
                  >
                    <option>Full Stack Engineer</option>
                    <option>Backend / Distributed Systems</option>
                    <option>Frontend Specialist</option>
                    <option>Data / AI Engineer</option>
                    <option>FAANG SDE Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Starting Level</label>
                <div className="flex items-center gap-3 pt-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <label key={lvl} className="flex items-center cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="level"
                        value={lvl}
                        checked={formData.level === lvl}
                        onChange={handleChange}
                        className="h-3.5 w-3.5 text-primary-600 focus:ring-primary-500 bg-slate-950 border-slate-800"
                      />
                      <span className="ml-1.5">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-primary-900/40 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Register & Begin Learning'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
