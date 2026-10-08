import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Clock, BookOpen, Target, CheckCircle2, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/courses/${id || 1}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        if (data?.modules?.length > 0) {
          setExpandedModule(data.modules[0].id);
        }
      })
      .catch(err => console.error("Error fetching course", err));
  }, [id]);

  const toggleModule = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  if (!course) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center text-slate-500 font-bold">Loading Course Details...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Course Header Info */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full inline-block mb-6 border border-primary-100">
              {course.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{course.title}</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2"><Target size={20} className="text-slate-400" /> Difficulty: <span className="text-slate-900">{course.difficulty}</span></div>
              <div className="flex items-center gap-2"><Clock size={20} className="text-slate-400" /> Duration: <span className="text-slate-900">{course.duration}</span></div>
              <div className="flex items-center gap-2"><BookOpen size={20} className="text-slate-400" /> Modules: <span className="text-slate-900">{course.modules?.length || 0}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to={`/learn/${course.id}/1`} className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-200">
                <PlayCircle size={22} /> {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
              </Link>
              {course.progress > 0 && (
                <div className="w-full sm:w-auto flex-1 max-w-xs flex items-center gap-4 px-4">
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-700">{course.progress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Syllabus Area */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Course Syllabus</h2>
            <div className="space-y-4">
              {course.modules.map((module, idx) => {
                const isExpanded = expandedModule === module.id;
                return (
                  <div key={module.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                    >
                      <div>
                        <span className="text-xs font-bold text-indigo-600 mb-1 block">MODULE {idx + 1}</span>
                        <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-sm font-medium">{(module.learningItems || module.lessons || []).length} Items</span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
                        <ul className="space-y-2 mt-2">
                          {(module.learningItems || module.lessons || []).map((lessonItem, lIdx) => (
                            <li key={lIdx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3">
                                <PlayCircle size={18} className={lIdx === 0 && idx === 0 ? "text-primary-600" : "text-slate-300 group-hover:text-primary-400"} />
                                <span className={`text-sm font-medium ${lIdx === 0 && idx === 0 ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                                  {lessonItem?.title || `Lesson ${lIdx + 1} Details`}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">10 min</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Learning Outcomes</h3>
              <ul className="space-y-4">
                {[
                  'Master core concepts and principles',
                  'Build real-world practical projects',
                  'Solve technical interview questions',
                  'Understand best practices and design patterns'
                ].map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default CourseDetailsPage;
