import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

// Initial state
const initialState = {
  resumeAnalysis: null,
  jobMatches: [],
  skillsAnalysis: null,
  skillGaps: [],
  upgradeRecommendations: [],
  skillProgress: {}, // Track progress for each skill
  isLoading: false,
  error: null,
  lastUpdated: null
};

// Action types
const ACTIONS = {
  SET_RESUME_ANALYSIS: 'SET_RESUME_ANALYSIS',
  SET_JOB_MATCHES: 'SET_JOB_MATCHES',
  SET_SKILLS_ANALYSIS: 'SET_SKILLS_ANALYSIS',
  SET_SKILL_GAPS: 'SET_SKILL_GAPS',
  SET_UPGRADE_RECOMMENDATIONS: 'SET_UPGRADE_RECOMMENDATIONS',
  UPDATE_SKILL_PROGRESS: 'UPDATE_SKILL_PROGRESS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_RESUME_DATA: 'CLEAR_RESUME_DATA',
  UPDATE_JOB_MATCHES: 'UPDATE_JOB_MATCHES'
};

// Reducer function
const resumeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_RESUME_ANALYSIS:
      return {
        ...state,
        resumeAnalysis: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null
      };
    
    case ACTIONS.SET_JOB_MATCHES:
      return {
        ...state,
        jobMatches: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case ACTIONS.SET_SKILLS_ANALYSIS:
      return {
        ...state,
        skillsAnalysis: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case ACTIONS.SET_SKILL_GAPS:
      return {
        ...state,
        skillGaps: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case ACTIONS.SET_UPGRADE_RECOMMENDATIONS:
      return {
        ...state,
        upgradeRecommendations: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    case ACTIONS.UPDATE_SKILL_PROGRESS:
      return {
        ...state,
        skillProgress: {
          ...state.skillProgress,
          [action.payload.skillName]: action.payload.progress
        },
        lastUpdated: new Date().toISOString()
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case ACTIONS.CLEAR_RESUME_DATA:
      return {
        ...initialState
      };
    
    case ACTIONS.UPDATE_JOB_MATCHES:
      return {
        ...state,
        jobMatches: action.payload,
        lastUpdated: new Date().toISOString()
      };
    
    default:
      return state;
  }
};

// Create context
const ResumeContext = createContext();

// Provider component
export const ResumeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(resumeReducer, initialState);
  const auth = useAuth?.();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeAnalysis');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ACTIONS.SET_RESUME_ANALYSIS, payload: parsedData.resumeAnalysis });
        if (parsedData.jobMatches) {
          dispatch({ type: ACTIONS.SET_JOB_MATCHES, payload: parsedData.jobMatches });
        }
        if (parsedData.skillsAnalysis) {
          dispatch({ type: ACTIONS.SET_SKILLS_ANALYSIS, payload: parsedData.skillsAnalysis });
        }
        if (parsedData.skillGaps) {
          dispatch({ type: ACTIONS.SET_SKILL_GAPS, payload: parsedData.skillGaps });
        }
        if (parsedData.upgradeRecommendations) {
          dispatch({ type: ACTIONS.SET_UPGRADE_RECOMMENDATIONS, payload: parsedData.upgradeRecommendations });
        }
        if (parsedData.skillProgress) {
          Object.entries(parsedData.skillProgress).forEach(([skillName, progress]) => {
            dispatch({ 
              type: ACTIONS.UPDATE_SKILL_PROGRESS, 
              payload: { skillName, progress } 
            });
          });
        }
      } catch (error) {
        console.error('Error loading saved resume data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.resumeAnalysis) {
      localStorage.setItem('resumeAnalysis', JSON.stringify({
        resumeAnalysis: state.resumeAnalysis,
        jobMatches: state.jobMatches,
        skillsAnalysis: state.skillsAnalysis,
        skillGaps: state.skillGaps,
        upgradeRecommendations: state.upgradeRecommendations,
        skillProgress: state.skillProgress,
        lastUpdated: state.lastUpdated
      }));
      // Persist to backend if logged in
      (async () => {
        try {
          if (auth && auth.user) {
            await apiFetch('/api/user/resume', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resumeAnalysis: state.resumeAnalysis })
            });
            // Refresh profile so Profile page shows latest analysis immediately
            if (auth.refreshProfile) {
              await auth.refreshProfile();
            }
          }
        } catch {}
      })();
    }
  }, [state.resumeAnalysis, state.jobMatches, state.skillsAnalysis, state.skillGaps, state.upgradeRecommendations, state.lastUpdated]);

  // Actions
  const setResumeAnalysis = (analysis) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    // Extract and set all related data
    dispatch({ type: ACTIONS.SET_RESUME_ANALYSIS, payload: analysis });
    
    if (analysis.jobMatches) {
      dispatch({ type: ACTIONS.SET_JOB_MATCHES, payload: analysis.jobMatches });
    }
    
    if (analysis.skillAnalysis) {
      dispatch({ type: ACTIONS.SET_SKILLS_ANALYSIS, payload: analysis.skillAnalysis });
    }
    
    if (analysis.skillGaps) {
      dispatch({ type: ACTIONS.SET_SKILL_GAPS, payload: analysis.skillGaps });
    }
    
    if (analysis.upgradeRecommendations) {
      dispatch({ type: ACTIONS.SET_UPGRADE_RECOMMENDATIONS, payload: analysis.upgradeRecommendations });
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  };

  const setJobMatches = (jobMatches) => {
    dispatch({ type: ACTIONS.SET_JOB_MATCHES, payload: jobMatches });
  };

  const setSkillsAnalysis = (skillsAnalysis) => {
    dispatch({ type: ACTIONS.SET_SKILLS_ANALYSIS, payload: skillsAnalysis });
  };

  const setSkillGaps = (skillGaps) => {
    dispatch({ type: ACTIONS.SET_SKILL_GAPS, payload: skillGaps });
  };

  const setUpgradeRecommendations = (recommendations) => {
    dispatch({ type: ACTIONS.SET_UPGRADE_RECOMMENDATIONS, payload: recommendations });
  };

  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };

  const clearResumeData = () => {
    dispatch({ type: ACTIONS.CLEAR_RESUME_DATA });
    localStorage.removeItem('resumeAnalysis');
  };

  const updateJobMatches = (jobMatches) => {
    dispatch({ type: ACTIONS.UPDATE_JOB_MATCHES, payload: jobMatches });
  };

  const updateSkillProgress = (skillName, progress) => {
    dispatch({ 
      type: ACTIONS.UPDATE_SKILL_PROGRESS, 
      payload: { skillName, progress } 
    });
    // Persist to backend if logged in
    (async () => {
      try {
        if (auth && auth.user) {
          await apiFetch('/api/user/skill-progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillName, progress })
          });
        }
      } catch {}
    })();
  };

  const value = {
    ...state,
    setResumeAnalysis,
    setJobMatches,
    setSkillsAnalysis,
    setSkillGaps,
    setUpgradeRecommendations,
    updateSkillProgress,
    setLoading,
    setError,
    clearResumeData,
    updateJobMatches
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

// Custom hook to use the context
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
