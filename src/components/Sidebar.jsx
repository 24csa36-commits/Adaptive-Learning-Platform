import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, LogOut, Settings, LayoutDashboard, 
  Code, Lightbulb, PieChart, Award, FileText, CheckCircle2, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Skills', path: '/skills', icon: BookOpen },
    { name: '24/7 AI Mentor', path: '/ai-mentor', icon: Lightbulb },
    { name: 'FAANG Interview', path: '/interview', icon: CheckCircle2 },
    { name: 'Talent Passport', path: '/skill-report', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex font-sans text-slate-300">
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary-400' : 'text-slate-500'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1.5 bg-slate-950/50">
        <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
          <Settings size={18} className="text-slate-500" />
          <span>Profile & Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-left"
        >
          <LogOut size={18} className="text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
