import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Flame, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ showAuthLinks = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-xl shadow-md shadow-primary-900/50">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-300">
                SkillIntel
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {showAuthLinks && !user ? (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-bold text-xs px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-500 transition-colors shadow-md shadow-primary-900/50">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                  <span className="text-slate-400 font-semibold">Streak:</span>
                  <span className="font-extrabold text-orange-400 flex items-center gap-1">
                    <Flame size={14} className="text-orange-500" /> {user?.streak || 14} Days
                  </span>
                </div>

                <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-xl transition-colors border border-slate-800">
                  <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-200 hidden md:inline">{user?.name || 'Learner'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
