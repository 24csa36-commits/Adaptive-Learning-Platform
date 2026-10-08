import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { mockProjects } from '../data/mockData';
import { Briefcase, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const ProjectsPage = () => {
  const [filter, setFilter] = useState('All');

  const filteredProjects = mockProjects.filter(p => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Hands-on Projects</h1>
            <p className="text-slate-500 mt-2">Build real-world applications to solidify your skills and build your portfolio.</p>
          </div>
          
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            {['All', 'Not Started', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === status 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                  <Zap size={16} className={project.difficulty === 'Advanced' ? 'text-rose-500' : 'text-amber-500'} />
                  {project.difficulty}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">{project.description}</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map(skill => (
                      <span key={skill} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Clock size={16} className="text-slate-400" />
                  Estimated Time: {project.estimatedTime}
                </div>
              </div>

              {project.status === 'Completed' ? (
                <div className="w-full bg-slate-50 text-emerald-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2 border border-slate-100">
                  <CheckCircle2 size={18} /> View Submission
                </div>
              ) : (
                <Link to="/project-submit" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                  {project.status === 'In Progress' ? 'Continue Project' : 'Start Project'} <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No projects found for this status.</p>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ProjectsPage;
