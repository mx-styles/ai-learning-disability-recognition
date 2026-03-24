import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analysisAPI, assessmentAPI, studentAPI } from '../services/api';
import DyslexiaTask from '../components/tasks/DyslexiaTask';
import DysgraphiaTask from '../components/tasks/DysgraphiaTask';
import DyscalculiaTask from '../components/tasks/DyscalculiaTask';
import DyspraxiaTask from '../components/tasks/DyspraxiaTask';

const DISABILITIES = ['Dyslexia', 'Dysgraphia', 'Dyscalculia', 'Dyspraxia'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

const TASKS_BY_DOMAIN = {
  Dyslexia: [
    'Word reading accuracy',
    'Minimal pair discrimination',
    'Letter discrimination',
    'Paragraph reading / comprehension',
    'Verbal sequential memory'
  ],
  Dysgraphia: [
    'Sentence copying',
    'Dictation',
    'Free writing sample',
    'Letter formation tracing',
    'Shape tracing'
  ],
  Dyscalculia: [
    'Skip counting',
    'Mental arithmetic',
    'Symbol recognition',
    'Quantity comparison',
    'Number line task'
  ],
  Dyspraxia: [
    'Shape replication',
    'Pattern tracing',
    'Reaction time',
    'Hand-eye coordination',
    'Directional awareness'
  ]
};

const DOMAIN_KEY_MAP = {
  Dyslexia: 'dyslexia',
  Dysgraphia: 'dysgraphia',
  Dyscalculia: 'dyscalculia',
  Dyspraxia: 'dyspraxia'
};

const toRuleTaskKey = (taskLabel) =>
  String(taskLabel || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const TASK_INSTRUCTIONS = {
  'Word reading accuracy':
    'Show the printed word list and ask the learner to read aloud at a comfortable pace. Mark words read correctly and note hesitations.',
  'Minimal pair discrimination':
    "Say pairs of similar-sounding words (e.g., 'bat'/'pat') and ask the learner to point to or repeat the word they heard.",
  'Letter discrimination':
    'Present mixed upper- and lowercase letters and ask the learner to name or match target letters.',
  'Paragraph reading / comprehension':
    'Provide a short grade-appropriate passage. Time the reading and ask 3-5 comprehension questions.',
  'Verbal sequential memory':
    'Read sequences of numbers or words and ask the learner to repeat them in the same order.',
  'Sentence copying':
    'Provide a clear printed sentence and ask the learner to copy it below, focusing on spacing and legibility.',
  Dictation: 'Read a short sentence or word list aloud and ask the learner to write exactly what they hear.',
  'Free writing sample': 'Give a simple prompt (e.g., My favorite game...) and 5 minutes for the learner to write freely.',
  'Letter formation tracing': 'Offer dotted letters and ask the learner to trace each one, observing formation and control.',
  'Shape tracing': 'Provide basic shapes or patterns and ask the learner to trace along the lines.',
  'Skip counting': 'Ask the learner to count forward and backward by 2s, 5s, or 10s within a comfortable number range.',
  'Mental arithmetic':
    'Begin with very simple sums such as 5 + 2. Ask the learner to answer without using fingers or paper. Add one or two similar items.',
  'Symbol recognition': 'Show numerals and basic operation symbols and ask the learner to name or match them.',
  'Quantity comparison': "Present pairs of dot patterns or numerals and ask which shows 'more' or 'less'.",
  'Number line task': 'Provide a number line and ask the learner to place or identify given numbers on it.',
  'Shape replication': 'Show a simple shape or block design and ask the learner to copy it as closely as possible.',
  'Pattern tracing': 'Offer lines, paths, or mazes and ask the learner to trace smoothly from start to finish.',
  'Reaction time': "Use a simple 'tap when you see or hear' game with a consistent cue, noting delays or misses.",
  'Hand-eye coordination': 'Ask the learner to draw between two parallel lines or connect dots accurately.',
  'Directional awareness': "Give left/right/up/down movement instructions and observe how easily the learner follows them."
};

const STUDENT_TASK_CONFIG = {
  'Word reading accuracy': {
    prompt: 'Please read each word on the card aloud.',
    inputType: 'long',
    placeholder: 'Note correct words, misreadings, and hesitations...'
  },
  'Minimal pair discrimination': {
    prompt: 'Listen carefully and choose or repeat the word you heard.',
    inputType: 'long',
    placeholder: 'Record which items were correct or confused...'
  },
  'Letter discrimination': {
    prompt: 'Point to or say the letter the teacher asks for.',
    inputType: 'long',
    placeholder: 'Note accurate and inaccurate identifications...'
  },
  'Paragraph reading / comprehension': {
    prompt: 'Read the short story or passage, then answer the questions.',
    inputType: 'long',
    placeholder: 'Write key comprehension answers or notes here...'
  },
  'Verbal sequential memory': {
    prompt: 'Listen to the list and repeat it in the same order.',
    inputType: 'long',
    placeholder: 'Record length of sequences correctly recalled...'
  },
  'Sentence copying': {
    prompt: 'Copy the sentence shown as neatly as you can.',
    inputType: 'long',
    placeholder: 'Note legibility, spacing, line alignment...'
  },
  Dictation: {
    prompt: 'Write exactly what the teacher says.',
    inputType: 'long',
    placeholder: 'Record spelling or grammar errors here...'
  },
  'Free writing sample': {
    prompt: 'Write a short paragraph about the topic you were given.',
    inputType: 'long',
    placeholder: 'Summarize content quality and mechanics...'
  },
  'Letter formation tracing': {
    prompt: 'Trace over each letter carefully, staying on the line.',
    inputType: 'long',
    placeholder: 'Note reversed letters, shaky lines, or effort...'
  },
  'Shape tracing': {
    prompt: 'Trace the shapes slowly and carefully.',
    inputType: 'long',
    placeholder: 'Describe control, accuracy, and corrections...'
  },
  'Skip counting': {
    prompt: 'Count forwards and backwards using the pattern your teacher gives (for example, 2, 4, 6...).',
    inputType: 'long',
    placeholder: 'Record highest range and any breaks in the pattern...'
  },
  'Mental arithmetic': {
    prompt: 'Student, what is 5 + 2? Say or write your answer here.',
    inputType: 'numeric',
    placeholder: 'Type the answer to 5 + 2...'
  },
  'Symbol recognition': {
    prompt: 'Name or match the numbers and symbols you see.',
    inputType: 'long',
    placeholder: 'Note which symbols were confused or unknown...'
  },
  'Quantity comparison': {
    prompt: 'Look at two groups or numbers and choose which one is more or less.',
    inputType: 'long',
    placeholder: 'Describe items where the student struggled...'
  },
  'Number line task': {
    prompt: 'Place or find the number on the number line.',
    inputType: 'long',
    placeholder: 'Record accuracy and typical errors...'
  },
  'Shape replication': {
    prompt: 'Copy the picture or block design as closely as you can.',
    inputType: 'long',
    placeholder: 'Describe organization, omissions, or rotations...'
  },
  'Pattern tracing': {
    prompt: 'Trace along the path or maze from start to finish.',
    inputType: 'long',
    placeholder: 'Note going off-line, speed, or restarts...'
  },
  'Reaction time': {
    prompt: 'Tap or respond as soon as you see or hear the signal.',
    inputType: 'long',
    placeholder: 'Record slow, missed, or impulsive responses...'
  },
  'Hand-eye coordination': {
    prompt: 'Draw carefully between the two lines or connect the dots.',
    inputType: 'long',
    placeholder: 'Note overshoots, tremor, or difficulty...'
  },
  'Directional awareness': {
    prompt: 'Follow directions like left, right, up, and down.',
    inputType: 'long',
    placeholder: 'Describe confusion with directions or reversals...'
  }
};

// Live Timer Component
function LiveTimer({ startTime }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(v => v + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!startTime) return '0:00';

  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const AssessmentFlow = () => {
  const location = useLocation();
  const prefillAppliedRef = useRef(false);
  const [studentName, setStudentName] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    grade: 'Grade 1'
  });
  const [gradeLevel, setGradeLevel] = useState('');
  const [selectedDomains, setSelectedDomains] = useState(['Dyslexia', 'Dyscalculia']);
  const [phase, setPhase] = useState('setup');
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [completedDomains, setCompletedDomains] = useState([]); // Array of domain names
  const [domainTaskData, setDomainTaskData] = useState({}); // { domainName: taskData }
  const [completedTasksByDomain, setCompletedTasksByDomain] = useState({}); // { domainName: [taskIndex1, taskIndex2, ...] }
  const [currentTaskIndexInDomain, setCurrentTaskIndexInDomain] = useState(0); // Current task index within domain
  const [assessmentStartTime, setAssessmentStartTime] = useState(null);
  const [assessmentEndTime, setAssessmentEndTime] = useState(null);
  const [taskScores, setTaskScores] = useState({}); // { domainName: { taskIndex: scoreData } }
  const [ruleSummary, setRuleSummary] = useState({});
  const [ruleSummaryLoading, setRuleSummaryLoading] = useState(false);
  const [ruleSummaryError, setRuleSummaryError] = useState('');
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [syncError, setSyncError] = useState('');
  const [syncingAssessment, setSyncingAssessment] = useState(false);

  // Fetch all students on mount
  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoadingStudents(true);
      try {
        const response = await studentAPI.getAll({});
        setAllStudents(response.data?.students || []);
      } catch (error) {
        console.error('Error fetching students', error);
        setAllStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchAllStudents();
  }, []);

  // Filter students based on query
  useEffect(() => {
    const term = studentQuery.trim().toLowerCase();
    if (term === '') {
      setStudentResults(allStudents);
    } else {
      const filtered = allStudents.filter(student => {
        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
        const studentId = (student.student_id || '').toLowerCase();
        return fullName.includes(term) || studentId.includes(term);
      });
      setStudentResults(filtered);
    }
  }, [studentQuery, allStudents]);

  // Prefill student when arriving from Students screen.
  useEffect(() => {
    if (prefillAppliedRef.current) return;

    const preselectedStudent = location.state?.preselectedStudent;
    const preselectedStudentId = location.state?.preselectedStudentId;

    if (preselectedStudent) {
      handleSelectStudent(preselectedStudent);
      prefillAppliedRef.current = true;
      return;
    }

    if (!preselectedStudentId || allStudents.length === 0) return;

    const matchedStudent = allStudents.find((student) => student.id === preselectedStudentId);
    if (matchedStudent) {
      handleSelectStudent(matchedStudent);
      prefillAppliedRef.current = true;
    }
  }, [allStudents, location.state]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    const displayName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.student_id || 'Student';
    setStudentName(displayName);
    setStudentQuery(displayName);
    const normalizedGrade = student.grade
      ? String(student.grade).startsWith('Grade')
        ? student.grade
        : `Grade ${student.grade}`
      : gradeLevel || 'Grade 1';
    setGradeLevel(normalizedGrade);
    setShowDropdown(false);
  };

  const handleStudentBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      setShowDropdown(false);
      // If no student selected and query doesn't match any student, clear it
      if (!selectedStudent) {
        const term = studentQuery.trim().toLowerCase();
        const matchesStudent = allStudents.some(student => {
          const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim().toLowerCase();
          return fullName === term;
        });
        if (!matchesStudent) {
          setStudentQuery('');
          setStudentName('');
        }
      }
    }, 200);
  };

  const handleCreateNewStudent = async (e) => {
    e.preventDefault();
    setCreatingStudent(true);
    try {
      const gradeNumber = parseInt(newStudent.grade.replace(/[^0-9]/g, ''), 10);
      const payload = {
        ...newStudent,
        grade: Number.isFinite(gradeNumber) ? gradeNumber : newStudent.grade
      };
      const response = await studentAPI.create(payload);
      const created = response.data?.student || response.data || payload;
      handleSelectStudent(created);
      setShowCreateModal(false);
      setNewStudent({ student_id: '', first_name: '', last_name: '', grade: 'Grade 1' });
    } catch (error) {
      alert('Error creating student: ' + (error.response?.data?.error || error.message));
    } finally {
      setCreatingStudent(false);
    }
  };

  const currentDomain = selectedDomains[currentDomainIndex];
  const currentDomainTasks = currentDomain ? TASKS_BY_DOMAIN[currentDomain] : [];

  const toggleDomain = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const canStart =
    studentName.trim().length > 1 &&
    gradeLevel.trim().length > 0 &&
    selectedDomains.length > 0;

  const startSession = async () => {
    if (!canStart) return;

    if (!selectedStudent?.id) {
      setSyncError('Please select a saved student before starting the assessment.');
      return;
    }

    setSyncError('');

    try {
      const assessmentType = selectedDomains.length > 1
        ? 'full'
        : (DOMAIN_KEY_MAP[selectedDomains[0]] || 'full');

      const startRes = await assessmentAPI.start({
        student_id: selectedStudent.id,
        assessment_type: assessmentType,
      });

      const sessionId = startRes.data?.session?.id;
      setBackendSessionId(sessionId || null);
    } catch (error) {
      setSyncError(error.response?.data?.error || 'Failed to start backend assessment session.');
      return;
    }

    setCurrentDomainIndex(0);
    setCompletedDomains([]);
    setDomainTaskData({});
    setCompletedTasksByDomain({});
    setCurrentTaskIndexInDomain(0);
    setAssessmentStartTime(Date.now());
    setAssessmentEndTime(null);
    setTaskScores({});
    setRuleSummary({});
    setRuleSummaryError('');
    setPhase('tasks');
  };

  const buildDomainTaskScores = (domain, data) => {
    const scoreMap = {};

    const labels = TASKS_BY_DOMAIN[domain] || [];
    const stepScores = taskScores[domain] || {};

    labels.forEach((label, idx) => {
      const stepData = stepScores[idx];
      if (!stepData) return;

      let normalized = null;
      if (typeof stepData.correct === 'number' && typeof stepData.total === 'number' && stepData.total > 0) {
        normalized = stepData.correct / stepData.total;
      } else if (typeof stepData.score === 'number') {
        normalized = stepData.score > 1 ? stepData.score / 100 : stepData.score;
      }

      if (normalized !== null) {
        scoreMap[toRuleTaskKey(label)] = Math.max(0, Math.min(1, normalized));
      }
    });

    const rawTaskScores = data?.raw_data?.task_scores;
    if (rawTaskScores && typeof rawTaskScores === 'object') {
      Object.entries(rawTaskScores).forEach(([taskName, value]) => {
        const normalized = typeof value === 'number' ? (value > 1 ? value / 100 : value) : null;
        if (normalized !== null) {
          scoreMap[toRuleTaskKey(taskName)] = Math.max(0, Math.min(1, normalized));
        }
      });
    }

    return scoreMap;
  };

  const computeDomainScoreForSubmission = (domain, data) => {
    const scoreMap = buildDomainTaskScores(domain, data);
    const scoreValues = Object.values(scoreMap);
    if (scoreValues.length > 0) {
      return scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length;
    }

    const computed = data?.computed || {};
    const metrics = [];
    Object.entries(computed).forEach(([key, value]) => {
      if (typeof value !== 'number') return;
      const normalized = Math.max(0, Math.min(1, value));
      if (key.includes('error') || key.includes('confusion') || key.includes('deviation')) {
        metrics.push(1 - normalized);
      } else {
        metrics.push(normalized);
      }
    });

    if (metrics.length > 0) {
      return metrics.reduce((sum, value) => sum + value, 0) / metrics.length;
    }

    return null;
  };

  // Handle individual task completion within a domain
  const handleTaskStepComplete = (scoreData) => {
    const domainTasks = TASKS_BY_DOMAIN[currentDomain];
    
    // Track score for current task if provided
    if (scoreData) {
      setTaskScores(prev => ({
        ...prev,
        [currentDomain]: {
          ...(prev[currentDomain] || {}),
          [currentTaskIndexInDomain]: scoreData
        }
      }));
    }
    
    // Mark current task as completed
    setCompletedTasksByDomain(prev => {
      const currentCompleted = prev[currentDomain] || [];
      
      if (!currentCompleted.includes(currentTaskIndexInDomain)) {
        const newCompleted = [...currentCompleted, currentTaskIndexInDomain];
        return {
          ...prev,
          [currentDomain]: newCompleted
        };
      }
      return prev;
    });
    
    // Move to next task in domain
    if (currentTaskIndexInDomain < domainTasks.length - 1) {
      setCurrentTaskIndexInDomain(prev => prev + 1);
    }
  };

  // Navigate to specific task within current domain
  const navigateToTask = (taskIndex) => {
    const completedTaskIndices = completedTasksByDomain[currentDomain] || [];
    // Can navigate to current task, completed tasks, or the next uncompleted task
    const maxAllowedIndex = Math.min(
      completedTaskIndices.length,
      TASKS_BY_DOMAIN[currentDomain].length - 1
    );
    
    if (taskIndex >= 0 && taskIndex <= maxAllowedIndex) {
      setCurrentTaskIndexInDomain(taskIndex);
    }
  };

  // Navigate to previous task
  const goToPreviousTask = () => {
    if (currentTaskIndexInDomain > 0) {
      setCurrentTaskIndexInDomain(prev => prev - 1);
    }
  };

  // Navigate to next task
  const goToNextTask = () => {
    const completedTaskIndices = completedTasksByDomain[currentDomain] || [];
    const domainTasks = TASKS_BY_DOMAIN[currentDomain];
    const maxAllowedIndex = Math.min(
      completedTaskIndices.length,
      domainTasks.length - 1
    );
    
    if (currentTaskIndexInDomain < maxAllowedIndex) {
      setCurrentTaskIndexInDomain(prev => prev + 1);
    }
  };

  const handleTaskComplete = async (data) => {
    // Mark current domain as completed
    const domainTasks = TASKS_BY_DOMAIN[currentDomain];
    const allTaskIndices = domainTasks.map((_, idx) => idx);
    
    setCompletedTasksByDomain(prev => ({
      ...prev,
      [currentDomain]: allTaskIndices
    }));
    
    setCompletedDomains(prev => [...prev, currentDomain]);
    setDomainTaskData(prev => ({ ...prev, [currentDomain]: data }));

    if (backendSessionId) {
      try {
        const domainScore = computeDomainScoreForSubmission(currentDomain, data);
        const taskScoresMap = buildDomainTaskScores(currentDomain, data);

        await assessmentAPI.submitTask(backendSessionId, {
          task_type: DOMAIN_KEY_MAP[currentDomain] || String(currentDomain || '').toLowerCase(),
          disability_category: DOMAIN_KEY_MAP[currentDomain] || String(currentDomain || '').toLowerCase(),
          task_data: {
            raw_data: data?.raw_data || {},
            computed: data?.computed || {},
            task_scores: taskScoresMap,
          },
          score: domainScore,
          completion_time: data?.raw_data?.total_time ? Number(data.raw_data.total_time) / 1000 : null,
        });
      } catch (error) {
        setSyncError(error.response?.data?.error || 'Failed to sync task result to backend.');
      }
    }
    
    // Move to next domain or finish
    if (currentDomainIndex < selectedDomains.length - 1) {
      setCurrentDomainIndex(prev => prev + 1);
      setCurrentTaskIndexInDomain(0);
    } else {
      setAssessmentEndTime(Date.now());

      if (backendSessionId) {
        setSyncingAssessment(true);
        try {
          await assessmentAPI.complete(backendSessionId);
          await analysisAPI.process(backendSessionId);
        } catch (error) {
          setSyncError(error.response?.data?.error || 'Assessment completed locally but failed to finalize in backend.');
        } finally {
          setSyncingAssessment(false);
        }
      }

      setPhase('summary');
    }
  };

  const goBack = () => {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(prev => prev - 1);
    } else {
      setPhase('setup');
    }
  };

  // Calculate current task score and domain score
  const calculateDomainScore = (domain) => {
    const domainScoreData = taskScores[domain] || {};
    const taskIndices = Object.keys(domainScoreData);
    
    if (taskIndices.length === 0) {
      return { currentTaskScore: null, domainScore: null, totalCorrect: 0, totalAttempted: 0 };
    }

    let totalScore = 0;
    let totalCorrect = 0;
    let totalAttempted = 0;

    taskIndices.forEach(taskIdx => {
      const scoreData = domainScoreData[taskIdx];
      if (scoreData && typeof scoreData.correct === 'number' && typeof scoreData.total === 'number') {
        totalCorrect += scoreData.correct;
        totalAttempted += scoreData.total;
        totalScore += (scoreData.correct / scoreData.total) * 100;
      }
    });

    const domainScore = taskIndices.length > 0 ? Math.round(totalScore / taskIndices.length) : null;
    const currentTaskIdx = currentTaskIndexInDomain.toString();
    const currentTaskScore = domainScoreData[currentTaskIdx] || null;

    return { currentTaskScore, domainScore, totalCorrect, totalAttempted };
  };

  const resetSession = () => {
    setPhase('setup');
    setCurrentDomainIndex(0);
    setCompletedDomains([]);
    setDomainTaskData({});
    setCompletedTasksByDomain({});
    setCurrentTaskIndexInDomain(0);
    setTaskScores({});
    setRuleSummary({});
    setRuleSummaryError('');
    setBackendSessionId(null);
    setSyncError('');
    setSyncingAssessment(false);
  };

  // Calculate assessment statistics
  const assessmentStats = useMemo(() => {
    if (!assessmentStartTime || !assessmentEndTime) {
      return null;
    }

    const durationMs = assessmentEndTime - assessmentStartTime;
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor((durationMs % 60000) / 1000);

    const domainScores = {};
    let totalScore = 0;
    let scoreCount = 0;

    selectedDomains.forEach(domain => {
      const data = domainTaskData[domain];
      if (data && data.computed) {
        const computed = data.computed;
        let domainScore = 0;
        let metricCount = 0;

        // Calculate average score from computed metrics
        Object.keys(computed).forEach(key => {
          const value = computed[key];
          if (typeof value === 'number') {
            // Invert error rates and confusion scores (lower is better)
            if (key.includes('error') || key.includes('confusion') || key.includes('deviation')) {
              domainScore += (1 - Math.min(value, 1)) * 100;
            } else {
              domainScore += Math.min(value, 1) * 100;
            }
            metricCount++;
          }
        });

        if (metricCount > 0) {
          const avgScore = domainScore / metricCount;
          domainScores[domain] = Math.round(avgScore);
          totalScore += avgScore;
          scoreCount++;
        }
      }
    });

    const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      duration: `${durationMinutes}m ${durationSeconds}s`,
      durationMs,
      overallScore,
      domainScores,
      totalTasks: selectedDomains.reduce((sum, domain) => sum + TASKS_BY_DOMAIN[domain].length, 0),
      completedDomains: completedDomains.length,
      totalDomains: selectedDomains.length
    };
  }, [assessmentStartTime, assessmentEndTime, domainTaskData, selectedDomains, completedDomains]);

  useEffect(() => {
    if (phase !== 'summary' || selectedDomains.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchRuleSummary = async () => {
      setRuleSummaryLoading(true);
      setRuleSummaryError('');

      try {
        const domainsPayload = {};

        selectedDomains.forEach((domain) => {
          const apiDomain = DOMAIN_KEY_MAP[domain];
          if (!apiDomain) return;

          const labels = TASKS_BY_DOMAIN[domain] || [];
          const scoreDataByIndex = taskScores[domain] || {};
          const taskScoreMap = {};

          labels.forEach((label, idx) => {
            const scoreEntry = scoreDataByIndex[idx];
            if (!scoreEntry) return;

            let normalized = null;
            if (typeof scoreEntry.correct === 'number' && typeof scoreEntry.total === 'number' && scoreEntry.total > 0) {
              normalized = scoreEntry.correct / scoreEntry.total;
            } else if (typeof scoreEntry.score === 'number') {
              normalized = scoreEntry.score > 1 ? scoreEntry.score / 100 : scoreEntry.score;
            }

            if (normalized !== null) {
              taskScoreMap[toRuleTaskKey(label)] = Math.max(0, Math.min(1, normalized));
            }
          });

          const domainScorePercent = assessmentStats?.domainScores?.[domain];
          const domainScore = typeof domainScorePercent === 'number' ? domainScorePercent / 100 : null;

          domainsPayload[apiDomain] = {
            task_scores: taskScoreMap,
            computed: domainTaskData[domain]?.computed || {},
            domain_score: domainScore
          };
        });

        const response = await analysisAPI.ruleScreen({ domains: domainsPayload });
        if (!cancelled) {
          setRuleSummary(response.data?.results || {});
        }
      } catch (error) {
        if (!cancelled) {
          setRuleSummary({});
          setRuleSummaryError(error.response?.data?.error || error.message || 'Failed to evaluate rule summary.');
        }
      } finally {
        if (!cancelled) {
          setRuleSummaryLoading(false);
        }
      }
    };

    fetchRuleSummary();

    return () => {
      cancelled = true;
    };
  }, [phase, selectedDomains, taskScores, domainTaskData, assessmentStats]);

  const renderHeader = () => {
    if (phase === 'setup') {
      return <span className="hidden text-sm text-gray-600 sm:inline">Assessment setup - Step 1 of 3</span>;
    }

    if (phase === 'tasks') {
      return <span className="hidden text-sm text-gray-600 sm:inline">Task administration - Step 2 of 3</span>;
    }

    return <span className="hidden text-sm text-gray-600 sm:inline">Session wrap-up - Step 3 of 3</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 text-sm">
          <div className="text-base sm:text-lg font-semibold tracking-tight">AI Learning Disability Screening</div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {renderHeader()}
          </div>
        </div>
      </div>

      {syncError && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {syncError}
          </div>
        </div>
      )}

      {syncingAssessment && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Finalizing assessment in backend...
          </div>
        </div>
      )}

      {phase === 'setup' && (
        <section className="max-w-7xl mx-auto px-4 grid gap-6 py-6 sm:py-8 md:grid-cols-[1.2fr,1fr]">
          <div className="self-start rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <h2 className="text-xl font-semibold">New screening session</h2>
              <p className="text-sm text-gray-600">
                Capture basic details and targeted domains. Tasks and feature extraction run fully offline.
              </p>
            </div>
            <div className="space-y-5 px-4 sm:px-6 py-6">
              <div className="space-y-2">
                <label htmlFor="studentSearch" className="text-sm font-medium text-gray-900">Student</label>
                <div className="relative">
                  <input
                    id="studentSearch"
                    value={studentQuery}
                    onChange={(e) => {
                      setStudentQuery(e.target.value);
                      setStudentName(e.target.value);
                      setSelectedStudent(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={handleStudentBlur}
                    placeholder="Search for a student or type a new name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                  {loadingStudents && (
                    <div className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">Loading...</div>
                  )}
                  {showDropdown && studentResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                      <div className="max-h-52 overflow-auto divide-y divide-gray-100">
                        {studentResults.map((student) => {
                          const name = `${student.first_name || ''} ${student.last_name || ''}`.trim();
                          const gradeDisplay = student.grade ? (String(student.grade).startsWith('Grade') ? student.grade : `Grade ${student.grade}`) : 'Grade N/A';
                          return (
                            <button
                              type="button"
                              key={student.id || student.student_id}
                              onMouseDown={(e) => {
                                // Select before the input blur handler runs.
                                e.preventDefault();
                                handleSelectStudent(student);
                              }}
                              onClick={(e) => {
                                // Keep keyboard selection support (Enter/Space).
                                if (e.detail === 0) {
                                  handleSelectStudent(student);
                                }
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <div className="font-medium text-gray-900">{name || student.student_id || 'Unnamed student'}</div>
                              <div className="text-sm text-gray-600">{student.student_id || 'ID N/A'} · {gradeDisplay}</div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-gray-100 px-3 py-2 text-sm text-gray-600">
                        Can't find the student?{' '}
                        <button
                          type="button"
                          className="font-medium text-primary-600 hover:text-primary-700"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowCreateModal(true);
                            setShowDropdown(false);
                          }}
                        >
                          Create new student
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">Click to see all students or start typing to filter. You can also create a new student if not found.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="gradeLevel" className="text-sm font-medium text-gray-900">Grade</label>
                <select
                  id="gradeLevel"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none bg-white"
                >
                  <option value="" disabled>Select grade</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Screening domains</label>
                <p className="text-sm text-gray-600">
                  Select the domains you intend to screen. Tasks are age-normalized in the assessment engine.
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {DISABILITIES.map((domain) => {
                    const active = selectedDomains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleDomain(domain)}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? 'border-primary-500 bg-primary-50 text-gray-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
                        <span>
                          <span className="block font-medium">{domain}</span>
                          <span className="mt-0.5 block text-sm text-gray-600">
                            {domain === 'Dyslexia' && 'Reading, phonological processing, and verbal sequencing.'}
                            {domain === 'Dysgraphia' && 'Written expression, spelling, and fine-motor output.'}
                            {domain === 'Dyscalculia' && 'Number sense, arithmetic, and quantity reasoning.'}
                            {domain === 'Dyspraxia' && 'Motor planning, coordination, and directionality.'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                This interface configures the assessment session. Task timing, feature extraction (error rates, speeds,
                deviations), and risk scoring are executed in the offline backend module.
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-sm text-gray-600">
                <span>Next: task administration workspace</span>
                <button
                  className={`w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
                    canStart ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!canStart}
                  onClick={startSession}
                >
                  Start screening session
                </button>
              </div>
            </div>
          </div>

          <div className="self-start rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <h3 className="text-base font-semibold">Planned task bundle</h3>
              <p className="text-sm text-gray-600">A conceptual view of the task blocks for this configuration.</p>
            </div>
              <div className="space-y-4 px-4 sm:px-6 py-5 text-sm">
              {selectedDomains.map((domain) => (
                <div key={domain} className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{domain}</span>
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-sm text-primary-700">
                      {TASKS_BY_DOMAIN[domain].length} tasks
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {TASKS_BY_DOMAIN[domain].map((task) => (
                      <span
                        key={task}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-700"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {selectedDomains.length === 0 && (
                  <p className="text-sm text-gray-600">
                  Select at least one domain on the left to preview the related task families.
                </p>
              )}
                <p className="text-sm text-gray-600">
                Example extracted features include phoneme error rates, reading speed, letter spacing variance,
                arithmetic accuracy, number line deviation, reaction time, and coordination error rates, all normalized by
                age or grade bands.
              </p>
            </div>
          </div>
        </section>
      )}

      {phase === 'tasks' && currentDomain && (
        <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Session Overview - Horizontal Panel at Top */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Session overview</h3>
                <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-md">
                  <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-primary-900 text-sm">
                    <LiveTimer startTime={assessmentStartTime} />
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Track your progress through each task. Bars update in real-time as you answer.</p>
            </div>
            <div className="px-4 sm:px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedDomains.map((domain) => {
                  const domainTasks = TASKS_BY_DOMAIN[domain];
                  const isCompleted = completedDomains.includes(domain);
                  const isCurrentDomain = currentDomain === domain;
                  const completedTaskIndices = completedTasksByDomain[domain] || [];
                  const { currentTaskScore, domainScore, totalCorrect, totalAttempted } = isCurrentDomain ? calculateDomainScore(domain) : { currentTaskScore: null, domainScore: null, totalCorrect: 0, totalAttempted: 0 };
                  
                  return (
                    <div key={domain} className="rounded-md border border-gray-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-medium text-gray-900">{domain}</span>
                        {isCompleted && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">✓ Completed</span>
                        )}
                        {isCurrentDomain && !isCompleted && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">In Progress</span>
                        )}
                      </div>
                      
                      {/* Progress Bars for Current Domain */}
                      {isCurrentDomain && !isCompleted && (currentTaskScore || domainScore !== null) && (
                        <div className="mb-3 space-y-2">
                          {/* Current Task Progress */}
                          {currentTaskScore && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-700 font-medium">Current task</span>
                                <span className="text-xs font-semibold text-mint-700">
                                  {currentTaskScore.correct} / {currentTaskScore.total}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-mint-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${(currentTaskScore.correct / currentTaskScore.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {/* Domain Overall Progress */}
                          {domainScore !== null && totalAttempted > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-700 font-medium">Domain overall</span>
                                <span className="text-xs font-semibold text-primary-700">{domainScore}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                                    domainScore >= 80 ? 'bg-green-500' :
                                    domainScore >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${domainScore}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5">
                        {domainTasks.map((task, taskIndex) => {
                          const isTaskCompleted = completedTaskIndices.includes(taskIndex);
                          const isCurrentTask = isCurrentDomain && taskIndex === currentTaskIndexInDomain && !isTaskCompleted;
                          const maxAllowedIndex = Math.min(completedTaskIndices.length, domainTasks.length - 1);
                          const isClickable = isCurrentDomain && taskIndex <= maxAllowedIndex;
                          
                          return (
                            <span
                              key={task}
                              onClick={() => isClickable && navigateToTask(taskIndex)}
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                isTaskCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrentTask
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              } ${
                                isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                              }`}
                              title={isClickable ? `Click to navigate to ${task}` : task}
                            >
                              {task}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Task Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={goToPreviousTask}
                  disabled={currentTaskIndexInDomain === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    currentTaskIndexInDomain === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-ink-700 text-white hover:bg-ink-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Task
                </button>

                <div className="text-sm text-gray-600 text-center order-first sm:order-none">
                  Task {currentTaskIndexInDomain + 1} of {currentDomainTasks.length}
                </div>

                <button
                  onClick={goToNextTask}
                  disabled={currentTaskIndexInDomain >= Math.min(
                    (completedTasksByDomain[currentDomain] || []).length,
                    currentDomainTasks.length - 1
                  )}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    currentTaskIndexInDomain >= Math.min(
                      (completedTasksByDomain[currentDomain] || []).length,
                      currentDomainTasks.length - 1
                    )
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-ink-700 text-white hover:bg-ink-500'
                  }`}
                >
                  Next Task
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Task Area */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <h2 className="text-xl font-semibold">Domain {currentDomainIndex + 1} of {selectedDomains.length}: {currentDomain}</h2>
              <p className="text-sm text-gray-600">{studentName} - {gradeLevel}</p>
            </div>
            <div className="space-y-5 px-4 sm:px-6 py-6 text-sm">
              {/* Render interactive task component based on domain */}
              <div className="rounded-md border border-gray-200 bg-white p-4">
                {currentDomain === 'Dyslexia' && <DyslexiaTask onComplete={handleTaskComplete} onTaskStepComplete={handleTaskStepComplete} currentStep={currentTaskIndexInDomain} />}
                {currentDomain === 'Dysgraphia' && <DysgraphiaTask onComplete={handleTaskComplete} onTaskStepComplete={handleTaskStepComplete} currentStep={currentTaskIndexInDomain} />}
                {currentDomain === 'Dyscalculia' && <DyscalculiaTask onComplete={handleTaskComplete} onTaskStepComplete={handleTaskStepComplete} currentStep={currentTaskIndexInDomain} />}
                {currentDomain === 'Dyspraxia' && <DyspraxiaTask onComplete={handleTaskComplete} onTaskStepComplete={handleTaskStepComplete} currentStep={currentTaskIndexInDomain} />}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-800">Domain: {currentDomain}</div>
                  <div className="text-sm">Complete the interactive tasks above. Your responses will be automatically scored.</div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={goBack}
                  >
                    {currentDomainIndex === 0 ? 'Back to setup' : 'Previous domain'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {phase === 'summary' && (
        <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Assessment Statistics */}
          {assessmentStats && (
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-primary-50 to-mint-50 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Assessment Summary</h2>
                <p className="text-sm text-gray-600">{studentName} - {gradeLevel}</p>
              </div>
              <div className="px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
                  <div className="rounded-lg bg-white border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-primary-600">{assessmentStats.overallScore}%</div>
                    <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-ink-700">{assessmentStats.duration}</div>
                    <div className="text-sm text-gray-600 mt-1">Duration</div>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-mint-600">{assessmentStats.completedDomains}/{assessmentStats.totalDomains}</div>
                    <div className="text-sm text-gray-600 mt-1">Domains Completed</div>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-coral-500">{assessmentStats.totalTasks}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
                  </div>
                </div>

                {/* Domain Scores */}
                <div className="rounded-lg bg-white border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Domain Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(assessmentStats.domainScores).map(([domain, score]) => (
                      <div key={domain}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{domain}</span>
                          <span className="text-sm font-semibold text-gray-900">{score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white border border-gray-200 p-4 mt-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Domain Decisions</h3>

                  {ruleSummaryLoading && (
                    <p className="text-sm text-gray-600">Evaluating task-score rules and generating interventions...</p>
                  )}

                  {!ruleSummaryLoading && ruleSummaryError && (
                    <p className="text-sm text-red-600">{ruleSummaryError}</p>
                  )}

                  {!ruleSummaryLoading && !ruleSummaryError && selectedDomains.length > 0 && (
                    <div className="space-y-4">
                      {selectedDomains.map((domain) => {
                        const apiDomain = DOMAIN_KEY_MAP[domain];
                        const item = apiDomain ? ruleSummary[apiDomain] : null;
                        const decision = item?.decision;
                        const recs = item?.recommendations || {};
                        const weakTasks = item?.rule_results?.weak_tasks || [];
                        const criticalTasks = item?.rule_results?.critical_tasks || [];
                        const targetedFocus = recs?.targeted_task_focus || [];

                        return (
                          <div key={domain} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="font-medium text-gray-900">{domain}</span>
                              {decision ? (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    decision.has_learning_disability
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {decision.has_learning_disability ? 'At risk (disability likely)' : 'No strong disability signal'}
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                  No rule output
                                </span>
                              )}
                            </div>

                            {decision && (
                              <div className="grid gap-2 sm:grid-cols-3 text-xs mb-2">
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="text-gray-500">Risk level</div>
                                  <div className="font-semibold text-gray-900 capitalize">{decision.risk_level}</div>
                                </div>
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="text-gray-500">Risk score</div>
                                  <div className="font-semibold text-gray-900">{Math.round((decision.risk_score || 0) * 100)}%</div>
                                </div>
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="text-gray-500">Weak tasks</div>
                                  <div className="font-semibold text-gray-900">{weakTasks.length}</div>
                                </div>
                              </div>
                            )}

                            {criticalTasks.length > 0 && (
                              <p className="text-xs text-red-700 mb-1">
                                Critical tasks: {criticalTasks.join(', ')}
                              </p>
                            )}

                            {weakTasks.length > 0 && (
                              <p className="text-xs text-amber-700 mb-2">
                                Weak tasks: {weakTasks.join(', ')}
                              </p>
                            )}

                            {targetedFocus.length > 0 && (
                              <p className="text-xs text-primary-700 mb-2">
                                Intervention focus: {targetedFocus.join(', ')}
                              </p>
                            )}

                            {(recs.classroom_accommodations?.length || recs.practice_exercises?.length || recs.teacher_action_plan?.length) ? (
                              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="font-medium text-gray-800 mb-1">Classroom support</div>
                                  <ul className="list-disc pl-4 text-gray-600 space-y-0.5">
                                    {(recs.classroom_accommodations || []).map((itemText) => (
                                      <li key={itemText}>{itemText}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="font-medium text-gray-800 mb-1">Practice focus</div>
                                  <ul className="list-disc pl-4 text-gray-600 space-y-0.5">
                                    {(recs.practice_exercises || []).map((itemText) => (
                                      <li key={itemText}>{itemText}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="rounded border border-gray-200 bg-white p-2">
                                  <div className="font-medium text-gray-800 mb-1">Teacher actions</div>
                                  <ul className="list-disc pl-4 text-gray-600 space-y-0.5">
                                    {(recs.teacher_action_plan || []).map((itemText) => (
                                      <li key={itemText}>{itemText}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <div className="self-start rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Session wrap-up</h2>
              <p className="text-sm text-gray-600">You have stepped through all planned tasks for this screening configuration.</p>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-gray-800">
              <p>
                Record your qualitative impressions and key observations from this session. Quantitative metrics such as accuracy,
                speed, and error rates are entered into the offline scoring and risk engine.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600">
                <li>Confirm that each domain's core tasks have been attempted.</li>
                <li>Note any accommodations used or factors that may have influenced performance.</li>
                <li>Plan follow-up classroom strategies or referrals based on observed needs.</li>
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                <span>Next: open the dashboard to view aggregate risk summaries once the offline engine has processed this session.</span>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={resetSession}
                  >
                    Configure another session
                  </button>
                  <Link
                    to="/dashboard"
                    className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Go to dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Domains and tasks covered</h3>
              <p className="text-sm text-gray-600">Use this as a quick record of the tasks administered during this session.</p>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
              {selectedDomains.map((domain) => (
                <div key={domain} className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{domain}</span>
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-sm text-primary-700">
                      {TASKS_BY_DOMAIN[domain].length} tasks
                    </span>
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-700">
                    {TASKS_BY_DOMAIN[domain].map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create new student</h3>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateNewStudent} className="space-y-4 px-6 py-5 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-gray-800">Student ID</label>
                  <input
                    required
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., STU-001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-gray-800">Grade</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none bg-white"
                  >
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-gray-800">First name</label>
                  <input
                    required
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., Jane"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-gray-800">Last name</label>
                  <input
                    required
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., Doe"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
                  disabled={creatingStudent}
                >
                  {creatingStudent ? 'Saving...' : 'Save student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AssessmentFlow;
