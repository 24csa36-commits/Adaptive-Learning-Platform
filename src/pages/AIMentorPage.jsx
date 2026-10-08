import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Send, User, Bot, Sparkles, Code2, HelpCircle, FileText, Loader2 } from 'lucide-react';

const AIMentorPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const initialPromptFromQuiz = location.state?.initialPrompt;

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: `Hi ${user?.name || 'Learner'}! I'm your 24/7 AI Mentor, powered by Groq Llama 3. Ask me any conceptual doubt, algorithmic edge case, or system design trade-off!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = [
    { text: "Can you explain CPU cache lines & contiguous memory simply?", icon: HelpCircle },
    { text: "How does the Two Pointers technique achieve O(1) space?", icon: FileText },
    { text: "Why is Linked List traversal slower on modern CPUs?", icon: HelpCircle },
    { text: "Show me a Java/Python example of Redis inventory lock", icon: Code2 },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  // If redirected with a specific quiz misconception prompt, auto-send or set input
  useEffect(() => {
    if (initialPromptFromQuiz) {
      handleSendMessage(initialPromptFromQuiz);
    }
  }, [initialPromptFromQuiz]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query || !query.trim() || isTyping) return;

    const trimmed = query.trim();
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8080/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: data.response 
        }]);
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      // Fallback pedagogical reply
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: `Here is the key architectural insight regarding "${trimmed}": In high-performance software systems, memory access patterns dominate latency. Contiguous structures like Arrays benefit from spatial locality in CPU L1/L2 caches, while pointer-heavy structures incur cache misses.` 
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-65px)] bg-slate-950 text-slate-100 overflow-hidden font-sans">
        
        {/* Chat Main Window */}
        <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto border-x border-slate-800 bg-slate-900/60">
          
          {/* Top Bar */}
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600/20 border border-primary-500/30 p-2 rounded-xl text-primary-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm md:text-base">24/7 AI Pedagogical Mentor</h1>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Groq Llama 3 Online • Ready to chat
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user' ? 'bg-primary-600 text-white font-bold text-xs' : 'bg-slate-800 border border-slate-700 text-primary-400'
                  }`}>
                    {msg.sender === 'user' ? (user?.name?.charAt(0).toUpperCase() || 'U') : <Bot size={16} />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 text-primary-400 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 size={14} className="animate-spin text-primary-400" />
                    <span>AI Mentor is preparing explanation...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Chat Input Area */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            
            {/* Quick Prompt Pills */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1">
              {suggestedQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sq.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap transition-colors"
                >
                  <sq.icon size={13} className="text-primary-400" /> {sq.text}
                </button>
              ))}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your coding doubt or conceptual question here..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-primary-600 hover:bg-primary-500 text-white h-11 w-11 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Sidebar - Candidate Context */}
        <div className="w-80 bg-slate-900/80 border-l border-slate-800 hidden xl:block p-6">
          <h2 className="font-bold text-white mb-6 flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-primary-400" /> Active Learner Context
          </h2>
          
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Candidate</h3>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-white font-semibold">
                {user?.name || 'Learner'} ({user?.skillLevel || 'Intermediate'})
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Role</h3>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-indigo-300 font-semibold">
                {user?.learningGoal || 'Full Stack Engineer'}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Focus Areas</h3>
              <ul className="space-y-2">
                {['Two Pointers Optimization', 'Contiguous Memory Caching', 'Distributed Redlock'].map((topic, idx) => (
                  <li key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-xl font-medium">
                    • {topic}
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

export default AIMentorPage;
