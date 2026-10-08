import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Play, RotateCcw, Check, Terminal, Code2, AlertCircle, Clock, Bot, X } from 'lucide-react';

const CodingPracticePage = () => {
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your code here
  
}`);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (lang === 'JavaScript') {
      setCode(`function twoSum(nums, target) {\n  // Write your code here\n  \n}`);
    } else if (lang === 'Python') {
      setCode(`def twoSum(nums, target):\n    # Write your code here\n    pass`);
    } else if (lang === 'Java') {
      setCode(`class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`);
    } else if (lang === 'C++') {
      setCode(`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`);
    }
  };
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>.<br/><br/>You may assume that each input would have <strong><em>exactly one solution</em></strong>, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ]
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Running test cases via AI Evaluation...');
    
    fetch('http://localhost:8080/api/ai/evaluate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        language: language,
        problemDescription: problem.description
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsRunning(false);
      setOutput(data.response);
    })
    .catch(err => {
      setIsRunning(false);
      setOutput("Error connecting to AI evaluation service. Is the Spring Boot backend running?");
    });
  };

  const handleSubmit = () => {
    setShowAIModal(true);
    setAiQuestion("Great job passing the test cases! I see you used a Hash Map approach. Can you explain why you chose this data structure and what the time complexity of your solution is?");
  };

  const handleAIAnswerSubmit = () => {
    if(!userAnswer.trim()) return;
    setEvaluation("Evaluating...");
    
    fetch('http://localhost:8080/api/ai/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Evaluate this explanation for correctness: "${userAnswer}". The question was: "${aiQuestion}". Give very short feedback ending with 'Passed!' or 'Failed.'`
      })
    })
    .then(res => res.json())
    .then(data => {
      setEvaluation(data.response);
    })
    .catch(err => setEvaluation("Error connecting to AI Mentor service."));
  };

  return (
    <MainLayout hideSidebar={true}>
      <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-50">
        
        {/* Left Panel: Problem Description */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col h-full bg-white relative">
          
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Code2 className="text-primary-600" /> {problem.title}
            </h1>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full flex items-center gap-1 border border-slate-200">
                <Clock size={14} /> {formatTime(timeLeft)}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {problem.difficulty}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 prose prose-slate max-w-none prose-sm">
            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
            
            <h3 className="mt-8 font-bold text-slate-900">Examples</h3>
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="bg-slate-100 p-4 rounded-xl mb-4 text-sm font-mono text-slate-700 border border-slate-200">
                <p className="mb-1"><strong className="text-slate-900">Input:</strong> {ex.input}</p>
                <p className="mb-1"><strong className="text-slate-900">Output:</strong> {ex.output}</p>
                {ex.explanation && <p className="mt-2 text-slate-500 font-sans italic">Explanation: {ex.explanation}</p>}
              </div>
            ))}

            <h3 className="mt-8 font-bold text-slate-900">Constraints</h3>
            <ul className="bg-rose-50 text-rose-900 p-4 rounded-xl border border-rose-100 text-sm">
              {problem.constraints.map((c, i) => (
                <li key={i} className="font-mono">{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/2 flex flex-col h-full">
          {/* Editor Header */}
          <div className="h-14 border-b border-slate-700 bg-slate-900 flex justify-between items-center px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <select 
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-700 outline-none focus:border-primary-500"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play size={16} /> {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button onClick={handleSubmit} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-900/50">
                <Check size={16} /> Submit
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 bg-[#1e1e1e] relative">
            {/* Mock Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-slate-700 flex flex-col text-slate-500 text-sm py-4 items-end pr-3 select-none font-mono opacity-50">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="leading-6">{i + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-slate-200 font-mono text-sm p-4 pl-16 resize-none focus:outline-none leading-6 selection:bg-primary-900/50"
              spellCheck="false"
            />
          </div>

          {/* Output Console */}
          <div className="h-1/3 border-t border-slate-700 bg-slate-900 flex flex-col flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 text-slate-400 text-xs font-semibold tracking-wider">
              <Terminal size={14} /> TEST RESULTS
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-300 whitespace-pre-wrap">
              {output || 'Run your code to see results here.'}
            </div>
          </div>
        </div>

        {/* AI Follow-up Modal */}
        {showAIModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bot className="text-primary-600" /> AI Understanding Verification
                </h2>
                <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4 text-indigo-900 text-sm">
                <strong>AI Mentor:</strong> {aiQuestion}
              </div>

              {!evaluation ? (
                <>
                  <textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={4}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                    placeholder="Type your explanation here..."
                  ></textarea>
                  <button onClick={handleAIAnswerSubmit} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm">
                    Submit Explanation
                  </button>
                </>
              ) : (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${evaluation.includes("Passed") ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                  {evaluation.includes("Passed") ? <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 mt-1 animate-pulse"></div>}
                  <p className="text-sm font-semibold">{evaluation}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default CodingPracticePage;
