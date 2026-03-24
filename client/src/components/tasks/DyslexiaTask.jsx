import React, { useState, useEffect } from "react";

const WORD_READING = ["cat", "ship", "phone", "thought", "island", "knight"];
const MINIMAL_PAIRS = [
  { pair: ["bat", "pat"], correct: 0 },
  { pair: ["sip", "zip"], correct: 1 },
  { pair: ["fan", "van"], correct: 1 },
  { pair: ["thin", "tin"], correct: 0 },
];
const MINIMAL_PAIR_SCRIPT = MINIMAL_PAIRS.map((item) => item.pair[item.correct]);
const LETTER_PAIRS = ["b/d", "p/q", "m/w", "u/n", "s/z"];
const PARAGRAPH = "The quick brown fox jumps over the lazy dog. This sentence contains every letter.";
const SEQUENCE = ["red", "blue", "green", "yellow"];

const normalizeWords = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export default function DyslexiaTask({ onComplete, onTaskStepComplete, currentStep }) {
  const [step, setStep] = useState(currentStep || 0);
  
  // Sync internal step with external navigation
  useEffect(() => {
    if (currentStep !== undefined && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep]);
  const [wordReadings, setWordReadings] = useState([]);
  const [pairAnswers, setPairAnswers] = useState([]);
  const [letterConfusions, setLetterConfusions] = useState([]);
  const [comprehension, setComprehension] = useState("");
  const [sequenceRecall, setSequenceRecall] = useState("");
  const [startTime] = useState(Date.now());

  const evaluateComprehension = () => {
    const comprehensionWords = normalizeWords(comprehension);
    const hasFox = comprehensionWords.includes("fox");
    const hasDog = comprehensionWords.includes("dog");
    return hasFox && hasDog;
  };

  const evaluateSequence = () => {
    const sequenceWords = normalizeWords(sequenceRecall);
    return (
      sequenceWords.length === SEQUENCE.length &&
      SEQUENCE.every((color, idx) => sequenceWords[idx] === color)
    );
  };

  const handleWordRead = (word, correct) => {
    setWordReadings([...wordReadings, { word, correct, time: Date.now() - startTime }]);
    if (wordReadings.length + 1 >= WORD_READING.length) {
      setTimeout(() => {
        const correctCount = [...wordReadings, { word, correct }].filter(w => w.correct).length;
        onTaskStepComplete?.({ correct: correctCount, total: WORD_READING.length });
        setStep(1);
      }, 300);
    }
  };

  const handlePairClick = (index, choice) => {
    setPairAnswers([...pairAnswers, { index, choice, correct: choice === MINIMAL_PAIRS[index].correct }]);
    if (pairAnswers.length + 1 >= MINIMAL_PAIRS.length) {
      setTimeout(() => {
        const correctCount = [...pairAnswers, { index, choice, correct: choice === MINIMAL_PAIRS[index].correct }].filter(p => p.correct).length;
        onTaskStepComplete?.({ correct: correctCount, total: MINIMAL_PAIRS.length });
        setStep(2);
      }, 300);
    }
  };

  const handleLetterClick = (pair, confused) => {
    setLetterConfusions([...letterConfusions, { pair, confused }]);
    if (letterConfusions.length + 1 >= LETTER_PAIRS.length) {
      setTimeout(() => {
        const correctCount = [...letterConfusions, { pair, confused }].filter(l => !l.confused).length;
        onTaskStepComplete?.({ correct: correctCount, total: LETTER_PAIRS.length });
        setStep(3);
      }, 300);
    }
  };

  const handleComprehensionContinue = () => {
    const hasComprehension = evaluateComprehension();
    onTaskStepComplete?.({ correct: hasComprehension ? 1 : 0, total: 1 });
    setStep(4);
  };

  const handleSubmit = () => {
    const totalTime = Date.now() - startTime;
    const wordAccuracy = wordReadings.filter((w) => w.correct).length / WORD_READING.length;
    const phonemeAccuracy = pairAnswers.filter((p) => p.correct).length / MINIMAL_PAIRS.length;
    const letterConfusionCount = letterConfusions.filter((l) => l.confused).length;
    const hasComprehension = evaluateComprehension();
    const sequenceCorrect = evaluateSequence();

    onTaskStepComplete?.({ correct: sequenceCorrect ? 1 : 0, total: 1 });

    const taskScores = {
      word_reading_accuracy: wordAccuracy,
      minimal_pair_discrimination: phonemeAccuracy,
      letter_discrimination: 1 - letterConfusionCount / LETTER_PAIRS.length,
      paragraph_reading_comprehension: hasComprehension ? 1 : 0,
      verbal_sequential_memory: sequenceCorrect ? 1 : 0,
    };

    onComplete({
      task_type: "dyslexia",
      raw_data: {
        word_readings: wordReadings,
        pair_answers: pairAnswers,
        letter_confusions: letterConfusions,
        comprehension,
        sequence_recall: sequenceRecall,
        task_scores: taskScores,
      },
      computed: {
        phoneme_error_rate: 1 - phonemeAccuracy,
        reading_accuracy: wordAccuracy,
        reading_speed: Math.min(1.2, WORD_READING.length / (totalTime / 60000)),
        letter_confusion_score: letterConfusionCount / LETTER_PAIRS.length,
        comprehension_accuracy: hasComprehension ? 1 : 0,
        verbal_memory: sequenceCorrect ? 1 : 0.5,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink-700">Dyslexia Assessment</h3>
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
              <p className="font-medium">Word Reading Task:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Point to each word one at a time</li>
                <li>Ask the student: "Please read this word aloud"</li>
                <li>Listen carefully to pronunciation</li>
                <li>Mark whether the word was read correctly or incorrectly</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Note: Words increase in complexity from simple (cat) to irregular (knight)
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
            {WORD_READING.map((word, idx) => {
              const done = wordReadings.some((w) => w.word === word);
              return (
                <div key={word} className="bg-white border border-slate-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-ink-700 mb-3">{word}</div>
                  {!done ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleWordRead(word, true)}
                        className="px-3 py-1 rounded-md bg-mint-300 text-ink-700 text-sm"
                      >
                        ✓ Correct
                      </button>
                      <button
                        onClick={() => handleWordRead(word, false)}
                        className="px-3 py-1 rounded-md bg-coral-400 text-white text-sm"
                      >
                        ✗ Incorrect
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-500">Recorded</span>
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
              <p className="font-medium">Minimal Pair Discrimination:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Say one of the two words clearly (e.g., "bat" or "pat")</li>
                <li>Ask the student: "Which word did I say?"</li>
                <li>Have the student click their choice</li>
                <li>Do NOT repeat the word</li>
              </ol>
              <br />
              <p className="font-medium text-ink-700 mb-2">Teacher script (words to say):</p>
              <ol className="list-decimal pl-5 space-y-1">
                {MINIMAL_PAIR_SCRIPT.map((word, idx) => (
                  <li key={idx}>
                    Pair {idx + 1}: say "{word}"
                  </li>
                ))}
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests ability to distinguish similar-sounding phonemes
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="space-y-3">
            {MINIMAL_PAIRS.map((item, idx) => {
              const done = pairAnswers.some((p) => p.index === idx);
              return (
                <div key={idx} className="bg-white border border-slate-300 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-ink-600 text-center mb-3">Which word did the teacher say?</p>
                  {!done ? (
                    <div className="flex gap-3 justify-center">
                      {item.pair.map((word, choice) => (
                        <button
                          key={word}
                          onClick={() => handlePairClick(idx, choice)}
                          className="px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center text-ink-500">Recorded</p>
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
              <p className="font-medium">Letter Discrimination:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Show each letter pair to the student</li>
                <li>Ask: "Do these letters look confusing or hard to tell apart?"</li>
                <li>Have student indicate "Clear" if easy, "Confusing" if difficult</li>
                <li>Watch for visual processing difficulties</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Common confusion pairs: b/d, p/q, m/w
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" /></svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
            {LETTER_PAIRS.map((pair) => {
              const done = letterConfusions.some((l) => l.pair === pair);
              return (
                <div key={pair} className="bg-white border border-slate-300 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-ink-700 mb-3">{pair}</div>
                  {!done ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleLetterClick(pair, false)}
                        className="px-3 py-1 rounded-md bg-mint-300 text-ink-700 text-sm"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => handleLetterClick(pair, true)}
                        className="px-3 py-1 rounded-md bg-coral-400 text-white text-sm"
                      >
                        Confusing
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-500">Recorded</span>
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
              <p className="font-medium">Paragraph Reading / Comprehension:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Have student read the paragraph aloud</li>
                <li>Ask: "What animals were mentioned?"</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests reading comprehension accuracy
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
                <p className="text-sm font-medium text-ink-700">Read this paragraph aloud:</p>
                <div className="bg-ink-50 border border-slate-300 rounded-lg p-4 text-ink-700">{PARAGRAPH}</div>
                <label className="flex flex-col text-sm text-ink-600">
                  What animals were mentioned?
                  <input
                    type="text"
                    className="mt-1 border border-slate-300 rounded-md px-3 py-2"
                    value={comprehension}
                    onChange={(e) => setComprehension(e.target.value)}
                    placeholder="Type your answer..."
                  />
                </label>
              </div>
              <button
                onClick={handleComprehensionContinue}
                className="w-full px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500"
              >
                Submit
              </button>
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
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Verbal Sequential Memory:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Show the color sequence for 5 seconds</li>
                <li>Hide it and ask the student to repeat in order</li>
                <li>Record exact sequence recall</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Tests verbal sequential memory
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
                <p className="text-sm font-medium text-ink-700">Repeat this sequence:</p>
                <div className="bg-ink-50 border border-slate-300 rounded-lg p-3 text-center font-semibold text-ink-700">
                  {SEQUENCE.join(", ")}
                </div>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={sequenceRecall}
                  onChange={(e) => setSequenceRecall(e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
              <button onClick={handleSubmit} className="w-full px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500">
                Complete Dyslexia Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

