import React, { useEffect, useMemo, useState } from 'react';
import { Code2, ExternalLink, Filter, Search, CheckCircle } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

// Fallback curated set if API fails
const CURATED = [
  { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', tags: ['array', 'hash table'], companies: ['Amazon', 'Microsoft', 'Flipkart'], url: 'https://leetcode.com/problems/two-sum/' },
  { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', tags: ['stack', 'string'], companies: ['TCS', 'Infosys', 'Wipro'], url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', tags: ['linked list', 'two pointers'], companies: ['HCL', 'Tech Mahindra'], url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', tags: ['array', 'two pointers', 'sliding window'], companies: ['Amazon', 'Goldman Sachs'], url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', tags: ['binary search', 'array'], companies: ['Google', 'Microsoft'], url: 'https://leetcode.com/problems/binary-search/' },
  { id: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tags: ['hash table', 'sliding window', 'string'], companies: ['Amazon', 'Adobe', 'Uber'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: '3sum', title: '3Sum', difficulty: 'Medium', tags: ['two pointers', 'array', 'sorting'], companies: ['Microsoft', 'Google'], url: 'https://leetcode.com/problems/3sum/' },
  { id: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium', tags: ['linked list', 'math'], companies: ['Flipkart', 'Paytm'], url: 'https://leetcode.com/problems/add-two-numbers/' },
  { id: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium', tags: ['hash table', 'string', 'sorting'], companies: ['Amazon', 'Swiggy', 'Zomato'], url: 'https://leetcode.com/problems/group-anagrams/' },
  { id: 'word-break', title: 'Word Break', difficulty: 'Medium', tags: ['dp', 'string'], companies: ['Microsoft', 'Google'], url: 'https://leetcode.com/problems/word-break/' },
  { id: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', difficulty: 'Medium', tags: ['tree', 'dfs'], companies: ['TCS', 'Wipro'], url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  { id: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium', tags: ['array', 'dp'], companies: ['Infosys', 'HCL'], url: 'https://leetcode.com/problems/maximum-subarray/' },
  { id: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium', tags: ['graph', 'bfs', 'dfs', 'topological sort'], companies: ['Amazon', 'Microsoft'], url: 'https://leetcode.com/problems/course-schedule/' },
  { id: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', tags: ['hash table', 'design'], companies: ['Google', 'Amazon', 'Flipkart'], url: 'https://leetcode.com/problems/lru-cache/' },
  { id: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['binary search', 'array', 'divide and conquer'], companies: ['Google', 'Microsoft'], url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { id: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard', tags: ['bfs', 'graph'], companies: ['Amazon', 'Microsoft'], url: 'https://leetcode.com/problems/word-ladder/' },
  { id: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard', tags: ['hash table', 'sliding window', 'string'], companies: ['Google', 'Adobe', 'Uber'], url: 'https://leetcode.com/problems/minimum-window-substring/' },
  { id: 'n-queens', title: 'N-Queens', difficulty: 'Hard', tags: ['backtracking'], companies: ['TCS', 'Infosys'], url: 'https://leetcode.com/problems/n-queens/' },
  { id: 'shortest-path-in-binary-matrix', title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', tags: ['bfs', 'grid', 'graph'], companies: ['Amazon'], url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/' },
  { id: 'subarray-sum-equals-k', title: 'Subarray Sum Equals K', difficulty: 'Medium', tags: ['array', 'hash table', 'prefix sum'], companies: ['Microsoft', 'Google'], url: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
];

// Normalize LeetCode tag names to our canonical tags used in filters/quick categories
function normalizeTagName(name) {
  if (!name) return '';
  const n = name.toLowerCase().trim();
  // Strip common parentheses content
  const stripped = n.replace(/\s*\([^\)]*\)\s*/g, '').trim();
  // Synonyms and canonical shorthands
  if (stripped === 'dynamic programming') return 'dp';
  if (stripped === 'breadth-first search') return 'bfs';
  if (stripped === 'depth-first search') return 'dfs';
  if (stripped === 'priority queue') return 'heap';
  if (stripped === 'heap') return 'heap';
  if (stripped === 'hashmap') return 'hash table';
  if (stripped === 'binary tree' || stripped === 'n-ary tree') return 'tree';
  if (stripped === 'two-pointer' || stripped === 'two pointer') return 'two pointers';
  return stripped;
}

const SKILL_TO_TAGS = {
  'dsa': ['array', 'string', 'linked list', 'stack', 'queue', 'tree', 'graph', 'heap', 'two pointers', 'sliding window', 'binary search', 'dp', 'backtracking', 'greedy', 'math', 'bit manipulation', 'hash table'],
  'data structures': ['array', 'string', 'linked list', 'stack', 'queue', 'tree', 'graph', 'heap', 'hash table'],
  'algorithms': ['two pointers', 'sliding window', 'binary search', 'dp', 'backtracking', 'greedy', 'math', 'bit manipulation'],
  'javascript': ['string', 'array', 'hash table', 'two pointers', 'sliding window'],
  'typescript': ['string', 'array', 'hash table'],
  'python': ['string', 'array', 'hash table', 'dp', 'backtracking'],
  'java': ['string', 'array', 'hash table', 'dp', 'graph'],
  'c++': ['string', 'array', 'hash table', 'dp', 'graph'],
  'node': ['string', 'hash table'],
  'react': ['string', 'array'],
  'sql': ['database'],
  'mongodb': ['database'],
  'postgres': ['database'],
};

const difficultyBg = {
  'Easy': 'bg-green-100 text-green-700 border-green-200',
  'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Hard': 'bg-red-100 text-red-700 border-red-200',
};

// Always-visible famous companies for sorting
const FAMOUS_COMPANIES = [
  'Google','Amazon','Microsoft','Meta','Apple','Netflix','Adobe','Uber','Airbnb','Atlassian','Salesforce','Oracle','Goldman Sachs','JPMorgan','Bloomberg','Walmart','NVIDIA','Tesla',
  'Flipkart','Paytm','Swiggy','Zomato','TCS','Infosys','Wipro','HCL','Tech Mahindra'
];

// Quick categories users commonly need
const POPULAR_TAGS = [
  'array','string','linked list','stack','queue','tree','graph','heap','two pointers','sliding window','binary search','dp','backtracking','greedy','math','bit manipulation','hash table','database'
];

const LeetCode = () => {
  const { resumeAnalysis } = useResume();
  const [activeTab, setActiveTab] = useState('all'); // 'recommended' | 'all' (default to all for full list)
  // Applied filters
  const [keyword, setKeyword] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]); // multi-levels
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  // Draft filters (edited in UI, applied when clicking Apply)
  const [keywordDraft, setKeywordDraft] = useState('');
  const [selectedDifficultiesDraft, setSelectedDifficultiesDraft] = useState([]);
  const [selectedCompaniesDraft, setSelectedCompaniesDraft] = useState([]);
  const [selectedTagsDraft, setSelectedTagsDraft] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const json = await apiFetch('/api/leetcode/problems?max=3000');
        if (json?.success && Array.isArray(json.data) && json.data.length) {
          setAllProblems(json.data.map(p => ({
            id: p.id || p.slug,
            title: p.title,
            difficulty: p.difficulty,
            tags: (p.tags || []).map(t => normalizeTagName(t)).filter(Boolean),
            companies: p.companies || [],
            url: p.url
          })));
          if (typeof json.count === 'number' && json.count < 100) {
            setError('Showing a limited subset of problems due to source restrictions.');
          }
        } else {
          setAllProblems(CURATED);
        }
      } catch (e) {
        setError('Unable to load full LeetCode list; showing curated set.');
        setAllProblems(CURATED);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const availableCompanies = useMemo(() => {
    return Array.from(new Set(allProblems.flatMap(p => p.companies || []))).sort();
  }, [allProblems]);

  const availableTags = useMemo(() => {
    const set = new Set(allProblems.flatMap(p => p.tags || []));
    const tags = Array.from(set);
    // Sort: POPULAR_TAGS first in defined order, then remaining A-Z
    const popularIndex = new Map(POPULAR_TAGS.map((t, i) => [t, i]));
    tags.sort((a, b) => {
      const ai = popularIndex.has(a) ? popularIndex.get(a) : Infinity;
      const bi = popularIndex.has(b) ? popularIndex.get(b) : Infinity;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
    return tags;
  }, [allProblems]);

  const derivedTagsFromSkills = useMemo(() => {
    const skills = (resumeAnalysis?.skills || []).map(s => s.toLowerCase());
    const tagSet = new Set();
    skills.forEach(skill => {
      Object.entries(SKILL_TO_TAGS).forEach(([key, tags]) => {
        if (skill.includes(key)) {
          tags.forEach(t => tagSet.add(t));
        }
      });
    });
    return tagSet;
  }, [resumeAnalysis]);

  const filteredProblems = useMemo(() => {
    let items = allProblems;
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      items = items.filter(p => p.title.toLowerCase().includes(k) || (p.tags || []).some(t => t.toLowerCase().includes(k)));
    }
    if (selectedDifficulties.length) {
      const lvlSet = new Set(selectedDifficulties.map(d => (d || '').toLowerCase().trim()));
      items = items.filter(p => lvlSet.has((p.difficulty || '').toLowerCase().trim()));
    }
    // Only apply company filter if dataset has company metadata
    const datasetHasCompanies = allProblems.some(p => (p.companies || []).length > 0);
    if (datasetHasCompanies && selectedCompanies.length) {
      const compSet = new Set(selectedCompanies.map(c => (c || '').toLowerCase().trim()));
      items = items.filter(p => (p.companies || []).some(c => compSet.has((c || '').toLowerCase().trim())));
    }
    if (selectedTags.length) {
      const normalizedSelected = new Set(selectedTags.map(t => normalizeTagName(t)));
      items = items.filter(p => (p.tags || []).some(t => normalizedSelected.has(normalizeTagName(t))));
    }
    return items;
  }, [allProblems, keyword, selectedDifficulties, selectedCompanies, selectedTags]);

  const recommendedProblems = useMemo(() => {
    if (derivedTagsFromSkills.size === 0) {
      return filteredProblems;
    }
    return filteredProblems.filter(p => (p.tags || []).some(t => derivedTagsFromSkills.has(t)));
  }, [filteredProblems, derivedTagsFromSkills]);

  const displayProblems = activeTab === 'recommended' ? recommendedProblems : filteredProblems;

  // Note: no separate sort; filtering by companies is sufficient per requirements

  // Pagination (20 per page)
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(displayProblems.length / PAGE_SIZE));
  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return displayProblems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [displayProblems, currentPage]);

  // Reset page when filters/tab change
  useEffect(() => { setCurrentPage(1); }, [activeTab, keyword, selectedCompanies, selectedTags, selectedDifficulties]);
  // Clamp page when results shrink
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages]);

  async function toggleSolved(problem) {
    try {
      if (!user) return;
      const solved = (profile?.leetcodeSolved || []).some(p => p.id === problem.id);
      if (solved) {
        await apiFetch(`/api/user/leetcode/solved/${problem.id}`, { method: 'DELETE' });
      } else {
        await apiFetch('/api/user/leetcode/solved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: problem.id, title: problem.title, url: problem.url, difficulty: problem.difficulty, tags: problem.tags, companies: problem.companies })
        });
      }
      await refreshProfile();
    } catch {}
  }

  const toggleChip = (list, setList, value) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const applyFilters = () => {
    setKeyword(keywordDraft.trim());
    setSelectedDifficulties([...selectedDifficultiesDraft]);
    setSelectedCompanies([...selectedCompaniesDraft]);
    setSelectedTags([...selectedTagsDraft]);
  };

  const clearFilters = () => {
    // Clear applied
    setKeyword('');
    setSelectedCompanies([]);
    setSelectedTags([]);
    setSelectedDifficulties([]);
    // Clear drafts
    setKeywordDraft('');
    setSelectedCompaniesDraft([]);
    setSelectedTagsDraft([]);
    setSelectedDifficultiesDraft([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary-100 rounded-lg mr-4">
            <Code2 className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LeetCode Practice</h1>
            <p className="text-gray-600 mt-2">Recommended DSA problems based on your skills. Solve on LeetCode.</p>
            {error && <p className="text-sm text-yellow-600 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="card mb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`py-2 px-3 rounded-md text-sm font-medium border ${
                activeTab === 'recommended' ? 'bg-primary-100 text-primary-800 border-primary-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-3 rounded-md text-sm font-medium border ${
                activeTab === 'all' ? 'bg-primary-100 text-primary-800 border-primary-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
          <div className="text-sm text-gray-600 flex items-center"><Filter className="w-4 h-4 mr-2" />{loading ? 'Loading…' : `${displayProblems.length} problems • Page ${currentPage} of ${totalPages}`}</div>
        </div>

        {/* Famous companies (filter) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Famous Companies (Filter)</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {FAMOUS_COMPANIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleChip(selectedCompanies, setSelectedCompanies, c)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedCompanies.includes(c)
                    ? 'bg-primary-100 text-primary-800 border-primary-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Search and levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                className="input-field pl-9"
                placeholder="Title or tag..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Levels</label>
            <div className="flex flex-wrap gap-2">
              {['Easy','Medium','Hard'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => toggleChip(selectedDifficultiesDraft, setSelectedDifficultiesDraft, lvl)}
                  className={`px-3 py-1 rounded-full text-sm border ${selectedDifficultiesDraft.includes(lvl) ? 'bg-primary-100 text-primary-800 border-primary-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                >{lvl}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={applyFilters} className="px-3 py-2 border rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700">Apply Filters</button>
            <button onClick={clearFilters} className="px-3 py-2 border rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200">Clear</button>
          </div>
        </div>

        {/* Companies filter */}
        {availableCompanies.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Companies</label>
            <div className="flex flex-wrap gap-2">
              {availableCompanies.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleChip(selectedCompaniesDraft, setSelectedCompaniesDraft, c)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedCompaniesDraft.includes(c)
                      ? 'bg-primary-100 text-primary-800 border-primary-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick categories */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Categories</label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => toggleChip(selectedTagsDraft, setSelectedTagsDraft, t)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedTagsDraft.includes(t)
                    ? 'bg-primary-100 text-primary-800 border-primary-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Categories filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleChip(selectedTagsDraft, setSelectedTagsDraft, t)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedTagsDraft.includes(t)
                    ? 'bg-primary-100 text-primary-800 border-primary-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems list */}
      <div className="space-y-4 animate-stagger">
        {loading && (
          <div className="text-gray-600">Loading problem set…</div>
        )}
        {paginatedProblems.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyBg[p.difficulty]}`}>{p.difficulty}</span>
                  {user && (
                    <button
                      onClick={() => toggleSolved(p)}
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${ (profile?.leetcodeSolved || []).some(s => s.id === p.id) ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                    >{ (profile?.leetcodeSolved || []).some(s => s.id === p.id) ? 'Solved' : 'Mark Solved' }</button>
                  )}
                  {activeTab === 'recommended' && (
                    <span className="ml-2 inline-flex items-center text-xs text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" /> Recommended
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(p.companies || []).map((c, i) => (
                    <span key={i} className="badge badge-secondary text-xs">{c}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...(p.tags || [])]
                    .sort((a, b) => a.localeCompare(b))
                    .map((t, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{t}</span>
                    ))}
                </div>
              </div>
              <div className="ml-4">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Solve on LeetCode</span>
                </a>
              </div>
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              className="btn-secondary text-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              className="btn-secondary text-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        {displayProblems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No problems match your filters. Try clearing some filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeetCode;


