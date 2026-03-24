import React, { useEffect, useState } from "react";

const TASK_DEFINITIONS = [
  {
    key: "sentence_copying",
    title: "Sentence Copying",
    prompt: "Capture a clear photo of the student's copied sentence.",
    teacherInstructions: [
      "Show the sentence to the student.",
      "Ask: Please copy this sentence exactly as you see it.",
      "Observe posture, grip, spacing, and fluency.",
      "Upload a clear image of the writing sample.",
    ],
    sampleText: "The cat sat on the mat.",
  },
  {
    key: "dictation",
    title: "Dictation",
    prompt: "Capture a clear photo of the dictated writing sample.",
    teacherInstructions: [
      "Read clearly: Birds fly in the sky.",
      "Ask student to write what they heard.",
      "Do not repeat or spell words.",
      "Upload a clear image of the writing sample.",
    ],
  },
  {
    key: "free_writing",
    title: "Free Writing Sample",
    prompt: "Capture a clear photo of the free-writing sample.",
    teacherInstructions: [
      "Ask: Write 2-3 sentences about your favorite activity.",
      "Avoid correcting spelling while writing.",
      "Observe speed, hesitations, and erasures.",
      "Upload a clear image of the writing sample.",
    ],
  },
  {
    key: "letter_formation_tracing",
    title: "Letter Formation Tracing",
    prompt: "Capture a clear photo of traced letters (for example: a, b, d, g, p).",
    teacherInstructions: [
      "Provide traced/dotted letters to copy.",
      "Observe stroke sequence and smoothness.",
      "Look for tremor, reversals, and hesitations.",
      "Upload a clear image of the tracing sample.",
    ],
  },
  {
    key: "shape_tracing",
    title: "Shape Tracing",
    prompt: "Capture a clear photo of traced shapes or patterns.",
    teacherInstructions: [
      "Provide simple shapes/patterns to trace.",
      "Observe line control and closure.",
      "Note restarts, pressure, and deviation.",
      "Upload a clear image of the tracing sample.",
    ],
  },
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const estimateImageQuality = (dataUrl) => {
  if (!dataUrl) return 0;

  // Approximate bytes from base64 data URL payload.
  const base64Part = dataUrl.split(",")[1] || "";
  const approxBytes = Math.floor((base64Part.length * 3) / 4);

  // 30KB to 320KB maps roughly from weak to strong signal.
  const quality = (approxBytes - 30 * 1024) / (290 * 1024);
  return clamp01(quality);
};

export default function DysgraphiaTask({ onComplete, onTaskStepComplete, currentStep }) {
  const [step, setStep] = useState(currentStep || 0);
  const [startTime] = useState(Date.now());
  const [samples, setSamples] = useState({});

  useEffect(() => {
    if (currentStep !== undefined && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep, step]);

  const currentTask = TASK_DEFINITIONS[step];
  const currentSample = currentTask ? samples[currentTask.key] : null;

  const handleImageUpload = (taskKey, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSamples((prev) => ({
        ...prev,
        [taskKey]: {
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          dataUrl: reader.result,
          capturedAt: new Date().toISOString(),
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (!currentTask || !currentSample) return;

    const quality = estimateImageQuality(currentSample.dataUrl);
    onTaskStepComplete?.({ correct: Math.round(quality * 10), total: 10 });

    if (step < TASK_DEFINITIONS.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = () => {
    const totalTime = Date.now() - startTime;
    const qualityValues = TASK_DEFINITIONS.map((task) =>
      estimateImageQuality(samples[task.key]?.dataUrl)
    );

    const avgQuality =
      qualityValues.length > 0
        ? qualityValues.reduce((sum, value) => sum + value, 0) / qualityValues.length
        : 0;

    const tasksPerMinute = TASK_DEFINITIONS.length / Math.max(totalTime / 60000, 1 / 60);
    const writingSpeed = clamp01(tasksPerMinute / 6);

    onComplete({
      task_type: "dysgraphia",
      raw_data: {
        handwriting_samples: samples,
        total_time: totalTime,
      },
      computed: {
        writing_speed: writingSpeed,
        spelling_error_rate: clamp01(1 - avgQuality * 0.8),
        spelling_inconsistency: clamp01(1 - avgQuality * 0.75),
        spacing_variance: clamp01(1 - avgQuality * 0.78),
        stroke_deviation: clamp01(1 - avgQuality),
        motor_hesitation: clamp01(totalTime / (1000 * 60 * 20)),
        handwriting_image_quality: avgQuality,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink-700">Dysgraphia Assessment (Image-Based)</h3>
        <span className="text-sm text-ink-500">
          Step {step + 1} / {TASK_DEFINITIONS.length}
        </span>
      </div>

      {currentTask && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-6 h-6 text-ink-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="9" cy="8" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20v-1a5 5 0 0110 0v1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6M17 3v6" />
              </svg>
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">{currentTask.title}:</p>
              <ol className="list-decimal pl-5 space-y-1">
                {currentTask.teacherInstructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              {currentTask.sampleText && (
                <div className="mt-3 rounded-md border border-slate-300 bg-white p-3 text-ink-700">
                  <p className="text-xs uppercase tracking-wide text-ink-500 mb-1">Reference sentence</p>
                  <p className="font-serif text-lg">{currentTask.sampleText}</p>
                </div>
              )}
              <p className="text-xs text-ink-500 mt-3 italic">
                Handwriting images will be used for dysgraphia model training and inference.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-6 h-6 text-ink-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1a7 7 0 0114 0v1" />
              </svg>
              <h4 className="font-semibold text-ink-700">Student Response</h4>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-ink-700">{currentTask.prompt}</p>

              <label className="block rounded-md border border-dashed border-slate-400 p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <span className="block text-sm text-ink-700 mb-2">Upload handwriting image</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="block w-full text-sm text-ink-600"
                  onChange={(event) =>
                    handleImageUpload(currentTask.key, event.target.files?.[0])
                  }
                />
              </label>

              {currentSample?.dataUrl && (
                <div className="rounded-md border border-slate-300 p-3 bg-white">
                  <p className="text-xs text-ink-500 mb-2">
                    {currentSample.fileName} ({Math.round(currentSample.fileSize / 1024)} KB)
                  </p>
                  <img
                    src={currentSample.dataUrl}
                    alt={`${currentTask.title} handwriting sample`}
                    className="w-full max-h-64 object-contain rounded-md border border-slate-200"
                  />
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!currentSample}
                className="w-full px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500 disabled:bg-slate-300"
              >
                {step < TASK_DEFINITIONS.length - 1
                  ? "Next"
                  : "Complete Dysgraphia Tasks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
