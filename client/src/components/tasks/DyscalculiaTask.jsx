import React, { useState, useEffect } from "react";

const SKIP_COUNTING = [
  { label: "Count by 2s from 2 to 10", expected: [2, 4, 6, 8, 10] },
  { label: "Count by 5s from 5 to 25", expected: [5, 10, 15, 20, 25] },
];

const ARITHMETIC = [
  { problem: "5 + 3", answer: 8 },
  { problem: "9 - 4", answer: 5 },
  { problem: "6 + 2", answer: 8 },
  { problem: "7 - 3", answer: 4 },
];

const SYMBOLS = [
  { symbol: "+", name: "plus" },
  { symbol: "−", name: "minus" },
  { symbol: "×", name: "times" },
  { symbol: "÷", name: "divide" },
];

const COMPARISONS = [
  { left: 7, right: 5, correct: ">" },
  { left: 3, right: 8, correct: "<" },
  { left: 6, right: 6, correct: "=" },
];

const parseNumberSequence = (text) => {
  const matches = String(text || "").match(/\d+/g);
  return matches ? matches.map((item) => parseInt(item, 10)) : [];
};

const isExactOrderedSequence = (value, expected) => {
  const actual = parseNumberSequence(value);
  if (actual.length !== expected.length) return false;
  return expected.every((num, idx) => actual[idx] === num);
};

export default function DyscalculiaTask({ onComplete, onTaskStepComplete, currentStep }) {
  const [step, setStep] = useState(currentStep || 0);
  
  // Sync internal step with external navigation
  useEffect(() => {
    if (currentStep !== undefined && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep]);
  const [countingAnswers, setCountingAnswers] = useState([]);
  const [arithmeticAnswers, setArithmeticAnswers] = useState([]);
  const [symbolAnswers, setSymbolAnswers] = useState([]);
  const [comparisonAnswers, setComparisonAnswers] = useState([]);
  const [factRecall, setFactRecall] = useState("");
  const [numberLineAnswer, setNumberLineAnswer] = useState("");
  const [startTime] = useState(Date.now());

  const handleCountingSubmit = (idx, value) => {
    setCountingAnswers([...countingAnswers, { idx, value }]);
    if (countingAnswers.length + 1 >= SKIP_COUNTING.length) {
      setTimeout(() => {
        const correctCount = [...countingAnswers, { idx, value }].filter((a) => {
          const expected = SKIP_COUNTING[a.idx].expected;
          return isExactOrderedSequence(a.value, expected);
        }).length;
        onTaskStepComplete?.({ correct: correctCount, total: SKIP_COUNTING.length });
        setStep(1);
      }, 300);
    }
  };

  const handleArithmeticClick = (idx, value) => {
    const correct = parseInt(value) === ARITHMETIC[idx].answer;
    setArithmeticAnswers([...arithmeticAnswers, { idx, value: parseInt(value), correct }]);
    if (arithmeticAnswers.length + 1 >= ARITHMETIC.length) {
      setTimeout(() => {
        const correctCount = [...arithmeticAnswers, { idx, value: parseInt(value), correct }].filter(a => a.correct).length;
        onTaskStepComplete?.({ correct: correctCount, total: ARITHMETIC.length });
        setStep(2);
      }, 300);
    }
  };

  const handleSymbolClick = (idx, answer) => {
    const correct = answer.toLowerCase() === SYMBOLS[idx].name;
    setSymbolAnswers([...symbolAnswers, { idx, answer, correct }]);
    if (symbolAnswers.length + 1 >= SYMBOLS.length) {
      setTimeout(() => {
        const correctCount = [...symbolAnswers, { idx, answer, correct }].filter(s => s.correct).length;
        onTaskStepComplete?.({ correct: correctCount, total: SYMBOLS.length });
        setStep(3);
      }, 300);
    }
  };

  const handleComparisonClick = (idx, answer) => {
    const correct = answer === COMPARISONS[idx].correct;
    setComparisonAnswers([...comparisonAnswers, { idx, answer, correct }]);
    if (comparisonAnswers.length + 1 >= COMPARISONS.length) {
      setTimeout(() => {
        const correctCount = [...comparisonAnswers, { idx, answer, correct }].filter(c => c.correct).length;
        onTaskStepComplete?.({ correct: correctCount, total: COMPARISONS.length });
        setStep(4);
      }, 300);
    }
  };

  const handleSubmit = () => {
    const countingCorrect = countingAnswers.filter((a) => {
      const expected = SKIP_COUNTING[a.idx].expected;
      return isExactOrderedSequence(a.value, expected);
    }).length;

    const arithmeticCorrect = arithmeticAnswers.filter((a) => a.correct).length;
    const symbolCorrect = symbolAnswers.filter((s) => s.correct).length;
    const comparisonCorrect = comparisonAnswers.filter((c) => c.correct).length;
    const factCorrect = factRecall.includes("10") || factRecall.includes("ten");
    const numberLineCorrect = numberLineAnswer.includes("5");

    onComplete({
      task_type: "dyscalculia",
      raw_data: {
        counting_answers: countingAnswers,
        arithmetic_answers: arithmeticAnswers,
        symbol_answers: symbolAnswers,
        comparison_answers: comparisonAnswers,
        fact_recall: factRecall,
        number_line_answer: numberLineAnswer,
      },
      computed: {
        counting_accuracy: countingCorrect / SKIP_COUNTING.length,
        arithmetic_accuracy: arithmeticCorrect / ARITHMETIC.length,
        symbol_confusion: 1 - symbolCorrect / SYMBOLS.length,
        quantity_comparison: comparisonCorrect / COMPARISONS.length,
        fact_recall: factCorrect ? 1 : 0,
        number_line_deviation: numberLineCorrect ? 0.1 : 0.5,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink-700">Dyscalculia Assessment</h3>
        <span className="text-sm text-ink-500">Step {step + 1} / 5</span>
      </div>

      {step === 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" /></svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Skip Counting Task:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Read the instruction to the student</li>
                <li>Allow thinking time (no counting on fingers)</li>
                <li>Student types the complete sequence</li>
                <li>Observe counting strategies and patterns</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests number sense and sequential understanding
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="space-y-4">
          {SKIP_COUNTING.map((item, idx) => {
            const done = countingAnswers.some((a) => a.idx === idx);
            return (
              <div key={idx} className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                <p className="text-sm text-ink-700">{item.label}</p>
                {!done ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="flex-1 border border-slate-300 rounded-md px-3 py-2"
                      placeholder="e.g., 2, 4, 6, 8, 10 or 2 4 6 8 10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCountingSubmit(idx, e.target.value);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleCountingSubmit(idx, input.value);
                      }}
                      className="px-3 py-2 rounded-md bg-ink-700 text-white text-sm"
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-ink-500">Recorded</p>
                )}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" /></svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Mental Arithmetic:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Show each problem one at a time</li>
                <li>Student solves mentally and enters answer</li>
                <li>No calculators or fingers allowed</li>
                <li>Observe speed and confidence</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests basic math fact recall and computation
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
            {ARITHMETIC.map((item, idx) => {
              const done = arithmeticAnswers.some((a) => a.idx === idx);
              return (
                <div key={idx} className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                  <p className="text-lg font-bold text-ink-700 text-center">{item.problem} = ?</p>
                  {!done ? (
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-center"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleArithmeticClick(idx, e.target.value);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value) handleArithmeticClick(idx, e.target.value);
                      }}
                    />
                  ) : (
                    <p className="text-xs text-ink-500 text-center">Recorded</p>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" /></svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Symbol Recognition:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Point to each math symbol</li>
                <li>Ask: "What is the name of this symbol?"</li>
                <li>Accept common names (plus, minus, times, divide)</li>
                <li>Note any symbol confusion</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests symbolic understanding in math
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
            {SYMBOLS.map((item, idx) => {
              const done = symbolAnswers.some((s) => s.idx === idx);
              return (
                <div key={idx} className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                  <div className="text-4xl font-bold text-ink-700 text-center">{item.symbol}</div>
                  {!done ? (
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-center"
                      placeholder="Type name..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSymbolClick(idx, e.target.value);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value) handleSymbolClick(idx, e.target.value);
                      }}
                    />
                  ) : (
                    <p className="text-xs text-ink-500 text-center">Recorded</p>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" /></svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Quantity Comparison:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Show each number pair</li>
                <li>Ask: "Which symbol goes in the blank?"</li>
                <li>Student clicks greater than, less than, or equal</li>
                <li>Observe comparison strategies</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests understanding of number magnitude
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="space-y-3">
            {COMPARISONS.map((item, idx) => {
              const done = comparisonAnswers.some((c) => c.idx === idx);
              return (
                <div key={idx} className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                  <p className="text-2xl font-bold text-ink-700 text-center">{item.left} __ {item.right}</p>
                  {!done ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleComparisonClick(idx, ">")}
                        className="px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500"
                      >
                        &gt;
                      </button>
                      <button
                        onClick={() => handleComparisonClick(idx, "<")}
                        className="px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() => handleComparisonClick(idx, "=")}
                        className="px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500"
                      >
                        =
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-500 text-center">Recorded</p>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" /></svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-3 text-sm text-ink-600">
              <div>
                <p className="font-medium">Math Fact Recall:</p>
                <p>Ask verbally: "What is 5 plus 5?"</p>
              </div>
              <div>
                <p className="font-medium">Number Line Understanding:</p>
                <p>Ask: "On a number line from 0 to 10, where would 5 be?"</p>
              </div>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests automaticity and spatial number sense
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-ink-700">What is 5 + 5?</p>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={factRecall}
                  onChange={(e) => setFactRecall(e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-ink-700">On a number line from 0 to 10, where is 5?</p>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={numberLineAnswer}
                  onChange={(e) => setNumberLineAnswer(e.target.value)}
                  placeholder="Type position (e.g., middle, halfway, 5)..."
                />
              </div>
              <button onClick={handleSubmit} className="w-full px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500">
                Complete Dyscalculia Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

