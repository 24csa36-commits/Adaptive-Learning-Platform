import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { 
  PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, 
  BookOpen, Code2, Sparkles, Activity, Send, Bot, User, Loader2 
} from 'lucide-react';
import { useMonitoring } from '../context/MonitoringContext';
import MonitoringWidget from '../components/MonitoringWidget';

const LearningPage = () => {
  const { courseId, lessonId } = useParams();
  const { startSession, closeSession } = useMonitoring();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);

  // Initialize Monitoring Session for Lesson
  useEffect(() => {
    startSession({ context: 'LEARNING', courseId: courseId || 1, lessonId: lessonId || 1 });
    return () => {
      closeSession();
    };
  }, [courseId, lessonId]);

  // Embedded AI Tutor & Notes State
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notes'
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: "Hello! I am your AI Lesson Mentor. Ask me any question about Arrays, memory layout, or time complexity as you watch!" 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem(`notes_${courseId || 1}`) || '');
  const chatEndRef = useRef(null);

  const [isAiVideoGenerating, setIsAiVideoGenerating] = useState(false);
  const [showAiVideo, setShowAiVideo] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/courses/${courseId || 1}?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setCourse(data);
        } else {
          throw new Error("Course not found");
        }
        setLoading(false);
      })
      .catch(err => {
        // Fallback default course structure
        setCourse({
          id: courseId || 1,
          title: "Data Structures and Algorithms",
          progress: 35,
          category: "Computer Science",
          modules: [
            {
              id: 1,
              title: "Arrays and Strings",
              lessons: [
                {
                  id: 1,
                  title: "Introduction to Arrays and Memory",
                  videoUrl: "https://www.youtube.com/embed/RBSGKlAvoiM",
                  content: "An array is a linear data structure that stores elements in contiguous memory locations. Because elements are sequential, the computer calculates the exact memory address in O(1) time using the formula: Base_Address + (Index * Element_Size)."
                },
                {
                  id: 2,
                  title: "Two Pointers Technique",
                  videoUrl: "https://www.youtube.com/embed/-2ttJAEuVLE",
                  content: "The Two Pointers technique reduces quadratic O(N²) nested loops down to linear O(N) by traversing sorted data from both boundaries simultaneously."
                }
              ]
            },
            {
              id: 2,
              title: "Linked Lists & Dynamic Nodes",
              lessons: [
                {
                  id: 3,
                  title: "Singly & Doubly Linked Lists",
                  videoUrl: "https://www.youtube.com/embed/WwfhLC16bis",
                  content: "Linked lists store elements (nodes) linked by pointers. Unlike arrays, nodes are dynamically allocated in heap memory and do not require contiguous memory."
                }
              ]
            }
          ]
        });
        setLoading(false);
      });
  }, [courseId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem(`notes_${courseId || 1}`, e.target.value);
  };

  const handleGenerateAIVideo = () => {
    setIsAiVideoGenerating(true);
    // Simulate AI Video generation
    setTimeout(() => {
      setIsAiVideoGenerating(false);
      setShowAiVideo(true);
    }, 3000);
  };

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const res = await fetch('http://localhost:8080/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Context: Lesson '${currentLesson?.title}'] ${userText}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.response }]);
      } else {
        throw new Error("AI request failed");
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: `Great question about ${currentLesson?.title}! Remember that arrays provide instant O(1) indexing because items are laid out sequentially in memory, enabling CPU cache pre-fetching.` 
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const currentModule = course?.modules?.[selectedModuleIdx] || course?.modules?.[0];
  const items = currentModule?.learningItems || currentModule?.lessons || [];
  const currentLesson = items[selectedLessonIdx] || items[0];

  return (
    <MainLayout hideSidebar={true}>
      <div className="flex h-[calc(100vh-65px)] overflow-hidden animated-bg text-slate-100 font-sans">
        
        {/* Left Sidebar - Curriculum */}
        <div className="w-80 glass-panel border-r border-slate-800 flex-col hidden lg:flex h-full relative z-10 rounded-r-none bg-slate-900/90">
          <div className="p-5 border-b border-slate-800 bg-slate-950/60">
            <Link to="/skills" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 mb-3 transition-colors">
              <ChevronLeft size={14} /> Back to Courses
            </Link>
            <h2 className="font-bold text-white text-base line-clamp-1 mb-2">{course?.title || 'Loading...'}</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-500 h-full rounded-full" style={{ width: `${course?.progress || 35}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-primary-400">{course?.progress || 35}%</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {course?.modules?.map((module, mIdx) => (
              <div key={module.id || mIdx}>
                <h3 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest pl-2">
                  Module {mIdx + 1}: {module.title}
                </h3>
                <ul className="space-y-1">
                  {(module.learningItems || module.lessons || []).map((lesson, lIdx) => {
                    const isCurrent = mIdx === selectedModuleIdx && lIdx === selectedLessonIdx;
                    return (
                      <li key={lesson.id || lIdx}>
                        <button 
                          onClick={() => {
                            setSelectedModuleIdx(mIdx);
                            setSelectedLessonIdx(lIdx);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                            isCurrent 
                              ? 'bg-primary-600/20 text-white border border-primary-500/40 shadow-sm' 
                              : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <PlayCircle size={16} className={`mt-0.5 shrink-0 ${isCurrent ? 'text-primary-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${isCurrent ? 'font-bold text-white' : 'font-medium'}`}>
                            {mIdx + 1}.{lIdx + 1} {lesson.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative custom-scrollbar">
          <div className="max-w-6xl w-full mx-auto p-6 lg:p-10 relative z-10 space-y-8">
            
            {/* Step Progress Tracker */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-400 text-primary-400 flex items-center justify-center text-xs font-bold">
                  <PlayCircle size={14} />
                </div>
                <span className="text-[9px] uppercase font-bold text-primary-400">Lesson</span>
              </div>
              <div className="w-10 h-[1px] bg-slate-700"></div>
              <Link to="/quiz" state={{ courseTitle: course?.title, moduleTitle: currentModule?.title, lessonContent: currentLesson?.content }} className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs">
                  <Activity size={14} />
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Quiz</span>
              </Link>
              <div className="w-10 h-[1px] bg-slate-700"></div>
              <Link to="/coding" className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs">
                  <Code2 size={14} />
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-400">Code</span>
              </Link>
            </div>

            {/* Video Player Header & Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <PlayCircle size={16} className="text-primary-400" /> Lesson Video
                </h2>
                <MonitoringWidget minimal={true} />
              </div>
              <button 
                onClick={handleGenerateAIVideo}
                disabled={isAiVideoGenerating || showAiVideo}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40 disabled:opacity-50 transition-all"
              >
                {isAiVideoGenerating ? (
                  <><Loader2 size={14} className="animate-spin" /> Generating Avatar...</>
                ) : showAiVideo ? (
                  <><CheckCircle2 size={14} /> AI Video Active</>
                ) : (
                  <><Sparkles size={14} /> Generate AI Avatar Summary</>
                )}
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
              {isAiVideoGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-purple-400 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <Bot size={48} className="animate-bounce relative z-10" />
                  </div>
                  <div className="text-sm font-bold flex flex-col items-center gap-1">
                    <span>Synthesizing AI Avatar...</span>
                    <span className="text-xs text-slate-500 font-normal">Processing script & rendering voiceover</span>
                  </div>
                </div>
              ) : currentLesson?.videoUrl ? (
                <iframe 
                  className="w-full h-full"
                  src={showAiVideo ? "https://www.youtube.com/embed/wybvI279EQ4?autoplay=1" : currentLesson.videoUrl} 
                  title={currentLesson.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold">
                  Video Stream Loading...
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  Lesson Note
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white mb-4">
                {currentLesson?.title || 'Lesson Overview'}
              </h1>
              
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <p>{currentLesson?.content}</p>
                
                <h3 className="text-base font-bold text-white pt-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> Architectural Highlights
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                    <span><strong>Contiguous Memory & Cache Locality:</strong> Enables sequential CPU cache line loading.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                    <span><strong>O(1) Direct Offset Access:</strong> Calculates address via Index * Type_Size instantly.</span>
                  </li>
                </ul>

                {/* Interactive Code Preview */}
                <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 mt-4 overflow-x-auto">
                  <div className="text-slate-500 mb-2">// Array O(1) Memory Addressing in Java</div>
                  <code>
                    <span className="text-indigo-400">int</span>[] items = <span className="text-indigo-400">new int</span>[<span className="text-amber-400">100</span>];<br />
                    items[<span className="text-amber-400">0</span>] = <span className="text-amber-400">42</span>; <span className="text-slate-500">// Instant base address write</span>
                  </code>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t border-slate-800 gap-4">
              <button 
                onClick={() => {
                  if (selectedLessonIdx > 0) setSelectedLessonIdx(prev => prev - 1);
                }}
                disabled={selectedLessonIdx === 0}
                className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous Lesson
              </button>
              
              <Link 
                to="/quiz" 
                state={{ 
                  courseTitle: course?.title, 
                  moduleTitle: currentModule?.title, 
                  lessonContent: currentLesson?.content
                }}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary-900/40 transition-all"
              >
                Proceed to Knowledge Check Quiz <ChevronRight size={16} />
              </Link>
            </div>

          </div>
        </div>

        {/* Right Sidebar - Live AI Lesson Chat & Notes */}
        <div className="w-96 glass-panel border-l border-slate-800 flex-col hidden xl:flex h-full relative z-10 rounded-l-none bg-slate-900/95">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat' 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} /> Live AI Tutor
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'notes' 
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} /> My Notes
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col h-[calc(100%-53px)]">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-xl bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin text-primary-400" />
                      <span>AI Mentor is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask doubt about this video..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiTyping}
                  className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="font-bold text-xs text-slate-300 mb-2">Lesson Notes (Auto-saved)</h3>
              <textarea 
                value={notes}
                onChange={handleNotesChange}
                placeholder="Take notes while watching the lesson..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none focus:border-primary-500 custom-scrollbar placeholder:text-slate-600"
              />
            </div>
          )}

        </div>

      </div>
      <MonitoringWidget />
    </MainLayout>
  );
};

export default LearningPage;
