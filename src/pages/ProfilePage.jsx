import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { mockUser, mockCourses } from '../data/mockData';
import { Mail, Target, Award, Flame, BookOpen, Settings, Edit3 } from 'lucide-react';

const ProfilePage = () => {
  const completedCourses = mockCourses.filter(c => c.progress === 100);

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-indigo-600"></div>
          
          <div className="relative mt-12 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="h-32 w-32 bg-white rounded-full p-2 shadow-lg border border-slate-100 flex-shrink-0">
              <div className="h-full w-full bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-700">
                {mockUser.name.charAt(0)}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-slate-900">{mockUser.name}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 mt-2 text-slate-600">
                <span className="flex items-center gap-1"><Mail size={16} /> {mockUser.email}</span>
                <span className="flex items-center gap-1"><Target size={16} /> {mockUser.learningGoal}</span>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
              <Settings size={18} /> Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Learning Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Skill Level</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                    {mockUser.skillLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Learning Streak</span>
                  <span className="font-semibold text-orange-600 flex items-center gap-1">
                    {mockUser.streak} Days <Flame size={16} className="text-orange-500" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Overall Readiness</span>
                  <span className="font-semibold text-primary-600">{mockUser.overallReadiness}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Current Focus</h3>
              <div className="flex flex-wrap gap-2">
                {mockUser.skillsLearning.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Achievements & Courses */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="text-amber-500" size={20} /> Recent Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockUser.achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-4 p-4 border border-amber-100 bg-amber-50 rounded-xl">
                    <span className="text-3xl">{ach.icon}</span>
                    <span className="font-semibold text-amber-900">{ach.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Courses */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-primary-500" size={20} /> Completed Courses
              </h3>
              {completedCourses.length > 0 ? (
                <div className="space-y-4">
                  {completedCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                      <div>
                        <h4 className="font-bold text-slate-900">{course.title}</h4>
                        <p className="text-sm text-slate-500">{course.category}</p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                        Completed <Award size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">You haven't completed any courses yet. Keep learning!</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
