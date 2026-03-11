import React, { useState } from 'react';
import { Bot, Play, Send, X, Building } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const AIInterviewer = () => {
  const { resumeAnalysis } = useResume();
  const { user } = useAuth();
  const [interviewCompany, setInterviewCompany] = useState('TCS');
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewDifficulty, setInterviewDifficulty] = useState('Medium');
  const [interviewTopics, setInterviewTopics] = useState(['DSA']);
  const [roundType, setRoundType] = useState('Technical'); // 'Technical' | 'Skills Test'
  const [interviewMessages, setInterviewMessages] = useState([]); // {type: 'bot'|'user', text}
  const [answer, setAnswer] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // New: question mode and local session management for algorithms + theory
  const [questionMode, setQuestionMode] = useState('Both'); // 'Algorithms' | 'Theory' | 'Both'
  const [sessionQuestions, setSessionQuestions] = useState([]); // [{id, type, question, correct}]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]); // [{question, correct, user, isCorrect, type}]
  const [interviewFinished, setInterviewFinished] = useState(false);

  // Static question banks with correct answers for deterministic evaluation
  const ALGO_QUESTIONS = [
    { id: 'a1', type: 'Algorithm', question: 'What is the average-case time complexity of quicksort?', correct: ['O(n log n)', 'n log n'] },
    { id: 'a2', type: 'Algorithm', question: 'What is the worst-case time complexity of binary search on a sorted array?', correct: ['O(log n)', 'log n'] },
    { id: 'a3', type: 'Algorithm', question: 'Which data structure is ideal to implement an LRU cache with O(1) get and put?', correct: ['hash map and doubly linked list', 'doubly linked list and hash map', 'hashmap and doubly linked list'] },
    { id: 'a4', type: 'Algorithm', question: 'What is the space complexity of merge sort?', correct: ['O(n)', 'n'] },
    { id: 'a5', type: 'Algorithm', question: 'What is the time complexity to insert into a binary heap?', correct: ['O(log n)', 'log n'] },
    { id: 'a6', type: 'Algorithm', question: 'What is the time complexity to search in a balanced BST like AVL/Red-Black?', correct: ['O(log n)', 'log n'] },
    { id: 'a7', type: 'Algorithm', question: 'Which algorithm finds the single-source shortest path on a graph with non-negative weights?', correct: ['dijkstra', "dijkstra's algorithm"] },
    { id: 'a8', type: 'Algorithm', question: 'Which algorithm is used for topological sorting?', correct: ['kahn', "kahn's algorithm", 'dfs topological sort', 'kahn algorithm'] }
  ];

  const THEORY_QUESTIONS = [
    { id: 't1', type: 'Theory', question: 'In databases, what does ACID’s C stand for?', correct: ['consistency'] },
    { id: 't2', type: 'Theory', question: 'Which normalization form removes transitive dependency?', correct: ['3nf', 'third normal form'] },
    { id: 't3', type: 'Theory', question: 'In OS, what is the difference between a process and a thread in one phrase?', correct: ['process is a program in execution, thread is a lightweight process', 'thread is a lighter unit of execution within a process'] },
    { id: 't4', type: 'Theory', question: 'What does the S in SOLID stand for?', correct: ['single responsibility principle', 'single responsibility'] },
    { id: 't5', type: 'Theory', question: 'Which SQL clause filters groups formed by GROUP BY?', correct: ['having'] },
    { id: 't6', type: 'Theory', question: 'In networking, which layer does TCP operate at?', correct: ['transport layer'] },
    { id: 't7', type: 'Theory', question: 'OOP: What is the concept of hiding internal details and exposing only essentials called?', correct: ['abstraction'] },
    { id: 't8', type: 'Theory', question: 'What is the primary benefit of indexing a column in a relational database?', correct: ['faster search', 'improve query performance', 'speed up lookups'] }
  ];

  function normalize(text) {
    return (text || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s\+]/g, '')
      .replace(/\s+/g, ' ');
  }

  function isAnswerCorrect(expected, given) {
    const givenNorm = normalize(given);
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    return expectedArray.some(exp => {
      const expNorm = normalize(exp);
      // Accept exact match or containment either way for short conceptual answers
      return givenNorm === expNorm || givenNorm.includes(expNorm) || expNorm.includes(givenNorm);
    });
  }

  const startInterview = async () => {
    setStarted(true);
    setInterviewFinished(false);
    setResponses([]);
    setInterviewMessages([]);
    setInterviewLoading(true);
    try {
      // Build session questions from selected mode
      const skills = (resumeAnalysis?.skills || []).slice(0, 15).join(', ');
      const mixBoth = questionMode === 'Both';
      const useAlgo = questionMode === 'Algorithms' || mixBoth;
      const useTheory = questionMode === 'Theory' || mixBoth;

      const pool = [];
      if (useAlgo) pool.push(...ALGO_QUESTIONS);
      if (useTheory) pool.push(...THEORY_QUESTIONS);

      // Shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      // Limit number of questions (e.g., 8)
      const numQuestions = Math.min(8, pool.length);
      const selected = pool.slice(0, numQuestions);
      setSessionQuestions(selected);
      setCurrentIndex(0);

      const greeting = `You are interviewing for ${interviewCompany} (${interviewRole}). Difficulty: ${interviewDifficulty}. Candidate skills: ${skills || 'N/A'}.`;
      const firstQ = selected[0];
      const text = `Let’s begin. Q1 (${firstQ.type}): ${firstQ.question}`;
      setInterviewMessages([{ type: 'bot', text: greeting }, { type: 'bot', text }]);
    } catch (e) {
      setInterviewMessages([{ type: 'bot', text: 'Unable to start interview right now. Please try again.' }]);
    } finally {
      setInterviewLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!answer.trim()) return;
    const userText = answer.trim();
    setAnswer('');
    setInterviewMessages(prev => [...prev, { type: 'user', text: userText }]);
    setInterviewLoading(true);
    try {
      // Evaluate current answer
      const q = sessionQuestions[currentIndex];
      if (!q) {
        setInterviewMessages(prev => [...prev, { type: 'bot', text: 'No active question. Please restart the interview.' }]);
        return;
      }
      const correct = isAnswerCorrect(q.correct, userText);
      const correctText = Array.isArray(q.correct) ? q.correct[0] : q.correct;
      const feedback = correct ? 'Correct.' : 'Incorrect.';

      const entry = { question: q.question, correct: correctText, user: userText, isCorrect: correct, type: q.type };
      setResponses(prev => [...prev, entry]);

      const nextIndex = currentIndex + 1;
      const nextPrefix = nextIndex < sessionQuestions.length ? `Q${nextIndex + 1} (${sessionQuestions[nextIndex].type}): ${sessionQuestions[nextIndex].question}` : 'Interview complete. See detailed results below.';

      const evalText = `${feedback} Correct answer: ${correctText}.`;
      setInterviewMessages(prev => [
        ...prev,
        { type: 'bot', text: evalText },
        { type: 'bot', text: nextPrefix }
      ]);

      setCurrentIndex(nextIndex);
      if (nextIndex >= sessionQuestions.length) {
        setInterviewFinished(true);
        // Persist interview result if authenticated
        try {
          if (user) {
            const total = sessionQuestions.length;
            const score = [...responses, entry].filter(r => r.isCorrect).length;
            await apiFetch('/api/user/interview-results', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ score, total, responses: [...responses, entry] })
            });
          }
        } catch {}
      }
    } catch (e) {
      setInterviewMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg mr-3">
          <Bot className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Job Interviewer</h1>
          <p className="text-gray-600">Practice interviews tailored to your target company and role</p>
        </div>
      </div>

      {/* Config */}
      <div className="card mb-6 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <select value={interviewCompany} onChange={(e) => setInterviewCompany(e.target.value)} className="input-field">
              {['TCS','Infosys','Wipro','HCL','Tech Mahindra','Amazon','Microsoft','Google','Flipkart','Paytm','Swiggy','Zomato'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input value={interviewRole} onChange={(e) => setInterviewRole(e.target.value)} className="input-field" placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select value={interviewDifficulty} onChange={(e) => setInterviewDifficulty(e.target.value)} className="input-field">
              {['Easy','Medium','Hard'].map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Round</label>
            <select value={roundType} onChange={(e) => setRoundType(e.target.value)} className="input-field">
              {['Technical','Skills Test'].map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Mode</label>
            <select value={questionMode} onChange={(e) => setQuestionMode(e.target.value)} className="input-field">
              {['Algorithms','Theory','Both'].map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Topics</label>
            <div className="flex flex-wrap gap-2">
              {['DSA','System Design','OOP','DBMS','Web','Cloud'].map(t => {
                const active = interviewTopics.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => setInterviewTopics(active ? interviewTopics.filter(x => x !== t) : [...interviewTopics, t])}
                    className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-primary-100 text-primary-800 border-primary-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                  >{t}</button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={startInterview} className="btn-primary flex items-center" disabled={interviewLoading}>
            <Play className="w-4 h-4 mr-2" />
            {started ? 'Restart Interview' : 'Start Interview'}
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="card animate-slide-up">
        <div className="px-1 py-2 border-b border-gray-200 dark:border-secondary-700 flex items-center justify-between">
          <div className="flex items-center">
            <Building className="w-5 h-5 text-primary-600 mr-2" />
            <div className="font-semibold text-gray-900 dark:text-gray-100">{interviewCompany} • {interviewRole} • {roundType}</div>
          </div>
          <button onClick={() => { setStarted(false); setInterviewMessages([]); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {interviewLoading && interviewMessages.length === 0 && (
            <div className="text-gray-600">Preparing interview…</div>
          )}
          {interviewMessages.map((m, i) => (
            <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg ${m.type === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-secondary-700 dark:text-gray-100 text-gray-800'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {!interviewMessages.length && !interviewLoading && (
            <div className="text-gray-600">Click "Start Interview" to begin.</div>
          )}
          {interviewFinished && (
            <div className="mt-4">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Results</div>
              {responses.length > 0 && (
                <div className="space-y-3">
                  <div className="text-gray-800 dark:text-gray-100">
                    Score: {responses.filter(r => r.isCorrect).length} / {responses.length}
                  </div>
                  <div className="space-y-2">
                    {responses.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Q{idx + 1} ({r.type})</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{r.question}</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Your answer:</span> {r.user}</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Correct answer:</span> {r.correct}</div>
                        <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${r.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.isCorrect ? 'Correct' : 'Incorrect'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-secondary-700">
          <div className="flex items-center space-x-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1 input-field"
              placeholder="Type your answer…"
              disabled={interviewLoading || !started || interviewFinished}
            />
            <button onClick={sendAnswer} className="btn-primary" disabled={interviewLoading || !answer.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewer;


