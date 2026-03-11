import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Filter, Search, Check, X, Play, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Aptitude = () => {
  const [questions, setQuestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Test mode
  const [testMode, setTestMode] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // id -> option index
  const [showResult, setShowResult] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const json = await apiFetch('/api/aptitude/questions');
        if (json?.success) {
          setQuestions(json.data || []);
          setFiltered(json.data || []);
        } else {
          setError('Failed to load questions');
        }
      } catch (e) {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let items = [...questions];
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      items = items.filter(q => q.question.toLowerCase().includes(k));
    }
    if (topic) {
      items = items.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
    }
    if (difficulty) {
      items = items.filter(q => q.difficulty === difficulty);
    }
    setFiltered(items);
  }, [questions, keyword, topic, difficulty]);

  const topics = useMemo(() => Array.from(new Set(questions.map(q => q.topic))), [questions]);
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const score = useMemo(() => {
    let s = 0;
    filtered.forEach(q => { if (answers[q.id] === q.answer) s += 1; });
    return s;
  }, [filtered, answers]);

  const resetTest = () => {
    setTestMode(false);
    setTestIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  useEffect(() => {
    if (testMode && showResult) {
      // persist if logged in
      (async () => {
        try {
          if (!user) return;
          const payloadAnswers = filtered.map(q => ({ id: q.id, chosen: answers[q.id] ?? null, correct: q.answer }));
          await apiFetch('/api/user/aptitude-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, total: filtered.length, answers: payloadAnswers })
          });
        } catch {}
      })();
    }
  }, [showResult]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg mr-3">
          <Brain className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Aptitude Practice</h1>
          <p className="text-gray-600">Quantitative, Logical, Verbal and DI questions with explanations</p>
        </div>
      </div>

      {/* Filters & Test Controls */}
      <div className="card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 flex items-center"><Filter className="w-4 h-4 mr-2" />{loading ? 'Loading…' : `${filtered.length} questions`}</div>
          <div className="flex items-center gap-2">
            {!testMode ? (
              <button className="btn-primary flex items-center" onClick={() => { setTestMode(true); setTestIndex(0); setShowResult(false); }} disabled={loading || filtered.length === 0}>
                <Play className="w-4 h-4 mr-2" /> Start Mock Test
              </button>
            ) : (
              <>
                {!showResult && (
                  <button className="btn-secondary" onClick={() => setShowResult(true)}>Finish</button>
                )}
                <button className="btn-secondary flex items-center" onClick={resetTest}><RotateCcw className="w-4 h-4 mr-1" /> Reset</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="input-field pl-9" placeholder="Type keywords..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input-field">
              <option value="">All</option>
              {topics.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
              <option value="">All</option>
              {difficulties.map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Test Mode */}
      {testMode ? (
        <div className="card animate-slide-up">
          {!showResult ? (
            (() => {
              const q = filtered[testIndex];
              if (!q) return <div className="text-gray-600">No question available.</div>;
              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">Question {testIndex + 1} of {filtered.length} • {q.topic} • {q.difficulty}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{q.question}</h3>
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, idx) => {
                      const chosen = answers[q.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                          className={`w-full text-left px-3 py-2 rounded border ${chosen ? 'bg-primary-100 border-primary-300 text-primary-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                        >
                          <span className="mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between">
                    <button className="btn-secondary" onClick={() => setTestIndex(i => Math.max(0, i - 1))}>Previous</button>
                    {testIndex < filtered.length - 1 ? (
                      <button className="btn-primary" onClick={() => setTestIndex(i => Math.min(filtered.length - 1, i + 1))}>Next</button>
                    ) : (
                      <button className="btn-primary" onClick={() => setShowResult(true)}>Finish</button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Result</h3>
              <p className="text-gray-700 mb-4">Score: {score} / {filtered.length}</p>
              <div className="space-y-4">
                {filtered.map((q) => {
                  const correctIdx = q.answer;
                  const chosenIdx = answers[q.id];
                  const isCorrect = chosenIdx === correctIdx;
                  return (
                    <div key={q.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{q.question}</h4>
                        {isCorrect ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="text-gray-700">Your answer: {typeof chosenIdx === 'number' ? `${String.fromCharCode(65 + chosenIdx)}. ${q.options[chosenIdx]}` : 'Not answered'}</div>
                        <div className="text-green-700">Correct answer: {String.fromCharCode(65 + correctIdx)}. {q.options[correctIdx]}</div>
                        <div className="text-gray-600 mt-1">Explanation: {q.explanation}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between">
                <div className="text-sm text-gray-600">{user ? 'Result saved to your profile.' : 'Login to save your result.'}</div>
                <button className="btn-secondary" onClick={resetTest}><RotateCcw className="w-4 h-4 mr-1" /> Restart</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Browse Mode
        <div className="space-y-4 animate-stagger">
          {loading && <div className="text-gray-600">Loading questions…</div>}
          {!loading && filtered.map((q) => (
            <div key={q.id} className="card">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                <span>{q.topic}</span>
                <span>{q.difficulty}</span>
              </div>
              <div className="text-gray-900 font-medium mb-3">{q.question}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="px-3 py-2 rounded bg-gray-50 border border-gray-200">
                    <span className="mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-700"><span className="font-medium">Answer:</span> {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</div>
              <div className="text-sm text-gray-600 mt-1"><span className="font-medium">Explanation:</span> {q.explanation}</div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="text-gray-600">No questions match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Aptitude;


