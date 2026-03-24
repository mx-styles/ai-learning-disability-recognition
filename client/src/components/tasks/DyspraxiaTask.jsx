import React, { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "square", "triangle"];
const TOTAL_STEPS = 5;

const SHAPE_CANVAS = { width: 400, height: 300 };
const PATTERN_CANVAS = { width: 400, height: 220 };
const CURSOR_Y_OFFSET = 8;

const COORDINATION_TARGETS = [
  { x: 12, y: 20 },
  { x: 26, y: 42 },
  { x: 40, y: 28 },
  { x: 56, y: 58 },
  { x: 72, y: 34 },
  { x: 86, y: 66 },
  { x: 68, y: 82 },
  { x: 48, y: 72 },
  { x: 30, y: 86 },
  { x: 14, y: 68 },
];

const DIRECTION_PROMPTS = ["right", "left", "right"];

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const distance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

const pointToSegmentDistance = (point, a, b) => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) return distance(point, a);
  const t = clamp01((apx * abx + apy * aby) / abLenSq);
  const closest = { x: a.x + t * abx, y: a.y + t * aby };
  return distance(point, closest);
};

const normalizePoints = (points) => {
  if (!points.length) return [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return points.map(({ x, y }) => ({
    x: (x - minX) / width,
    y: (y - minY) / height,
  }));
};

const calculatePathSmoothness = (normalizedPoints) => {
  if (normalizedPoints.length < 3) return 0.5;

  const turnAngles = [];
  for (let i = 1; i < normalizedPoints.length - 1; i += 1) {
    const prev = normalizedPoints[i - 1];
    const curr = normalizedPoints[i];
    const next = normalizedPoints[i + 1];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const mag1 = Math.hypot(v1x, v1y);
    const mag2 = Math.hypot(v2x, v2y);
    if (mag1 < 0.001 || mag2 < 0.001) continue;

    const dot = (v1x * v2x + v1y * v2y) / (mag1 * mag2);
    const boundedDot = Math.max(-1, Math.min(1, dot));
    turnAngles.push(Math.acos(boundedDot));
  }

  if (!turnAngles.length) return 0.6;
  const avgTurn = turnAngles.reduce((sum, angle) => sum + angle, 0) / turnAngles.length;
  return clamp01(1 - avgTurn / Math.PI);
};

const evaluateCircleAccuracy = (normalizedPoints) => {
  if (normalizedPoints.length < 16) return 0.05;

  const center = normalizedPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x / normalizedPoints.length, y: acc.y + p.y / normalizedPoints.length }),
    { x: 0, y: 0 }
  );
  const radii = normalizedPoints.map((p) => distance(p, center));
  const meanRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  if (meanRadius < 0.09) return 0.05;

  const closureDistance = distance(normalizedPoints[0], normalizedPoints[normalizedPoints.length - 1]);
  if (closureDistance > meanRadius * 0.95) return 0.1;
  const closure = clamp01(1 - closureDistance / (meanRadius * 0.95));

  const sectors = new Set();
  normalizedPoints.forEach((p) => {
    const angle = Math.atan2(p.y - center.y, p.x - center.x);
    const bucket = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 16);
    sectors.add(Math.max(0, Math.min(15, bucket)));
  });
  const angularCoverage = sectors.size / 16;
  if (angularCoverage < 0.55) return 0.15;

  const variance = radii.reduce((sum, r) => sum + (r - meanRadius) ** 2, 0) / radii.length;
  const stdDev = Math.sqrt(variance);
  const radiusConsistency = clamp01(1 - stdDev / (meanRadius * 0.5));

  let pathLen = 0;
  for (let i = 1; i < normalizedPoints.length; i += 1) {
    pathLen += distance(normalizedPoints[i - 1], normalizedPoints[i]);
  }
  if (pathLen < 1.7) return 0.1;

  return clamp01(0.5 * radiusConsistency + 0.3 * closure + 0.2 * angularCoverage);
};

const evaluateSquareAccuracy = (normalizedPoints) => {
  if (normalizedPoints.length < 13) return 0.05;

  const edgeTolerance = 0.12;
  const cornerTolerance = 0.16;
  let nearEdgeCount = 0;
  const edgeHits = { top: 0, right: 0, bottom: 0, left: 0 };
  const corners = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];
  const cornerHits = [0, 0, 0, 0];

  normalizedPoints.forEach((p) => {
    const distances = {
      top: p.y,
      right: 1 - p.x,
      bottom: 1 - p.y,
      left: p.x,
    };
    const nearest = Math.min(distances.top, distances.right, distances.bottom, distances.left);
    if (nearest <= edgeTolerance) nearEdgeCount += 1;
    if (distances.top <= edgeTolerance) edgeHits.top += 1;
    if (distances.right <= edgeTolerance) edgeHits.right += 1;
    if (distances.bottom <= edgeTolerance) edgeHits.bottom += 1;
    if (distances.left <= edgeTolerance) edgeHits.left += 1;

    corners.forEach((corner, idx) => {
      if (distance(p, corner) <= cornerTolerance) {
        cornerHits[idx] += 1;
      }
    });
  });

  const closureDistance = distance(normalizedPoints[0], normalizedPoints[normalizedPoints.length - 1]);
  if (closureDistance > 0.33) return 0.1;
  const closure = clamp01(1 - closureDistance / 0.33);

  const minX = Math.min(...normalizedPoints.map((p) => p.x));
  const maxX = Math.max(...normalizedPoints.map((p) => p.x));
  const minY = Math.min(...normalizedPoints.map((p) => p.y));
  const maxY = Math.max(...normalizedPoints.map((p) => p.y));
  if (maxX - minX < 0.55 || maxY - minY < 0.55) return 0.1;

  const edgeCoverage = Object.values(edgeHits).filter((count) => count >= normalizedPoints.length * 0.08).length / 4;
  const cornerCoverage = cornerHits.filter((count) => count > 0).length / 4;
  if (edgeCoverage < 0.5 || cornerCoverage < 0.5) return 0.15;

  let pathLen = 0;
  for (let i = 1; i < normalizedPoints.length; i += 1) {
    pathLen += distance(normalizedPoints[i - 1], normalizedPoints[i]);
  }
  if (pathLen < 1.3) return 0.1;

  return clamp01(0.5 * edgeCoverage + 0.2 * cornerCoverage + 0.2 * closure + 0.1 * (nearEdgeCount / normalizedPoints.length));
};

const evaluateTriangleAccuracy = (normalizedPoints) => {
  if (normalizedPoints.length < 10) return 0.05;

  const a = { x: 0.5, y: 0 };
  const b = { x: 0, y: 1 };
  const c = { x: 1, y: 1 };
  const edgeTolerance = 0.13;
  const cornerTolerance = 0.18;
  let nearEdgeCount = 0;
  let abHits = 0;
  let bcHits = 0;
  let caHits = 0;
  let cornerHits = 0;

  normalizedPoints.forEach((p) => {
    const dab = pointToSegmentDistance(p, a, b);
    const dbc = pointToSegmentDistance(p, b, c);
    const dca = pointToSegmentDistance(p, c, a);
    const nearest = Math.min(dab, dbc, dca);

    if (nearest <= edgeTolerance) nearEdgeCount += 1;
    if (dab <= edgeTolerance) abHits += 1;
    if (dbc <= edgeTolerance) bcHits += 1;
    if (dca <= edgeTolerance) caHits += 1;

    if (
      distance(p, a) <= cornerTolerance ||
      distance(p, b) <= cornerTolerance ||
      distance(p, c) <= cornerTolerance
    ) {
      cornerHits += 1;
    }
  });

  const closureDistance = distance(normalizedPoints[0], normalizedPoints[normalizedPoints.length - 1]);
  if (closureDistance > 0.32) return 0.1;
  const closure = clamp01(1 - closureDistance / 0.32);

  const minX = Math.min(...normalizedPoints.map((p) => p.x));
  const maxX = Math.max(...normalizedPoints.map((p) => p.x));
  const minY = Math.min(...normalizedPoints.map((p) => p.y));
  const maxY = Math.max(...normalizedPoints.map((p) => p.y));
  if (maxX - minX < 0.5 || maxY - minY < 0.5) return 0.1;

  const edgeCoverage = [abHits, bcHits, caHits].filter((count) => count >= normalizedPoints.length * 0.09).length / 3;
  const cornerCoverage = cornerHits >= 2 ? 1 : cornerHits / 2;
  if (edgeCoverage < 0.5 || cornerCoverage < 0.5) return 0.15;

  let pathLen = 0;
  for (let i = 1; i < normalizedPoints.length; i += 1) {
    pathLen += distance(normalizedPoints[i - 1], normalizedPoints[i]);
  }
  if (pathLen < 1.0) return 0.1;

  return clamp01(0.5 * edgeCoverage + 0.2 * cornerCoverage + 0.2 * closure + 0.1 * (nearEdgeCount / normalizedPoints.length));
};

const calculateShapeMetrics = (shape, points) => {
  if (!points?.length) {
    return { accuracy: 0.1, smoothness: 0.4 };
  }

  const normalizedPoints = normalizePoints(points);
  const smoothness = calculatePathSmoothness(normalizedPoints);

  let accuracy = 0.2;
  if (shape === "circle") accuracy = evaluateCircleAccuracy(normalizedPoints);
  if (shape === "square") accuracy = evaluateSquareAccuracy(normalizedPoints);
  if (shape === "triangle") accuracy = evaluateTriangleAccuracy(normalizedPoints);

  return {
    accuracy: clamp01(accuracy),
    smoothness: clamp01(smoothness),
  };
};

const getCanvasPoint = (event, canvas, withOffset = true) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY + (withOffset ? CURSOR_Y_OFFSET : 0);
  return {
    x,
    y: Math.max(0, Math.min(canvas.height, y)),
  };
};

const getPatternTemplatePoints = () => {
  const margin = 24;
  const width = PATTERN_CANVAS.width - margin * 2;
  const points = [];

  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const x = margin + t * width;
    const y = 110 + Math.sin(t * Math.PI * 3) * 38;
    points.push({ x, y });
  }

  return points;
};

const drawPatternTemplate = (canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const template = getPatternTemplatePoints();

  ctx.strokeStyle = "#94a3b8";
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(template[0].x, template[0].y);
  template.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  template.forEach((p, idx) => {
    if (idx % 2 === 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

const calculatePatternMetrics = (points) => {
  if (!points || points.length < 12) {
    return { accuracy: 0.1, smoothness: 0.4, coverage: 0.1 };
  }

  const template = getPatternTemplatePoints();
  const templateSegments = [];
  for (let i = 1; i < template.length; i += 1) {
    templateSegments.push([template[i - 1], template[i]]);
  }

  const deviations = points.map((point) => {
    let minDist = Infinity;
    templateSegments.forEach(([a, b]) => {
      minDist = Math.min(minDist, pointToSegmentDistance(point, a, b));
    });
    return minDist;
  });

  const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
  const lineAccuracy = clamp01(1 - avgDeviation / 32);

  const checkpointRadius = 18;
  const coveredCheckpoints = template.filter((checkpoint) =>
    points.some((p) => distance(p, checkpoint) <= checkpointRadius)
  ).length;
  const coverage = coveredCheckpoints / template.length;

  const normalized = normalizePoints(points);
  const smoothness = calculatePathSmoothness(normalized);

  const accuracy = clamp01(0.5 * lineAccuracy + 0.35 * coverage + 0.15 * smoothness);
  return { accuracy, smoothness, coverage };
};

export default function DyspraxiaTask({ onComplete, onTaskStepComplete, currentStep }) {
  const [step, setStep] = useState(currentStep || 0);

  const [tracingData, setTracingData] = useState([]);
  const [currentShape, setCurrentShape] = useState(0);
  const [isShapeDrawing, setIsShapeDrawing] = useState(false);

  const [isPatternDrawing, setIsPatternDrawing] = useState(false);
  const [patternTracingData, setPatternTracingData] = useState(null);

  const [reactionTimes, setReactionTimes] = useState([]);
  const [reactionStart, setReactionStart] = useState(null);
  const [reactionCueVisible, setReactionCueVisible] = useState(false);
  const [reactionPenalty, setReactionPenalty] = useState(0);

  const [coordinationIndex, setCoordinationIndex] = useState(0);
  const [coordinationErrors, setCoordinationErrors] = useState(0);
  const [coordinationAttempts, setCoordinationAttempts] = useState(0);
  const [coordinationStartTime, setCoordinationStartTime] = useState(null);
  const [coordinationResult, setCoordinationResult] = useState(null);

  const [directionalAnswers, setDirectionalAnswers] = useState([]);

  const shapeCanvasRef = useRef(null);
  const shapePointsRef = useRef([]);
  const patternCanvasRef = useRef(null);
  const patternPointsRef = useRef([]);
  const reactionTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentStep !== undefined && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep, step]);

  useEffect(() => {
    if (step === 1 && patternCanvasRef.current) {
      drawPatternTemplate(patternCanvasRef.current);
      patternPointsRef.current = [];
    }

    if (step === 3 && !coordinationStartTime) {
      setCoordinationStartTime(Date.now());
    }
  }, [step, coordinationStartTime]);

  useEffect(() => {
    return () => {
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
      }
    };
  }, []);

  const startShapeDrawing = (event) => {
    const canvas = shapeCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(event, canvas);
    shapePointsRef.current.push({ x, y });
    setIsShapeDrawing(true);

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1f2a44";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawShape = (event) => {
    if (!isShapeDrawing) return;

    const canvas = shapeCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(event, canvas);
    shapePointsRef.current.push({ x, y });

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopShapeDrawing = () => {
    setIsShapeDrawing(false);
  };

  const handleNextShape = () => {
    const canvas = shapeCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const shapeMetrics = calculateShapeMetrics(SHAPES[currentShape], shapePointsRef.current);
    const updatedTracingData = [
      ...tracingData,
      {
        shape: SHAPES[currentShape],
        data: dataUrl,
        accuracy: shapeMetrics.accuracy,
        smoothness: shapeMetrics.smoothness,
      },
    ];

    setTracingData(updatedTracingData);
    shapePointsRef.current = [];

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentShape + 1 < SHAPES.length) {
      setCurrentShape(currentShape + 1);
      return;
    }

    const accurateShapes = updatedTracingData.filter((item) => item.accuracy >= 0.65).length;
    onTaskStepComplete?.({ correct: accurateShapes, total: SHAPES.length });
    setStep(1);
  };

  const startPatternDrawing = (event) => {
    const canvas = patternCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(event, canvas, false);
    patternPointsRef.current.push({ x, y });
    setIsPatternDrawing(true);

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1f2a44";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawPattern = (event) => {
    if (!isPatternDrawing) return;

    const canvas = patternCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasPoint(event, canvas, false);
    patternPointsRef.current.push({ x, y });

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopPatternDrawing = () => {
    setIsPatternDrawing(false);
  };

  const clearPattern = () => {
    const canvas = patternCanvasRef.current;
    if (!canvas) return;
    drawPatternTemplate(canvas);
    patternPointsRef.current = [];
    setPatternTracingData(null);
  };

  const submitPatternTracing = () => {
    const metrics = calculatePatternMetrics(patternPointsRef.current);
    setPatternTracingData(metrics);
    onTaskStepComplete?.({ correct: Math.round(metrics.accuracy * 10), total: 10 });
    setStep(2);
  };

  const startReactionTrial = () => {
    if (reactionCueVisible || reactionStart) return;

    setReactionCueVisible(false);
    setReactionStart(null);

    const waitMs = 700 + Math.floor(Math.random() * 1200);
    reactionTimeoutRef.current = setTimeout(() => {
      setReactionCueVisible(true);
      setReactionStart(Date.now());
    }, waitMs);
  };

  const handleReactionClick = () => {
    if (!reactionCueVisible || !reactionStart) {
      setReactionPenalty((prev) => prev + 1);
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
        reactionTimeoutRef.current = null;
      }
      setReactionCueVisible(false);
      setReactionStart(null);
      return;
    }

    const time = Date.now() - reactionStart;
    const updatedTimes = [...reactionTimes, time];

    setReactionTimes(updatedTimes);
    setReactionCueVisible(false);
    setReactionStart(null);

    if (updatedTimes.length >= 3) {
      const goodReactions = updatedTimes.filter((t) => t < 700).length;
      onTaskStepComplete?.({ correct: goodReactions, total: 3 });
      setTimeout(() => setStep(3), 250);
    }
  };

  const handleCoordinationClick = (event) => {
    if (coordinationIndex >= COORDINATION_TARGETS.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    const target = COORDINATION_TARGETS[coordinationIndex];
    const hitRadius = 8;
    const isHit = Math.hypot(clickX - target.x, clickY - target.y) <= hitRadius;

    setCoordinationAttempts((prev) => prev + 1);

    if (!isHit) {
      setCoordinationErrors((prev) => prev + 1);
      return;
    }

    const nextIndex = coordinationIndex + 1;
    setCoordinationIndex(nextIndex);

    if (nextIndex >= COORDINATION_TARGETS.length) {
      const finishTime = Date.now();
      const elapsed = coordinationStartTime ? finishTime - coordinationStartTime : 0;
      const estimatedAttempts = coordinationAttempts + 1;
      const precision = clamp01(COORDINATION_TARGETS.length / Math.max(estimatedAttempts, COORDINATION_TARGETS.length));
      const speedScore = clamp01(1 - elapsed / 45000);

      const result = {
        elapsed_ms: elapsed,
        errors: coordinationErrors,
        attempts: estimatedAttempts,
        precision,
        speed_score: speedScore,
      };

      setCoordinationResult(result);

      const corrected = Math.max(0, COORDINATION_TARGETS.length - coordinationErrors);
      onTaskStepComplete?.({ correct: corrected, total: COORDINATION_TARGETS.length });
      setTimeout(() => setStep(4), 250);
    }
  };

  const handleDirectionClick = (answer) => {
    const promptIndex = directionalAnswers.length;
    const expectedDirection = DIRECTION_PROMPTS[promptIndex] || "right";
    const correct = answer === expectedDirection;
    const updatedAnswers = [...directionalAnswers, { prompt: expectedDirection, answer, correct }];
    setDirectionalAnswers(updatedAnswers);

    if (updatedAnswers.length >= 3) {
      const directionalCorrect = updatedAnswers.filter((entry) => entry.correct).length;
      onTaskStepComplete?.({ correct: directionalCorrect, total: 3 });
      setTimeout(() => handleSubmit(updatedAnswers), 250);
    }
  };

  const handleSubmit = (updatedDirectionalAnswers = directionalAnswers) => {
    const avgReactionTime =
      reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 1000;

    const directionalCorrect = updatedDirectionalAnswers.filter((entry) => entry.correct).length;

    const avgTracingAccuracy =
      tracingData.length > 0
        ? tracingData.reduce((sum, item) => sum + (item.accuracy ?? 0), 0) / tracingData.length
        : 0.1;

    const avgTracingSmoothness =
      tracingData.length > 0
        ? tracingData.reduce((sum, item) => sum + (item.smoothness ?? 0), 0) / tracingData.length
        : 0.4;

    const patternAccuracy = patternTracingData?.accuracy ?? 0.1;
    const patternSmoothness = patternTracingData?.smoothness ?? 0.4;

    const coordinationPrecision = coordinationResult?.precision ?? 0.4;
    const coordinationSpeed = coordinationResult?.speed_score ?? 0.4;

    onComplete({
      task_type: "dyspraxia",
      raw_data: {
        tracing_data: tracingData,
        pattern_tracing: patternTracingData,
        reaction_times: reactionTimes,
        reaction_false_starts: reactionPenalty,
        hand_eye_coordination: coordinationResult,
        directional_answers: updatedDirectionalAnswers,
      },
      computed: {
        tracing_accuracy: avgTracingAccuracy,
        tracing_deviation: 1 - ((avgTracingAccuracy + patternAccuracy) / 2),
        reaction_time: Math.min(1, avgReactionTime / 1000),
        movement_smoothness: (avgTracingSmoothness + patternSmoothness) / 2,
        coordination_errors: 1 - coordinationPrecision,
        directional_confusion: 1 - directionalCorrect / 3,
        motor_planning: (coordinationPrecision + coordinationSpeed + patternAccuracy) / 3,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-ink-700">Dyspraxia Assessment</h3>
        <span className="text-sm text-ink-500">Step {step + 1} / {TOTAL_STEPS}</span>
      </div>

      {step === 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-semibold text-ink-700">Teacher Instructions</h4>
            </div>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Shape Replication:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ask the learner to draw the shown shape.</li>
                <li>Observe closure, proportions, and line control.</li>
                <li>Allow one attempt per shape.</li>
              </ol>
              <p className="text-xs text-ink-500 mt-3 italic">
                Current: {SHAPES[currentShape]} ({currentShape + 1} of {SHAPES.length})
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-ink-700">Student Response</h4>
            <p className="text-sm font-medium text-ink-700">
              Draw a <span className="text-xl font-bold text-ink-700">{SHAPES[currentShape]}</span>:
            </p>
            <canvas
              ref={shapeCanvasRef}
              width={SHAPE_CANVAS.width}
              height={SHAPE_CANVAS.height}
              className="border-2 border-slate-300 rounded-md bg-white cursor-crosshair w-full"
              onMouseDown={startShapeDrawing}
              onMouseMove={drawShape}
              onMouseUp={stopShapeDrawing}
              onMouseLeave={stopShapeDrawing}
            />
            <button onClick={handleNextShape} className="w-full px-4 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500">
              {currentShape + 1 < SHAPES.length ? "Next Shape" : "Continue"}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-ink-700 mb-3">Teacher Instructions</h4>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Pattern Tracing:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ask the learner to trace along the dotted path.</li>
                <li>Observe staying on path, restarts, and smoothness.</li>
                <li>Allow redraw if accidental slip occurs.</li>
              </ol>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-ink-700">Student Response</h4>
            <p className="text-sm text-ink-600">Trace over the dotted pattern from left to right.</p>
            <canvas
              ref={patternCanvasRef}
              width={PATTERN_CANVAS.width}
              height={PATTERN_CANVAS.height}
              className="border-2 border-slate-300 rounded-md bg-white cursor-crosshair w-full"
              onMouseDown={startPatternDrawing}
              onMouseMove={drawPattern}
              onMouseUp={stopPatternDrawing}
              onMouseLeave={stopPatternDrawing}
            />
            {patternTracingData && (
              <p className="text-xs text-ink-500">
                Accuracy: {(patternTracingData.accuracy * 100).toFixed(0)}% · Coverage: {(patternTracingData.coverage * 100).toFixed(0)}%
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={clearPattern} className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-ink-700">
                Clear
              </button>
              <button onClick={submitPatternTracing} className="px-3 py-2 rounded-md bg-ink-700 text-white hover:bg-ink-500">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-ink-700 mb-3">Teacher Instructions</h4>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Reaction Time:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Student taps Start.</li>
                <li>Wait for the cue to appear.</li>
                <li>Student clicks as quickly as possible.</li>
                <li>Repeat 3 trials.</li>
              </ol>
              <p className="text-xs text-ink-500 mt-2">False starts: {reactionPenalty}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-4 text-center">
            <h4 className="font-semibold text-ink-700">Student Response</h4>
            <p className="text-sm text-ink-600">Click only when the cue appears.</p>

            <div className="bg-ink-50 border border-slate-300 rounded-lg p-8 space-y-3">
              {!reactionCueVisible && (
                <button
                  onClick={startReactionTrial}
                  className="px-6 py-3 rounded-md bg-ink-700 text-white hover:bg-ink-500 text-lg"
                  disabled={reactionTimes.length >= 3}
                >
                  Start Test {Math.min(reactionTimes.length + 1, 3)}/3
                </button>
              )}

              {reactionCueVisible && (
                <button
                  onClick={handleReactionClick}
                  className="px-6 py-3 rounded-md bg-coral-400 text-white text-lg animate-pulse"
                >
                  CLICK NOW!
                </button>
              )}

            </div>

            {reactionTimes.length > 0 && (
              <p className="text-xs text-ink-500">
                Average: {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(0)}ms
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-ink-700 mb-3">Teacher Instructions</h4>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Hand-Eye Coordination:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ask learner to click each highlighted target in order.</li>
                <li>Observe precision and overshoot clicks.</li>
                <li>Allow one full run.</li>
              </ol>
              <p className="text-xs text-ink-500 mt-2">
                Target {Math.min(coordinationIndex + 1, COORDINATION_TARGETS.length)} of {COORDINATION_TARGETS.length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-ink-700">Student Response</h4>
            <div
              onClick={handleCoordinationClick}
              className="relative h-72 w-full border-2 border-slate-300 rounded-lg bg-slate-50 cursor-crosshair"
            >
              {COORDINATION_TARGETS.map((target, idx) => {
                const active = idx === coordinationIndex;
                const passed = idx < coordinationIndex;
                return (
                  <div
                    key={`target-${target.x}-${target.y}`}
                    className={`absolute rounded-full border-2 transition-all ${
                      active
                        ? "w-8 h-8 border-red-500 bg-red-200 animate-pulse"
                        : passed
                        ? "w-5 h-5 border-mint-600 bg-mint-200"
                        : "w-5 h-5 border-slate-400 bg-white"
                    }`}
                    style={{
                      left: `${target.x}%`,
                      top: `${target.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-ink-500">
              <span>Attempts: {coordinationAttempts}</span>
              <span>Errors: {coordinationErrors}</span>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-ink-700 mb-3">Teacher Instructions</h4>
            <div className="space-y-2 text-sm text-ink-600">
              <p className="font-medium">Directional Awareness:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Ask alternating prompts for RIGHT and LEFT hand awareness.</li>
                <li>Student chooses left or right.</li>
                <li>Repeat 3 times and note consistency.</li>
              </ol>
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-ink-700">Student Response</h4>
            <p className="text-sm font-medium text-ink-700 text-center">
              Which hand is your {((DIRECTION_PROMPTS[directionalAnswers.length] || "right").toUpperCase())} hand?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDirectionClick("left")}
                disabled={directionalAnswers.length >= 3}
                className="px-6 py-8 rounded-lg bg-white border-2 border-slate-300 hover:border-ink-700 hover:bg-ink-50 text-lg font-semibold disabled:opacity-50"
              >
                ← Left
              </button>
              <button
                onClick={() => handleDirectionClick("right")}
                disabled={directionalAnswers.length >= 3}
                className="px-6 py-8 rounded-lg bg-white border-2 border-slate-300 hover:border-ink-700 hover:bg-ink-50 text-lg font-semibold disabled:opacity-50"
              >
                Right →
              </button>
            </div>
            <p className="text-xs text-center text-ink-500">Test {Math.min(directionalAnswers.length + 1, 3)}/3</p>
          </div>
        </div>
      )}
    </div>
  );
}
