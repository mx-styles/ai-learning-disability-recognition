import React, { useState, useEffect, useRef } from 'react';

// Task Component Wrappers
export const DyslexiaWordReading = ({ task, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [wordStartTime, setWordStartTime] = useState(Date.now());
  const [answer, setAnswer] = useState('');

  const words = task.items || [];
  const currentWord = words[currentIndex];

  const handleSubmit = () => {
    const timeTaken = Date.now() - wordStartTime;
    const isCorrect = answer.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    const newResponses = [...responses, {
      word: currentWord.word,
      difficulty: currentWord.difficulty,
      userAnswer: answer,
      correct: isCorrect,
      timeTaken
    }];

    setResponses(newResponses);
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setWordStartTime(Date.now());
    } else {
      // Task complete
      onComplete({
        responses: newResponses,
        totalTime: Date.now() - startTime,
        correctCount: newResponses.filter(r => r.correct).length,
        totalWords: words.length
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Word {currentIndex + 1} of {words.length}</span>
          <span>Difficulty: {currentWord?.difficulty || 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-4xl font-bold text-indigo-900 mb-4">
          {currentWord?.word}
        </p>
        <p className="text-gray-600">Read this word aloud, then type it below</p>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          placeholder="Type the word here"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="mt-4 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {currentIndex < words.length - 1 ? 'Next Word' : 'Complete Task'}
        </button>
      </div>
    </div>
  );
};

export const DyslexiaMinimalPairs = ({ task, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime] = useState(Date.now());

  const pairs = task.pairs || [];
  const currentPair = pairs[currentIndex];

  const handleAnswer = (areSame) => {
    const newResponses = [...responses, {
      pair: currentPair,
      userAnswer: areSame,
      correct: areSame === currentPair.same
    }];

    setResponses(newResponses);

    if (currentIndex < pairs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({
        responses: newResponses,
        totalTime: Date.now() - startTime,
        correctCount: newResponses.filter(r => r.correct).length,
        totalPairs: pairs.length
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Pair {currentIndex + 1} of {pairs.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / pairs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-700 mb-6">Do these two words sound the same or different?</p>
        <div className="flex justify-center items-center gap-8 mb-8">
          <span className="text-4xl font-bold text-indigo-900">{currentPair?.word1}</span>
          <span className="text-2xl text-gray-400">vs</span>
          <span className="text-4xl font-bold text-indigo-900">{currentPair?.word2}</span>
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition text-lg font-medium"
        >
          Same Sound
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition text-lg font-medium"
        >
          Different Sound
        </button>
      </div>
    </div>
  );
};

export const DyscalculiaMentalArithmetic = ({ task, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime] = useState(Date.now());
  const [problemStartTime, setProblemStartTime] = useState(Date.now());
  const [answer, setAnswer] = useState('');

  const problems = task.problems || [];
  const currentProblem = problems[currentIndex];

  const handleSubmit = () => {
    const timeTaken = Date.now() - problemStartTime;
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === currentProblem.answer;

    const newResponses = [...responses, {
      problem: currentProblem.problem,
      correctAnswer: currentProblem.answer,
      userAnswer,
      correct: isCorrect,
      timeTaken
    }];

    setResponses(newResponses);

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setProblemStartTime(Date.now());
    } else {
      onComplete({
        responses: newResponses,
        totalTime: Date.now() - startTime,
        correctCount: newResponses.filter(r => r.correct).length,
        totalProblems: problems.length
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Problem {currentIndex + 1} of {problems.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-600 mb-4">Solve this problem in your head:</p>
        <p className="text-5xl font-bold text-green-900 mb-8">
          {currentProblem?.problem}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg text-center"
          placeholder="Your answer"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={answer === ''}
          className="mt-4 w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {currentIndex < problems.length - 1 ? 'Next Problem' : 'Complete Task'}
        </button>
      </div>
    </div>
  );
};

export const DysgraphiaCopying = ({ task, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime] = useState(Date.now());
  const [sentenceStartTime, setSentenceStartTime] = useState(Date.now());
  const [writtenText, setWrittenText] = useState('');

  const sentences = task.sentences || [];
  const currentSentence = sentences[currentIndex];

  const handleSubmit = () => {
    const timeTaken = Date.now() - sentenceStartTime;
    
    const newResponses = [...responses, {
      originalSentence: currentSentence.text,
      writtenText,
      difficulty: currentSentence.difficulty,
      timeTaken,
      length: writtenText.length
    }];

    setResponses(newResponses);

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setWrittenText('');
      setSentenceStartTime(Date.now());
    } else {
      onComplete({
        responses: newResponses,
        totalTime: Date.now() - startTime
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Sentence {currentIndex + 1} of {sentences.length}</span>
          <span>Difficulty: {currentSentence?.difficulty || 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-3">Copy this sentence exactly as you see it:</p>
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-2xl text-gray-900 font-serif leading-relaxed">
            {currentSentence?.text}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <textarea
          value={writtenText}
          onChange={(e) => setWrittenText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-serif min-h-[120px]"
          placeholder="Write the sentence here..."
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!writtenText.trim()}
          className="mt-4 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {currentIndex < sentences.length - 1 ? 'Next Sentence' : 'Complete Task'}
        </button>
      </div>
    </div>
  );
};

export const DyspraxiaShapeReplication = ({ task, onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime] = useState(Date.now());
  const [shapeStartTime, setShapeStartTime] = useState(Date.now());
  const [strokes, setStrokes] = useState([]);

  const shapes = task.shapes || [];
  const currentShape = shapes[currentIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }
  }, [currentIndex]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStrokes([...strokes, [{ x, y, time: Date.now() }]]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStrokes = [...strokes];
    newStrokes[newStrokes.length - 1].push({ x, y, time: Date.now() });
    setStrokes(newStrokes);

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const lastStroke = newStrokes[newStrokes.length - 1];
    const lastPoint = lastStroke[lastStroke.length - 2];
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
  };

  const handleSubmit = () => {
    const timeTaken = Date.now() - shapeStartTime;
    
    const newResponses = [...responses, {
      shapeName: currentShape.name,
      difficulty: currentShape.difficulty,
      strokes: strokes.length,
      timeTaken,
      drawingData: strokes
    }];

    setResponses(newResponses);

    if (currentIndex < shapes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStrokes([]);
      setShapeStartTime(Date.now());
      clearCanvas();
    } else {
      onComplete({
        responses: newResponses,
        totalTime: Date.now() - startTime
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Shape {currentIndex + 1} of {shapes.length}</span>
          <span>Difficulty: {currentShape?.difficulty || 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / shapes.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-700 font-medium mb-3">Reference Shape:</p>
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 flex items-center justify-center h-64">
            <p className="text-6xl">{currentShape?.emoji || '○'}</p>
          </div>
          <p className="text-center text-gray-600 mt-2">{currentShape?.name}</p>
        </div>

        <div>
          <p className="text-gray-700 font-medium mb-3">Draw Here:</p>
          <canvas
            ref={canvasRef}
            width={400}
            height={256}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <button
            onClick={clearCanvas}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            Clear Drawing
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={strokes.length === 0}
          className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {currentIndex < shapes.length - 1 ? 'Next Shape' : 'Complete Task'}
        </button>
      </div>
    </div>
  );
};

// Main Task Renderer Component
const TaskRenderer = ({ taskDefinition, onComplete }) => {
  if (!taskDefinition) return null;

  const { category, task_type } = taskDefinition;

  // Map task types to components
  const taskComponents = {
    'dyslexia-word_reading': DyslexiaWordReading,
    'dyslexia-minimal_pairs': DyslexiaMinimalPairs,
    'dyscalculia-mental_arithmetic': DyscalculiaMentalArithmetic,
    'dysgraphia-copying': DysgraphiaCopying,
    'dyspraxia-shape_replication': DyspraxiaShapeReplication,
  };

  const TaskComponent = taskComponents[`${category}-${task_type}`];

  if (!TaskComponent) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Task type "{task_type}" for category "{category}" is not yet implemented.
        </p>
      </div>
    );
  }

  return <TaskComponent task={taskDefinition} onComplete={onComplete} />;
};

export default TaskRenderer;
