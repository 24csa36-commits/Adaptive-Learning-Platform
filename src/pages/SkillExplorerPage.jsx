import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Clock, BookOpen, ChevronRight, PlayCircle, Sparkles } from 'lucide-react';

const SkillExplorerPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Dynamic Courses based on Learner's Target Role and Missing Skills
  const targetRole = user?.learningGoal || 'Full Stack Engineer';
  const knownSkills = user?.currentSkills || [];
  
  const [dbCourses, setDbCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real courses from backend
  React.useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCourses(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch courses", err);
        setLoading(false);
      });
  }, []);

  const getRoleRequiredSkills = (role) => {
    const r = role.toLowerCase();
    if (r.includes('cloud')) return ['AWS', 'Kubernetes', 'Terraform', 'Networking', 'Security', 'Docker'];
    if (r.includes('front') || r.includes('react')) return ['React', 'TypeScript', 'Tailwind', 'Web Vitals', 'State Management', 'Testing'];
    if (r.includes('data')) return ['SQL', 'Python', 'Machine Learning', 'Data Modeling', 'Statistics', 'Spark'];
    return ['System Design', 'Algorithms', 'Databases', 'API Design', 'Security', 'CI/CD'];
  };

  const requiredSkills = getRoleRequiredSkills(targetRole);
  
  // Filter out the ones they already know
  const missingSkills = requiredSkills.filter(skill => 
    !knownSkills.some(k => k.toLowerCase() === skill.toLowerCase())
  );

  // Use REAL courses that match what the user is missing
  // For now, since the DB only has Java Backend Fundamentals, we will just show the DB courses
  // if they match ANY missing skill, otherwise we don't show it.
  const recommendedCourses = dbCourses.filter(course => {
    // Basic recommendation logic: Does the course title/desc overlap with missing skills?
    const text = (course.title + " " + course.description).toLowerCase();
    return missingSkills.some(skill => text.includes(skill.toLowerCase())) || missingSkills.length > 0; // If they have missing skills, just recommend the backend courses for now since DB is small.
  });

  const categories = ['All', 'Computer Science', 'Backend Development', 'Role Required'];

  const filteredCourses = recommendedCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Skills</h1>
          <p className="text-slate-500 mt-2">Discover new courses and master technical skills to advance your career.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            />
          </div>
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 text-slate-500 border-r border-slate-200">
                <Filter size={18} /> <span className="text-sm font-medium">Filters</span>
              </div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex flex-col h-full group">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-1"><BookOpen size={16} className="text-slate-400" /> {course.modules?.length || 1} Modules</div>
                  <div className="flex items-center gap-1"><Clock size={16} className="text-slate-400" /> {course.duration}</div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 mt-auto">
                {course.progress > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-primary-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <Link to={`/courses/${course.id}`} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                      <PlayCircle size={18} /> Continue Learning
                    </Link>
                  </div>
                ) : (
                  <Link to={`/courses/${course.id}`} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    View Course <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            {missingSkills.length === 0 ? (
              <div className="space-y-3">
                <Sparkles className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="text-emerald-600 font-bold text-xl">You've mastered everything!</p>
                <p className="text-slate-500 font-medium">You already possess all the core skills required for a {targetRole}. We have no missing courses to recommend for you.</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 font-medium">No courses found matching your criteria.</p>
                <button onClick={() => {setSearchTerm(''); setActiveCategory('All');}} className="mt-4 text-primary-600 font-bold hover:underline">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default SkillExplorerPage;
