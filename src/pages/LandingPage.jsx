import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Brain, Target, Activity, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { mockCourses } from '../data/mockData';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar showAuthLinks={true} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Learn Smarter. Practice Better. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Become Interview Ready.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            An AI-powered adaptive learning platform that personalizes learning, evaluates practical skills, and helps learners prepare for real-world technical interviews.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center justify-center gap-2">
              Start Learning <ArrowRight size={20} />
            </Link>
            <Link to="/skills" className="bg-white text-slate-700 px-8 py-3 rounded-full font-semibold text-lg hover:bg-slate-50 border border-slate-200 transition shadow-sm">
              Explore Skills
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
              {[
                { step: 'Assess', icon: Target, desc: 'Identify your current skill level' },
                { step: 'Learn', icon: Brain, desc: 'Personalized curriculum for you' },
                { step: 'Practice', icon: Activity, desc: 'Hands-on coding and projects' },
                { step: 'Analyze', icon: TrendingUp, desc: 'AI tracks your performance' },
                { step: 'Improve', icon: Award, desc: 'Get interview-ready' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white p-4 rounded-xl">
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.step}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Personalized Learning', desc: 'Curriculum that adapts to your pace and understanding.', icon: Brain },
              { title: 'AI Mentor', desc: '24/7 AI assistant to answer questions and clarify concepts.', icon: Target },
              { title: 'Learning Analytics', desc: 'Deep insights into your strengths and weak areas.', icon: TrendingUp },
              { title: 'Practical Assessments', desc: 'Real-world scenarios and hands-on coding tests.', icon: Activity },
              { title: 'Interview Readiness', desc: 'Mock interviews tailored to top tech company standards.', icon: Award },
            ].map((feat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <feat.icon className="h-10 w-10 text-primary-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-slate-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Skills */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Skills to Master</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <div key={course.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-primary-500 transition-colors">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-xs font-medium px-3 py-1 bg-slate-700 rounded-full text-slate-300">
                      {course.difficulty}
                    </span>
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 text-sm font-semibold flex items-center gap-1">
                      Start <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
