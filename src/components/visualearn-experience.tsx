"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Lesson = {
  topic: string;
  subject: string;
  summary: string;
  analogy: string;
  analogyMap: {
    familiar: string;
    concept: string;
    bridge: string;
    takeaway: string;
  };
  challenge: string;
  complexity: string;
  outcomes: string[];
  coachNotes: string[];
  visualPrimitives: string[];
  animationPlan: string[];
  examples: string[];
  practiceQuestions: string[];
  connections: string[];
  quizOptions: {
    id: string;
    label: string;
    correct: boolean;
    feedback: string;
  }[];
  visuals: string[];
  steps: string[];
  stepDetails: {
    title: string;
    explanation: string;
    check: string;
  }[];
  practice: string;
  masterySignals: string[];
};

type RendererProfile = {
  kind:
    | "math"
    | "physics"
    | "history"
    | "biology"
    | "cs"
    | "economics"
    | "chemistry"
    | "astronomy"
    | "philosophy"
    | "general";
  title: string;
  readout: string;
  variables: string[];
};

type ThemeMode = "dark" | "light";

type PracticeReview = {
  score: number;
  label: string;
  verdict: string;
  nextMove: string;
  tone: "strong" | "watch" | "needs-work";
};

const examples = [
  "Black holes",
  "Derivatives",
  "French Revolution",
  "Neural networks",
  "DNA replication",
  "Supply and demand",
  "Quantum tunneling"
];

const subjects = [
  { name: "Math", detail: "Graphs, slopes, proofs", accent: "#9cc7ff" },
  { name: "Physics", detail: "Fields, forces, motion", accent: "#d4e7ff" },
  { name: "History", detail: "Timelines and causality", accent: "#ffd8a8" },
  { name: "Biology", detail: "Systems and living maps", accent: "#b7ffd7" },
  { name: "Computer Science", detail: "Algorithms in motion", accent: "#d6c6ff" },
  { name: "Economics", detail: "Markets as live systems", accent: "#bff8ff" },
  { name: "Chemistry", detail: "Bonds, reactions, orbitals", accent: "#c5f6ff" },
  { name: "Astronomy", detail: "Scale, gravity, cosmic maps", accent: "#e1d2ff" },
  { name: "Philosophy", detail: "Arguments and idea maps", accent: "#f7e7ba" }
];

const rendererProfiles: Record<string, RendererProfile> = {
  Math: {
    kind: "math",
    title: "Graph intuition engine",
    readout: "Slope and curvature respond in real time.",
    variables: ["slope", "tangent", "area"]
  },
  Physics: {
    kind: "physics",
    title: "Field simulation engine",
    readout: "Mass, force, and orbital paths stay linked.",
    variables: ["mass", "orbit", "field"]
  },
  History: {
    kind: "history",
    title: "Causal timeline engine",
    readout: "Events become sequenced pressure points.",
    variables: ["cause", "shift", "consequence"]
  },
  Biology: {
    kind: "biology",
    title: "Living systems engine",
    readout: "Molecules and structures animate as a system.",
    variables: ["sequence", "signal", "feedback"]
  },
  "Computer Science": {
    kind: "cs",
    title: "Computation trace engine",
    readout: "State changes travel through nodes and edges.",
    variables: ["input", "weights", "output"]
  },
  Economics: {
    kind: "economics",
    title: "Market dynamics engine",
    readout: "Demand, supply, and equilibrium move together.",
    variables: ["demand", "supply", "shock"]
  },
  Chemistry: {
    kind: "chemistry",
    title: "Molecular reaction engine",
    readout: "Bonds, energy, and reaction paths shift together.",
    variables: ["bond", "energy", "rate"]
  },
  Astronomy: {
    kind: "astronomy",
    title: "Cosmic scale engine",
    readout: "Distance, mass, and light reveal the structure.",
    variables: ["scale", "luminosity", "orbit"]
  },
  Philosophy: {
    kind: "philosophy",
    title: "Argument mapping engine",
    readout: "Claims, objections, and implications form a live map.",
    variables: ["claim", "support", "tension"]
  },
  Interdisciplinary: {
    kind: "general",
    title: "Concept systems engine",
    readout: "Core primitives connect into a manipulable map.",
    variables: ["driver", "model", "transfer"]
  }
};

const layers = ["Beginner", "Intermediate", "Advanced", "Expert"];

const pipeline = [
  "Topic input",
  "Concept decomposition",
  "Visual primitives",
  "Interactive practice"
];

const generationStages = [
  {
    label: "Detect subject",
    detail: "Classifying domain, complexity, and learner entry point."
  },
  {
    label: "Extract primitives",
    detail: "Finding variables, constraints, misconceptions, and transfer hooks."
  },
  {
    label: "Render model",
    detail: "Assembling the interactive visualization and live controls."
  },
  {
    label: "Calibrate practice",
    detail: "Preparing checkpoints, hints, quiz feedback, and memory signals."
  }
];

const briefTabs = [
  { id: "primitives", label: "Primitives" },
  { id: "animations", label: "Animations" },
  { id: "examples", label: "Examples" },
  { id: "questions", label: "Questions" },
  { id: "connections", label: "Connections" }
] as const;

type BriefTab = (typeof briefTabs)[number]["id"];

const conceptNodes = [
  {
    id: "intuition",
    label: "Intuition",
    x: 18,
    y: 36,
    depth: "near",
    detail: "The first visual anchor that makes the topic feel obvious."
  },
  {
    id: "model",
    label: "Model",
    x: 42,
    y: 20,
    depth: "far",
    detail: "The hidden structure that explains why the system behaves this way."
  },
  {
    id: "simulation",
    label: "Simulation",
    x: 70,
    y: 34,
    depth: "near",
    detail: "A manipulatable version of the idea with live cause and effect."
  },
  {
    id: "analogy",
    label: "Analogy",
    x: 30,
    y: 68,
    depth: "mid",
    detail: "A memorable metaphor that makes abstract structure feel familiar."
  },
  {
    id: "practice",
    label: "Practice",
    x: 76,
    y: 72,
    depth: "mid",
    detail: "A prediction loop that turns recognition into usable skill."
  },
  {
    id: "mastery",
    label: "Mastery",
    x: 52,
    y: 50,
    depth: "core",
    detail: "The current lesson core, connected to nearby transfer paths."
  }
];

const featuredMissions = [
  "Train a neural network",
  "Balance market shocks",
  "Map revolutionary causes",
  "Bend spacetime",
  "Trace DNA replication"
];

const onboardingSteps = [
  {
    label: "Ask",
    detail: "Type any topic and let the engine classify the subject."
  },
  {
    label: "Watch",
    detail: "See the core visual model before reading the explanation."
  },
  {
    label: "Manipulate",
    detail: "Move a variable and watch the lesson respond in real time."
  },
  {
    label: "Master",
    detail: "Lock the idea with checkpoints, quiz feedback, and transfer."
  }
];

const modelPresets = [
  {
    id: "baseline",
    label: "Baseline",
    signal: 54,
    curvature: 42,
    detail: "Stable model with balanced signal and constraint."
  },
  {
    id: "stress",
    label: "Stress test",
    signal: 86,
    curvature: 74,
    detail: "Pushes the system until the hidden constraint becomes visible."
  },
  {
    id: "minimal",
    label: "Minimal case",
    signal: 26,
    curvature: 24,
    detail: "Removes noise so the simplest version of the idea is clear."
  }
];

const missionSteps = [
  {
    label: "See",
    detail: "Build intuition from the live model."
  },
  {
    label: "Predict",
    detail: "Move one variable before reading."
  },
  {
    label: "Explain",
    detail: "Compress the system into language."
  },
  {
    label: "Transfer",
    detail: "Apply the pattern somewhere new."
  }
];

const studioModes = [
  {
    id: "whiteboard",
    title: "AI Whiteboard",
    eyebrow: "Drawn live",
    detail: "Auto-sketches the concept as a clean sequence of strokes, anchors, and labels."
  },
  {
    id: "voice",
    title: "Voice Mode",
    eyebrow: "Narrated",
    detail: "Turns the current lesson into a calm spoken walkthrough with pacing cues."
  },
  {
    id: "battle",
    title: "Quiz Battle",
    eyebrow: "Adaptive",
    detail: "Races the learner against an AI opponent while mistakes update memory."
  }
];

const studioSequences: Record<string, { label: string; detail: string }[]> = {
  whiteboard: [
    { label: "Sketch primitive", detail: "Draw the visible object before naming it." },
    { label: "Animate relation", detail: "Trace the hidden cause and effect." },
    { label: "Label trap", detail: "Mark the tempting wrong mental shortcut." }
  ],
  voice: [
    { label: "Prime", detail: "Set pace, vocabulary, and cognitive load." },
    { label: "Narrate", detail: "Talk through the model as it moves." },
    { label: "Predict", detail: "Pause before the reveal so the learner commits." }
  ],
  battle: [
    { label: "Challenge", detail: "Serve a transfer question under pressure." },
    { label: "Race", detail: "Compare learner confidence with AI pace." },
    { label: "Review", detail: "Turn misses into Smart Memory signals." }
  ]
};

const playableDemos = [
  {
    id: "derivative",
    topic: "Derivatives",
    title: "Slope Lab",
    subject: "Math",
    caption: "Drag the intensity to watch tangent, curve, and rate of change move together."
  },
  {
    id: "orbit",
    topic: "Black holes",
    title: "Gravity Well",
    subject: "Physics",
    caption: "Mass changes orbital path, field strength, and event-horizon pressure."
  },
  {
    id: "revolution",
    topic: "French Revolution",
    title: "Causality Timeline",
    subject: "History",
    caption: "Pressure accumulates across events until the system tips into transformation."
  }
];

const layerDetails: Record<string, string> = {
  Beginner: "Plain-language intuition with one interactive variable.",
  Intermediate: "Connects the visual model to formulas, systems, and edge cases.",
  Advanced: "Surfaces hidden constraints, counterexamples, and multi-step reasoning.",
  Expert: "Compresses the concept into transfer rules and research-grade questions."
};

function inferSubject(topic: string) {
  const t = topic.toLowerCase();
  if (/(derivative|integral|matrix|vector|equation|graph|calculus)/.test(t)) return "Math";
  if (/(black hole|gravity|motion|wave|quantum|force|energy)/.test(t)) return "Physics";
  if (/(revolution|empire|war|history|civilization|treaty)/.test(t)) return "History";
  if (/(dna|cell|biology|organ|ecosystem|protein)/.test(t)) return "Biology";
  if (/(neural|algorithm|code|recursion|sorting|computer)/.test(t)) return "Computer Science";
  if (/(market|supply|demand|economics|inflation|trade)/.test(t)) return "Economics";
  if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base)/.test(t)) return "Chemistry";
  if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit)/.test(t)) return "Astronomy";
  if (/(philosophy|ethics|logic|argument|consciousness|meaning|truth)/.test(t)) return "Philosophy";
  return "Interdisciplinary";
}

function composeLesson(topic: string): Lesson {
  const subject = inferSubject(topic);

  return {
    topic,
    subject,
    summary: `A visual-first ${subject.toLowerCase()} lesson that turns ${topic} into an explorable model, not a wall of text.`,
    analogy: `${topic} behaves like a living control panel: change one input, then watch the surrounding system reorganize.`,
    analogyMap: {
      familiar: "A control room",
      concept: topic,
      bridge: "One small adjustment changes the whole system response.",
      takeaway: "Watch the relationship move before attaching vocabulary."
    },
    challenge: `Predict how ${topic} changes when the strongest constraint is removed.`,
    complexity:
      subject === "Interdisciplinary"
        ? "Adaptive mixed-domain concept"
        : `${subject} concept with layered intuition, transfer, and practice`,
    outcomes: [
      "Build a visual intuition before memorizing terms.",
      "Use the model to predict one system change.",
      "Transfer the pattern to a neighboring concept."
    ],
    coachNotes: [
      "Watch for the first thing that moves when you adjust a variable.",
      "Name the hidden constraint before trying to solve.",
      "Test the idea by explaining it without vocabulary."
    ],
    visualPrimitives: [
      "Core variable",
      "System response",
      "Constraint boundary",
      "Transfer pattern"
    ],
    animationPlan: [
      "Reveal the model skeleton first.",
      "Pulse the primary relationship as the learner adjusts controls.",
      "Fade in the misconception path after the first prediction."
    ],
    examples: [
      `${topic} in a simple everyday case`,
      `${topic} under a stronger constraint`,
      `${topic} transferred to a neighboring concept`
    ],
    practiceQuestions: [
      "What moves first when the main variable changes?",
      "Which part of the model stays stable?",
      "Where would a beginner make the wrong prediction?"
    ],
    connections: [
      `${subject} fundamentals`,
      "Cause and effect",
      "Prediction loops",
      "Transfer practice"
    ],
    quizOptions: [
      {
        id: "model",
        label: "The connected model shifts before the explanation changes.",
        correct: true,
        feedback: "Exactly. Visualearn wants the mental model to move first, then the language can attach to it."
      },
      {
        id: "definition",
        label: "The definition should be memorized before touching the model.",
        correct: false,
        feedback: "Close to school habits, but backwards here. Start with the system behavior, then compress it into a definition."
      },
      {
        id: "detail",
        label: "The smallest detail always determines the full system.",
        correct: false,
        feedback: "Sometimes details matter, but the core lesson is about finding the highest-leverage relationship first."
      }
    ],
    visuals: [
      "Interactive core model",
      "Cause and effect map",
      "Animated analogy",
      "Adaptive practice loop"
    ],
    steps: [
      "Start with the phenomenon you can see.",
      "Reveal the hidden structure behind it.",
      "Manipulate one variable and watch the system respond.",
      "Practice until the model feels obvious."
    ],
    stepDetails: [
      {
        title: "Observe the surface",
        explanation: `Start with what ${topic} visibly does before naming it. The first pass is about noticing motion, pressure, and shape.`,
        check: "Can you point to the first visible change?"
      },
      {
        title: "Expose the structure",
        explanation: `Map the hidden relationship that makes ${topic} behave that way. This turns the lesson from memorized words into a model.`,
        check: "Can you name the constraint?"
      },
      {
        title: "Run one perturbation",
        explanation: `Change one input and predict how ${topic} responds. Visual feedback makes the cause and effect impossible to miss.`,
        check: "Can you predict the first movement?"
      },
      {
        title: "Transfer the pattern",
        explanation: `Apply the same model to a nearby idea so the concept becomes portable instead of isolated.`,
        check: "Can you explain it without vocabulary?"
      }
    ],
    practice: `Explain ${topic} using a sketch, then change one assumption and predict what moves first.`,
    masterySignals: ["Can predict", "Can explain", "Can transfer"]
  };
}

function UniverseCanvas({ themeMode }: { themeMode: ThemeMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animationId = 0;
    let width = 0;
    let height = 0;

    const particles = Array.from({ length: 120 }, (_, index) => ({
      baseX: (index * 47) % 100,
      baseY: (index * 71) % 100,
      radius: 0.6 + ((index * 13) % 18) / 10,
      speed: 0.002 + ((index % 9) + 1) * 0.00055,
      phase: index * 0.62
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        pointerRef.current.x * width,
        pointerRef.current.y * height,
        0,
        pointerRef.current.x * width,
        pointerRef.current.y * height,
        Math.max(width, height) * 0.75
      );
      gradient.addColorStop(0, "rgba(156, 199, 255, 0.22)");
      gradient.addColorStop(0.35, themeMode === "light" ? "rgba(115, 142, 190, 0.12)" : "rgba(72, 91, 130, 0.08)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        const drift = Math.sin(frame * particle.speed + particle.phase);
        const pullX = (pointerRef.current.x - 0.5) * 24;
        const pullY = (pointerRef.current.y - 0.5) * 24;
        const x = (particle.baseX / 100) * width + drift * 16 + pullX * (index % 4);
        const y =
          (particle.baseY / 100) * height +
          Math.cos(frame * particle.speed + particle.phase) * 12 +
          pullY * (index % 3);

        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fillStyle =
          themeMode === "light"
            ? `rgba(30, 48, 80, ${0.18 + (index % 5) * 0.04})`
            : `rgba(255, 255, 255, ${0.26 + (index % 5) * 0.07})`;
        context.fill();
      });

      for (let index = 0; index < particles.length - 1; index += 1) {
        const a = particles[index];
        const b = particles[index + 1];
        const ax = (a.baseX / 100) * width;
        const ay = (a.baseY / 100) * height;
        const bx = (b.baseX / 100) * width;
        const by = (b.baseY / 100) * height;
        const distance = Math.hypot(ax - bx, ay - by);

        if (distance < 130) {
          context.beginPath();
          context.moveTo(ax, ay);
          context.lineTo(bx, by);
          context.strokeStyle =
            themeMode === "light"
              ? `rgba(65, 92, 140, ${0.12 - distance / 2200})`
              : `rgba(180, 210, 255, ${0.08 - distance / 2400})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height
      };
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [themeMode]);

  return <canvas ref={canvasRef} className="universe-canvas" aria-hidden="true" />;
}

function DomainRenderer({
  activeLayer,
  curvature,
  profile,
  signal,
  topic
}: {
  activeLayer: string;
  curvature: number;
  profile: RendererProfile;
  signal: number;
  topic: string;
}) {
  const layerIndex = Math.max(1, layers.indexOf(activeLayer) + 1);
  const amplitude = 16 + signal / 4;
  const frequency = 1.6 + layerIndex * 0.34;
  const mathPath = Array.from({ length: 52 }, (_, index) => {
    const x = 5 + index * 1.8;
    const y = 50 - Math.sin(index / frequency) * amplitude * 0.45 - curvature / 12;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const equilibrium = 24 + signal * 0.46;
  const timelineProgress = 18 + layerIndex * 18;
  const helixNodes = Array.from({ length: 9 }, (_, index) => index);
  const moleculeNodes = [
    { x: 50, y: 48, r: 8, label: "C" },
    { x: 29, y: 30, r: 5, label: "H" },
    { x: 71, y: 30, r: 5, label: "O" },
    { x: 34, y: 72, r: 5, label: "H" },
    { x: 70, y: 70, r: 5, label: "N" }
  ];
  const argumentNodes = [
    { x: 50, y: 18, label: "Claim" },
    { x: 24, y: 48, label: "Reason" },
    { x: 76, y: 48, label: "Objection" },
    { x: 50, y: 78, label: "Synthesis" }
  ];
  const networkNodes = [
    { x: 18, y: 28, label: "in" },
    { x: 40, y: 18, label: "h1" },
    { x: 42, y: 48, label: "h2" },
    { x: 66, y: 30, label: "out" },
    { x: 72, y: 62, label: "loss" }
  ];

  return (
    <div
      className={`field-visual renderer-${profile.kind}`}
      aria-label={`${profile.title} for ${topic}`}
      style={
        {
          "--signal-level": `${signal}%`,
          "--curvature-level": `${curvature}%`,
          "--timeline-progress": `${timelineProgress}%`,
          "--orbit-a-width": `${190 + curvature * 0.8}px`,
          "--orbit-a-height": `${110 + signal * 0.24}px`,
          "--orbit-b-width": `${260 + signal * 0.5}px`,
          "--orbit-b-height": `${170 + curvature * 0.24}px`,
          "--satellite-origin": `${-70 - signal * 0.5}px`
        } as CSSProperties
      }
    >
      <div className="renderer-hud">
        <div>
          <span>{profile.title}</span>
          <strong>{topic}</strong>
        </div>
        <p>{profile.readout}</p>
      </div>

      {profile.kind === "math" ? (
        <svg className="renderer-svg math-plane" viewBox="0 0 100 100" role="img" aria-label="Interactive graph preview">
          <path className="axis" d="M 8 72 L 92 72 M 14 92 L 14 10" />
          <path className="math-curve" d={mathPath} />
          <line className="tangent-line" x1="42" y1="18" x2="78" y2="74" />
          <circle className="curve-point" cx={equilibrium} cy={52 - curvature / 10} r="3.4" />
        </svg>
      ) : null}

      {profile.kind === "physics" ? (
        <div className="physics-field" aria-hidden="true">
          <span className="gravity-well" />
          <span className="orbit orbit-a" />
          <span className="orbit orbit-b" />
          <span className="satellite" />
          <span className="field-line field-line-a" />
          <span className="field-line field-line-b" />
        </div>
      ) : null}

      {profile.kind === "history" ? (
        <div className="timeline-engine" aria-hidden="true">
          {["Spark", "Pressure", "Break", "Reform"].map((event, index) => (
            <div
              className="timeline-node"
              key={event}
              style={{ "--node-left": `${10 + index * 26}%` } as CSSProperties}
            >
              <span>{event}</span>
            </div>
          ))}
          <span className="timeline-beam" />
        </div>
      ) : null}

      {profile.kind === "biology" ? (
        <div className="biology-engine" aria-hidden="true">
          {helixNodes.map((node) => (
            <span
              className="helix-node"
              key={node}
              style={
                {
                  "--node-index": node,
                  "--node-top": `${8 + node * 10}%`,
                  "--node-offset": `${Math.sin(node * 0.9) * 70}px`,
                  "--node-angle": `${node * 18}deg`
                } as CSSProperties
              }
            />
          ))}
          <span className="cell-core" />
        </div>
      ) : null}

      {profile.kind === "cs" ? (
        <svg className="renderer-svg network-engine" viewBox="0 0 100 100" role="img" aria-label="Computation graph preview">
          {networkNodes.slice(0, -1).map((node, index) => (
            <line key={`${node.label}-${index}`} x1={node.x} y1={node.y} x2={networkNodes[index + 1].x} y2={networkNodes[index + 1].y} />
          ))}
          <line x1="18" y1="28" x2="42" y2="48" />
          <line x1="40" y1="18" x2="72" y2="62" />
          {networkNodes.map((node) => (
            <g key={node.label}>
              <circle cx={node.x} cy={node.y} r="5.4" />
              <text x={node.x} y={node.y + 13}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      ) : null}

      {profile.kind === "economics" ? (
        <svg className="renderer-svg market-engine" viewBox="0 0 100 100" role="img" aria-label="Supply and demand preview">
          <path className="axis" d="M 12 84 L 92 84 M 12 84 L 12 12" />
          <path className="demand-line" d={`M 16 ${24 + signal / 5} L 86 ${82 - curvature / 8}`} />
          <path className="supply-line" d={`M 16 ${84 - curvature / 7} L 86 ${22 + signal / 6}`} />
          <circle className="equilibrium-dot" cx={equilibrium} cy={54} r="4" />
          <rect className="market-bar market-bar-a" x="18" y={74 - layerIndex * 5} width="10" height={10 + layerIndex * 5} />
          <rect className="market-bar market-bar-b" x="34" y={62 - signal / 9} width="10" height={22 + signal / 9} />
          <rect className="market-bar market-bar-c" x="50" y={66 - curvature / 8} width="10" height={18 + curvature / 8} />
        </svg>
      ) : null}

      {profile.kind === "chemistry" ? (
        <svg className="renderer-svg molecule-engine" viewBox="0 0 100 100" role="img" aria-label="Molecular bond preview">
          {moleculeNodes.slice(1).map((node) => (
            <line key={node.label + node.x} x1="50" y1="48" x2={node.x} y2={node.y} />
          ))}
          <path className="reaction-path" d={`M 12 ${76 - layerIndex * 3} C 32 ${22 + signal / 5}, 62 ${86 - curvature / 5}, 88 24`} />
          {moleculeNodes.map((node, index) => (
            <g key={`${node.label}-${node.x}`}>
              <circle className={index === 0 ? "atom-core" : "atom-node"} cx={node.x} cy={node.y} r={node.r + layerIndex * 0.35} />
              <text x={node.x} y={node.y + 1.8}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      ) : null}

      {profile.kind === "astronomy" ? (
        <div className="cosmic-engine" aria-hidden="true">
          <span className="star-core" />
          <span className="cosmic-orbit cosmic-orbit-a" />
          <span className="cosmic-orbit cosmic-orbit-b" />
          <span className="planet planet-a" />
          <span className="planet planet-b" />
          <span className="light-cone" />
        </div>
      ) : null}

      {profile.kind === "philosophy" ? (
        <svg className="renderer-svg argument-engine" viewBox="0 0 100 100" role="img" aria-label="Argument map preview">
          <line x1="50" y1="26" x2="24" y2="42" />
          <line x1="50" y1="26" x2="76" y2="42" />
          <line x1="24" y1="54" x2="50" y2="70" />
          <line x1="76" y1="54" x2="50" y2="70" />
          <path className="argument-loop" d={`M 20 ${72 - layerIndex * 2} C 36 ${46 - signal / 10}, 62 ${72 - curvature / 8}, 82 28`} />
          {argumentNodes.map((node) => (
            <g key={node.label}>
              <rect x={node.x - 13} y={node.y - 7} width="26" height="14" rx="7" />
              <text x={node.x} y={node.y + 1.6}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      ) : null}

      {profile.kind === "general" ? (
        <>
          <div className="curvature-ring" style={{ transform: `scale(${0.72 + curvature / 160})` }} />
          <div className="signal-wave" style={{ width: `${signal}%` }} />
          <div className="model-node primary" />
          <div className="model-node secondary" />
        </>
      ) : null}

      <div className="renderer-readouts">
        {profile.variables.map((variable, index) => (
          <span key={variable}>
            {variable}
            <strong>{Math.round((signal + curvature + index * 17) / 2)}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function VisualearnExperience() {
  const [topic, setTopic] = useState("");
  const [activeExample, setActiveExample] = useState(0);
  const [activeLayer, setActiveLayer] = useState("Beginner");
  const [lesson, setLesson] = useState<Lesson | null>(() => composeLesson("Black holes"));
  const [isComposing, setIsComposing] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [activeBriefTab, setActiveBriefTab] = useState<BriefTab>("primitives");
  const [activeOnboardingStep, setActiveOnboardingStep] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [activeDemo, setActiveDemo] = useState(playableDemos[0].id);
  const [demoIntensity, setDemoIntensity] = useState(58);
  const [activeStudio, setActiveStudio] = useState(studioModes[0].id);
  const [studioStep, setStudioStep] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const [battleRound, setBattleRound] = useState(1);
  const [graphZoom, setGraphZoom] = useState(1);
  const [activeGraphNode, setActiveGraphNode] = useState("mastery");
  const [history, setHistory] = useState(["Black holes"]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [memorySignals, setMemorySignals] = useState<string[]>(["Start with model motion"]);
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [revealedStepCount, setRevealedStepCount] = useState(2);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceReview, setPracticeReview] = useState<PracticeReview | null>(null);
  const [activeModelPreset, setActiveModelPreset] = useState(modelPresets[0].id);
  const [statusMessage, setStatusMessage] = useState("Workspace calibrated");
  const [signal, setSignal] = useState(54);
  const [curvature, setCurvature] = useState(42);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const topicInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveExample((value) => (value + 1) % examples.length);
    }, 2400);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
        setFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isComposing) {
      setGenerationStage(0);
      return;
    }

    const id = window.setInterval(() => {
      setGenerationStage((stage) => (stage + 1) % generationStages.length);
    }, 190);

    return () => window.clearInterval(id);
  }, [isComposing]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveOnboardingStep((step) => (step + 1) % onboardingSteps.length);
    }, 3200);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setStudioStep(0);
    if (activeStudio !== "voice") {
      setVoiceActive(false);
    }
  }, [activeStudio]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.name === lesson?.subject) ?? subjects[0],
    [lesson]
  );

  const rendererProfile = rendererProfiles[lesson?.subject ?? "Interdisciplinary"] ?? rendererProfiles.Interdisciplinary;

  const progress = Math.min(
    96,
    30 +
      history.length * 6 +
      bookmarks.length * 8 +
      completedCheckpoints.length * 9 +
      (selectedQuizOption ? 12 : 0)
  );

  const isSaved = Boolean(lesson && bookmarks.includes(lesson.topic));
  const selectedDemo = playableDemos.find((demo) => demo.id === activeDemo) ?? playableDemos[0];
  const selectedOption = lesson?.quizOptions.find((option) => option.id === selectedQuizOption);
  const currentCoachNote = lesson?.coachNotes[activeCheckpoint] ?? lesson?.coachNotes[0];
  const stepDetails = lesson?.stepDetails ?? [];
  const currentStepDetail = stepDetails[activeCheckpoint];
  const allStepsRevealed = revealedStepCount >= stepDetails.length;
  const universeNodes = useMemo(
    () => {
      const lessonConnections = lesson?.connections ?? [];

      return conceptNodes.map((node, index) => {
        const connectedLabel =
          node.id === "mastery"
            ? lesson?.topic ?? node.label
            : lessonConnections[index % Math.max(lessonConnections.length, 1)] ?? node.label;

        return {
          ...node,
          label: connectedLabel,
          originalLabel: node.label
        };
      });
    },
    [lesson]
  );
  const activeUniverseNode =
    universeNodes.find((node) => node.id === activeGraphNode) ?? universeNodes.find((node) => node.id === "mastery") ?? universeNodes[0];
  const selectedStudio = studioModes.find((mode) => mode.id === activeStudio) ?? studioModes[0];
  const selectedStudioSequence = studioSequences[selectedStudio.id] ?? studioSequences.whiteboard;
  const activeStudioStep = selectedStudioSequence[studioStep % selectedStudioSequence.length];
  const briefItems =
    activeBriefTab === "primitives"
      ? lesson?.visualPrimitives
      : activeBriefTab === "animations"
        ? lesson?.animationPlan
        : activeBriefTab === "examples"
          ? lesson?.examples
          : activeBriefTab === "questions"
            ? lesson?.practiceQuestions
            : lesson?.connections;
  const adaptiveNudge =
    selectedOption && !selectedOption.correct
      ? "Slow down and identify the relationship that moves first."
      : completedCheckpoints.length > 1
        ? "Ready for transfer: try a neighboring concept from the graph."
        : "Use the simulation before reaching for a definition.";
  const modelTension = Math.round(signal * 0.58 + curvature * 0.42);
  const modelStability = Math.max(8, Math.round(100 - Math.abs(signal - curvature) * 0.9));
  const modelPrediction =
    signal > 72 && curvature > 62
      ? "High-pressure response: the system exposes its constraint quickly."
      : signal < 38 && curvature < 38
        ? "Minimal case: the core relationship is calm and easy to isolate."
        : signal > curvature
          ? "Signal-led response: change appears before the boundary catches up."
          : "Constraint-led response: structure shapes the visible movement first.";
  const quizPressure = Math.min(
    98,
    46 + activeCheckpoint * 9 + completedCheckpoints.length * 7 + (selectedQuizOption ? 16 : 0) - (hintRevealed ? 8 : 0)
  );
  const quizAccuracy = selectedOption ? (selectedOption.correct ? 94 : 42) : Math.min(86, 56 + completedCheckpoints.length * 8);
  const quizTempo = Math.max(24, 78 - activeCheckpoint * 6 - (hintRevealed ? 10 : 0) + (selectedOption?.correct ? 8 : 0));
  const quizStateLabel = selectedOption ? (selectedOption.correct ? "Verified" : "Repair loop") : "Awaiting prediction";
  const quizTrace =
    selectedOption?.correct
      ? ["Model updated", "Memory reinforced", "Checkpoint pressure reduced"]
      : selectedOption
        ? ["Misconception isolated", "Hint recommended", "Memory queue updated"]
        : ["Read the system", "Choose the first response", "Explain the hidden cause"];

  const startLesson = (nextTopic: string) => {
    const normalizedTopic = nextTopic.trim();
    if (!normalizedTopic) return;

    setCommandOpen(false);
    setIsComposing(true);
    setGenerationStage(0);
    setStatusMessage("Composing visual primitives");

    window.setTimeout(() => {
      setLesson(composeLesson(normalizedTopic));
      setHistory((items) => [
        normalizedTopic,
        ...items.filter((item) => item.toLowerCase() !== normalizedTopic.toLowerCase())
      ].slice(0, 6));
      setTopic("");
      setActiveCheckpoint(0);
      setActiveGraphNode("mastery");
      setCompletedCheckpoints([]);
      setRevealedStepCount(2);
      setHintRevealed(false);
      setSelectedQuizOption(null);
      setPracticeAnswer("");
      setPracticeReview(null);
      setActiveModelPreset("baseline");
      setSignal(54);
      setCurvature(42);
      setIsComposing(false);
      setStatusMessage("Lesson ready");
    }, 760);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTopic = topic.trim() || examples[activeExample];
    startLesson(nextTopic);
  };

  const applyModelPreset = (presetId: string) => {
    const preset = modelPresets.find((item) => item.id === presetId) ?? modelPresets[0];
    setActiveModelPreset(preset.id);
    setSignal(preset.signal);
    setCurvature(preset.curvature);
    setStatusMessage(`${preset.label} applied`);
  };

  const selectOnboardingStep = (index: number) => {
    setActiveOnboardingStep(index);

    if (index === 0) {
      topicInputRef.current?.focus();
      setStatusMessage("Ready for any topic");
      return;
    }

    if (index === 1) {
      document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setStatusMessage("Core visual model highlighted");
      return;
    }

    if (index === 2) {
      document.getElementById("demos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setStatusMessage("Interactive demos ready");
      return;
    }

    setActiveCheckpoint(0);
    setRevealedStepCount((count) => Math.max(count, 1));
    document.getElementById("practice")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStatusMessage("Mastery path opened");
  };

  const toggleBookmark = () => {
    if (!lesson) return;

    setBookmarks((items) =>
      items.includes(lesson.topic)
        ? items.filter((item) => item !== lesson.topic)
        : [lesson.topic, ...items].slice(0, 5)
    );
    setStatusMessage(isSaved ? "Removed from saved lessons" : "Lesson saved");
  };

  const selectCheckpoint = (index: number) => {
    setActiveCheckpoint(index);
    setRevealedStepCount((count) => Math.max(count, index + 1));
    setPracticeReview(null);
    setStatusMessage(`Exploring step ${index + 1}`);
  };

  const revealNextStep = () => {
    const nextCount = Math.min(stepDetails.length || 4, revealedStepCount + 1);
    setRevealedStepCount(nextCount);
    setActiveCheckpoint(Math.max(0, nextCount - 1));
    setStatusMessage(nextCount >= (stepDetails.length || 4) ? "Full breakdown revealed" : "Next breakdown step revealed");
  };

  const completeCheckpoint = () => {
    const checkpointLabel = lesson?.stepDetails[activeCheckpoint]?.title ?? missionSteps[activeCheckpoint]?.label ?? "Practice";
    setCompletedCheckpoints((items) =>
      items.includes(activeCheckpoint) ? items : [...items, activeCheckpoint].sort()
    );
    setMemorySignals((items) =>
      [`Checkpoint ${activeCheckpoint + 1}: ${checkpointLabel} confidence`, ...items]
        .filter((item, index, all) => all.indexOf(item) === index)
        .slice(0, 4)
    );
    setStatusMessage(`Checkpoint ${activeCheckpoint + 1} locked in`);
  };

  const analyzePracticeAnswer = () => {
    const response = practiceAnswer.trim();

    if (!response) {
      setPracticeReview({
        score: 0,
        label: "Awaiting prediction",
        verdict: "Write what you expect to move first, then the coach can compare it against the model.",
        nextMove: currentCoachNote ?? "Start with the visible model behavior.",
        tone: "needs-work"
      });
      setStatusMessage("Practice answer needed");
      return;
    }

    const normalized = response.toLowerCase();
    const hasPrediction = /(first|predict|will|would|react|move|change|shift|increase|decrease|respond)/.test(normalized);
    const hasCausality = /(because|therefore|so|cause|causes|constraint|input|variable|if|then|depends)/.test(normalized);
    const hasVisualModel = /(sketch|see|visual|model|diagram|graph|line|node|map|orbit|timeline|field|system)/.test(normalized);
    const lengthScore = Math.min(18, Math.floor(response.length / 12));
    const score = Math.min(
      100,
      26 + lengthScore + (hasPrediction ? 22 : 0) + (hasCausality ? 22 : 0) + (hasVisualModel ? 18 : 0)
    );
    const tone: PracticeReview["tone"] = score >= 78 ? "strong" : score >= 56 ? "watch" : "needs-work";
    const label =
      tone === "strong"
        ? "Prediction-first reasoning"
        : tone === "watch"
          ? "Useful model, missing one link"
          : "Needs visible cause and effect";
    const verdict =
      tone === "strong"
        ? `Strong answer. You connected ${lesson?.topic ?? "the topic"} to a visible response and gave the model something to test.`
        : tone === "watch"
          ? "Good start. Add the constraint or variable that makes your prediction happen."
          : "This is still mostly description. Turn it into a prediction: what moves first, and why?";
    const nextMove =
      tone === "strong"
        ? "Mark the checkpoint, then transfer the same pattern to a nearby concept."
        : hasPrediction
          ? "Add the hidden constraint that explains the movement."
          : "Begin with: if the main variable changes, the first visible response is...";

    setPracticeReview({ score, label, verdict, nextMove, tone });
    setMemorySignals((items) =>
      [`Practice analysis: ${label}`, ...items]
        .filter((item, index, all) => all.indexOf(item) === index)
        .slice(0, 4)
    );

    if (score >= 78) {
      setCompletedCheckpoints((items) =>
        items.includes(activeCheckpoint) ? items : [...items, activeCheckpoint].sort()
      );
    }

    setStatusMessage(score >= 78 ? "Practice answer verified" : "Practice feedback ready");
  };

  const selectQuizOption = (option: Lesson["quizOptions"][number]) => {
    setSelectedQuizOption(option.id);
    setStatusMessage(option.correct ? "Prediction verified" : "Misconception detected");
    setMemorySignals((items) =>
      [
        option.correct ? "Prediction-first reasoning" : "Review model-before-definition habit",
        ...items
      ]
        .filter((item, index, all) => all.indexOf(item) === index)
        .slice(0, 4)
    );
  };

  const exportNotes = () => {
    if (!lesson) return;

    const notes = [
      `Visualearn notes: ${lesson.topic}`,
      `Layer: ${activeLayer}`,
      lesson.summary,
      `Analogy: ${lesson.analogy}`,
      `Breakdown: ${lesson.stepDetails.map((step, index) => `${index + 1}. ${step.title}`).join(" / ")}`,
      `Practice: ${lesson.practice}`
    ].join("\n\n");

    void navigator.clipboard?.writeText(notes).catch(() => undefined);
    setStatusMessage("Notes prepared for export");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    });
  };

  const tuneModelFromPointer = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));

    setPointer({ x, y });
    setSignal(Math.round(18 + (x / 100) * 74));
    setCurvature(Math.round(12 + ((100 - y) / 100) * 78));
    setActiveModelPreset("custom");
    setStatusMessage("Model tuned from canvas");
  };

  return (
    <main
      className={[
        "experience-shell",
        focusMode ? "focus-mode" : "",
        themeMode === "light" ? "light-mode" : ""
      ].join(" ").trim()}
      onPointerMove={handlePointerMove}
      style={
        {
          "--pointer-x": `${pointer.x}%`,
          "--pointer-y": `${pointer.y}%`,
          "--subject-accent": selectedSubject.accent
        } as CSSProperties
      }
    >
      <UniverseCanvas themeMode={themeMode} />
      <div className="ambient-grid" aria-hidden="true" />
      <aside className="workspace-rail" aria-label="Learning workspace">
        <div className="rail-card profile-card">
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>{progress}%</strong>
            <p>Mastery path</p>
          </div>
        </div>
        <div className="rail-card">
          <p className="rail-label">Recent</p>
          <div className="rail-list">
            {history.map((item) => (
              <button key={item} type="button" onClick={() => startLesson(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="rail-card">
          <p className="rail-label">Saved</p>
          {bookmarks.length > 0 ? (
            <div className="rail-list">
              {bookmarks.map((item) => (
                <button key={item} type="button" onClick={() => startLesson(item)}>
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <p className="rail-empty">Save lessons to build a personal map.</p>
          )}
        </div>
      </aside>

      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true" />
          Visualearn
        </a>
        <div className="nav-pill" role="list" aria-label="Product sections">
          <a href="#engine">Engine</a>
          <a href="#subjects">Subjects</a>
          <a href="#demos">Demos</a>
          <a href="#lesson">Lesson</a>
          <a href="#studio">Studio</a>
          <a href="#practice">Practice</a>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={() => setThemeMode((mode) => (mode === "dark" ? "light" : "dark"))}>
            {themeMode === "dark" ? "Light" : "Dark"}
          </button>
          <button className="ghost-button" type="button" onClick={() => setCommandOpen(true)}>
            Command K
          </button>
        </div>
      </nav>

      {commandOpen ? (
        <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="command-panel">
            <div className="command-header">
              <span>Command center</span>
              <button type="button" onClick={() => setCommandOpen(false)} aria-label="Close command palette">
                Esc
              </button>
            </div>
            <form className="command-search" onSubmit={handleSubmit}>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Search or generate any concept"
                autoFocus
              />
              <button type="submit">Generate</button>
            </form>
            <div className="command-grid">
              {featuredMissions.map((mission) => (
                <button key={mission} type="button" onClick={() => startLesson(mission)}>
                  <span>Launch lesson</span>
                  {mission}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI visual learning universe</p>
          <h1>Learn Anything. See Everything.</h1>
          <p className="hero-subtext">
            Turn any concept into an interactive lesson with live models, visual analogies,
            adaptive practice, and a map of connected ideas.
          </p>
        </div>

        <form className="topic-console" onSubmit={handleSubmit}>
          <label htmlFor="topic">What do you want to understand?</label>
          <div className="input-row">
            <input
              ref={topicInputRef}
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={examples[activeExample]}
              autoComplete="off"
            />
            <button type="submit" disabled={isComposing}>
              {isComposing ? "Composing" : "Visualize"}
            </button>
          </div>
          <div className="console-meta">
            <span>Try: {examples[activeExample]}</span>
            <span>{isComposing ? "Generating models..." : statusMessage}</span>
          </div>
          {isComposing ? (
            <div className="composition-loader" aria-label="Lesson generation progress">
              <span />
            </div>
          ) : null}
        </form>

        <div className="onboarding-panel" aria-label="Visualearn starter sequence">
          <div className="onboarding-header">
            <div>
              <p className="eyebrow">Starter sequence</p>
              <h2>From curiosity to mastery in four moves.</h2>
            </div>
            <span>{activeOnboardingStep + 1}/4 active</span>
          </div>
          <div className="onboarding-steps">
            {onboardingSteps.map((step, index) => (
              <button
                className={[
                  "onboarding-step",
                  activeOnboardingStep === index ? "active" : "",
                  index < activeOnboardingStep ? "complete" : ""
                ].join(" ").trim()}
                key={step.label}
                type="button"
                onClick={() => selectOnboardingStep(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </button>
            ))}
          </div>
          <div className="onboarding-actions">
            <button type="button" onClick={() => startLesson(topic.trim() || examples[activeExample])}>
              Launch starter lesson
            </button>
            <button type="button" onClick={() => selectOnboardingStep(3)}>
              Open mastery path
            </button>
          </div>
        </div>

        {isComposing ? (
          <div className="generation-dock" role="status" aria-live="polite">
            <div className="generation-orb" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="generation-copy">
              <span>Visualearn synthesis</span>
              <strong>{generationStages[generationStage].label}</strong>
              <p>{generationStages[generationStage].detail}</p>
            </div>
            <div className="generation-steps" aria-label="Generation stages">
              {generationStages.map((stage, index) => (
                <span
                  className={[
                    index === generationStage ? "active" : "",
                    index < generationStage ? "complete" : ""
                  ].join(" ").trim()}
                  key={stage.label}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <div className="generation-progress">
              <span style={{ width: `${25 + generationStage * 25}%` }} />
            </div>
          </div>
        ) : null}

        <div className="mission-briefing" aria-label="Guided learning path">
          <div className="briefing-header">
            <span>Today&apos;s guided path</span>
            <strong>{completedCheckpoints.length}/4 checkpoints</strong>
          </div>
          <div className="briefing-steps">
            {missionSteps.map((step, index) => (
              <button
                className={[
                  "briefing-step",
                  activeCheckpoint === index ? "active" : "",
                  completedCheckpoints.includes(index) ? "complete" : ""
                ].join(" ").trim()}
                key={step.label}
                type="button"
                onClick={() => {
                  setActiveCheckpoint(index);
                  document.getElementById("practice")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span>{step.label}</span>
                <p>{step.detail}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="hero-orbit" aria-label="Live lesson preview">
          <div className="orbit-core">
            <span>{lesson?.subject}</span>
            <strong>{lesson?.topic}</strong>
          </div>
          {["Simulation", "Analogy", "Quiz", "Map"].map((label, index) => (
            <div className={`orbit-chip orbit-chip-${index + 1}`} key={label}>
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="metrics-band" aria-label="Platform capabilities">
        {[
          ["120fps", "motion target"],
          ["8", "lesson modules"],
          [String(subjects.length), "subject renderers"],
          [String(bookmarks.length), "saved lessons"]
        ].map(([value, label]) => (
          <div className="metric" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="pipeline-section" id="engine">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>From question to explorable system.</h2>
        </div>
        <div className="pipeline">
          {pipeline.map((item, index) => (
            <article className="pipeline-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                {index === 0
                  ? "Ask naturally, from a school topic to a research rabbit hole."
                  : index === 1
                    ? "The engine identifies primitives, misconceptions, and depth."
                    : index === 2
                      ? "Graphs, timelines, maps, fields, and diagrams become live."
                      : "Practice adapts around the model until intuition sticks."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="subject-section" id="subjects">
        <div className="section-heading">
          <p className="eyebrow">Subject renderers</p>
          <h2>Every domain gets its own visual language.</h2>
        </div>
        <div className="subject-grid">
          {subjects.map((subject) => (
            <article className="subject-card" key={subject.name} style={{ "--card-accent": subject.accent } as CSSProperties}>
              <div className="subject-preview" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.detail}</p>
              <button type="button" onClick={() => startLesson(subject.name)}>
                Open renderer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="demo-section" id="demos">
        <div className="section-heading">
          <p className="eyebrow">Playable demos</p>
          <h2>Try a lesson before you generate one.</h2>
        </div>
        <div className="demo-lab">
          <div className={`demo-preview demo-${selectedDemo.id}`} aria-label={`${selectedDemo.title} live preview`}>
            <div className="demo-hud">
              <span>{selectedDemo.subject}</span>
              <strong>{selectedDemo.title}</strong>
              <p>{selectedDemo.caption}</p>
            </div>
            <svg viewBox="0 0 100 100" role="img" aria-label={`${selectedDemo.title} visual model`}>
              {selectedDemo.id === "derivative" ? (
                <>
                  <path className="demo-axis" d="M 10 78 L 92 78 M 14 92 L 14 12" />
                  <path
                    className="demo-curve"
                    d={`M 10 ${72 - demoIntensity / 12} C 28 ${24 + demoIntensity / 8}, 56 ${88 - demoIntensity / 4}, 90 ${28 + demoIntensity / 7}`}
                  />
                  <line
                    className="demo-tangent"
                    x1={34 + demoIntensity / 5}
                    y1={28}
                    x2={62 + demoIntensity / 8}
                    y2={82}
                  />
                  <circle className="demo-dot" cx={42 + demoIntensity / 3} cy={58 - demoIntensity / 7} r="4" />
                </>
              ) : null}
              {selectedDemo.id === "orbit" ? (
                <>
                  <circle className="demo-well" cx="50" cy="50" r={10 + demoIntensity / 9} />
                  <ellipse className="demo-orbit-a" cx="50" cy="50" rx={24 + demoIntensity / 3.8} ry={13 + demoIntensity / 10} />
                  <ellipse className="demo-orbit-b" cx="50" cy="50" rx={16 + demoIntensity / 5} ry={31 + demoIntensity / 8} />
                  <circle className="demo-dot" cx={28 + demoIntensity / 2.5} cy={34} r="3.5" />
                </>
              ) : null}
              {selectedDemo.id === "revolution" ? (
                <>
                  <path className="demo-axis" d="M 10 50 L 92 50" />
                  {[16, 38, 60, 82].map((x, index) => (
                    <g key={x}>
                      <circle className="demo-timeline-node" cx={x} cy="50" r={6 + index + demoIntensity / 36} />
                      <line className="demo-pressure" x1={x} y1={50} x2={x} y2={22 + index * 8 - demoIntensity / 12} />
                    </g>
                  ))}
                  <path className="demo-curve" d={`M 12 76 C 34 ${70 - demoIntensity / 4}, 54 ${82 - demoIntensity / 2}, 90 ${22 + demoIntensity / 8}`} />
                </>
              ) : null}
            </svg>
            <div className="demo-readout">
              <span>
                Intensity
                <strong>{demoIntensity}%</strong>
              </span>
              <span>
                Layer
                <strong>{activeLayer}</strong>
              </span>
            </div>
          </div>

          <aside className="demo-controls">
            <div className="demo-selector" role="tablist" aria-label="Playable demo selector">
              {playableDemos.map((demo) => (
                <button
                  className={activeDemo === demo.id ? "active" : ""}
                  key={demo.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDemo === demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                >
                  <span>{demo.subject}</span>
                  {demo.title}
                </button>
              ))}
            </div>
            <label className="demo-slider">
              Simulation intensity
              <input
                type="range"
                min="18"
                max="92"
                value={demoIntensity}
                onChange={(event) => setDemoIntensity(Number(event.target.value))}
              />
            </label>
            <button type="button" onClick={() => startLesson(selectedDemo.topic)}>
              Generate full lesson
            </button>
          </aside>
        </div>
      </section>

      <section className="lesson-lab" id="lesson">
        <div className="lesson-panel">
          <div className="lesson-header">
            <div>
              <p className="eyebrow">Generated lesson</p>
              <h2>{lesson?.topic}</h2>
            </div>
            <span className="subject-badge">{lesson?.subject}</span>
          </div>
          <div className="lesson-actions" aria-label="Lesson actions">
            <button type="button" onClick={toggleBookmark}>
              {isSaved ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={exportNotes}>
              Export notes
            </button>
            <button type="button" onClick={() => setFocusMode((value) => !value)}>
              {focusMode ? "Exit focus" : "Focus mode"}
            </button>
          </div>

          <div className="layer-tabs" role="tablist" aria-label="Lesson depth">
            {layers.map((layer) => (
              <button
                key={layer}
                type="button"
                role="tab"
                aria-selected={activeLayer === layer}
                className={activeLayer === layer ? "active" : ""}
                onClick={() => setActiveLayer(layer)}
              >
                {layer}
              </button>
            ))}
          </div>

          <div className="visual-stage">
            <div
              className="model-interaction-shell"
              onPointerDown={tuneModelFromPointer}
              onPointerMove={(event) => {
                if (event.buttons === 1) tuneModelFromPointer(event);
              }}
              aria-label="Direct manipulation model surface"
            >
              <DomainRenderer
                activeLayer={activeLayer}
                curvature={curvature}
                profile={rendererProfile}
                signal={signal}
                topic={lesson?.topic ?? "Concept"}
              />
              <div
                className="model-reticle"
                style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
                aria-hidden="true"
              >
                <span />
              </div>
              <div className="model-hint">Drag the field to tune signal and constraint</div>
            </div>
            <div className="lesson-copy">
              <p>{lesson?.summary}</p>
              <div className="outcome-grid" aria-label="Learning outcomes">
                {lesson?.outcomes.map((outcome, index) => (
                  <span key={outcome}>
                    <strong>{index + 1}</strong>
                    {outcome}
                  </span>
                ))}
              </div>
              <div className="layer-insight" key={activeLayer}>
                <span>{activeLayer} layer</span>
                <strong>{layerDetails[activeLayer]}</strong>
              </div>
              <div className="analogy-theater" aria-label="Animated visual analogy">
                <div className="analogy-header">
                  <span>Visual analogy</span>
                  <strong>Show both worlds</strong>
                </div>
                <div className="analogy-worlds">
                  <div className="analogy-world familiar-world">
                    <span>Familiar</span>
                    <strong>{lesson?.analogyMap.familiar}</strong>
                    <div className="analogy-mini-scene" aria-hidden="true">
                      <span className="analogy-knob" />
                      <span className="analogy-meter analogy-meter-a" />
                      <span className="analogy-meter analogy-meter-b" />
                      <span className="analogy-meter analogy-meter-c" />
                    </div>
                  </div>
                  <div className="analogy-bridge" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="analogy-world concept-world">
                    <span>Concept</span>
                    <strong>{lesson?.analogyMap.concept}</strong>
                    <div className="analogy-mini-scene" aria-hidden="true">
                      <span className="analogy-orbit analogy-orbit-a" />
                      <span className="analogy-orbit analogy-orbit-b" />
                      <span className="analogy-core" />
                    </div>
                  </div>
                </div>
                <p>{lesson?.analogyMap.bridge}</p>
                <div className="analogy-takeaway">
                  <span>Transfer rule</span>
                  <strong>{lesson?.analogyMap.takeaway}</strong>
                </div>
              </div>
              <div className="model-console" aria-label="Interactive model console">
                <div className="model-console-header">
                  <span>Experiment console</span>
                  <strong>{modelTension}% system tension</strong>
                </div>
                <div className="model-preset-grid">
                  {modelPresets.map((preset) => (
                    <button
                      className={activeModelPreset === preset.id ? "active" : ""}
                      key={preset.id}
                      type="button"
                      onClick={() => applyModelPreset(preset.id)}
                    >
                      <span>{preset.label}</span>
                      {preset.detail}
                    </button>
                  ))}
                </div>
                <div className="model-readout-grid">
                  <span>
                    Stability
                    <strong>{modelStability}%</strong>
                  </span>
                  <span>
                    Response
                    <strong>{signal > curvature ? "Signal" : "Constraint"}</strong>
                  </span>
                </div>
                <p>{modelPrediction}</p>
              </div>
              <div className="control-stack">
                <label>
                  Signal strength
                  <input
                    type="range"
                    min="18"
                    max="92"
                    value={signal}
                    onChange={(event) => setSignal(Number(event.target.value))}
                  />
                </label>
                <label>
                  Model curvature
                  <input
                    type="range"
                    min="12"
                    max="90"
                    value={curvature}
                    onChange={(event) => setCurvature(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <section className="engine-brief" aria-label="AI lesson decomposition">
          <div className="brief-copy">
            <p className="eyebrow">AI engine logic</p>
            <h3>Decomposition before explanation.</h3>
            <p>
              Visualearn breaks {lesson?.topic} into structured learning primitives before it writes the lesson.
            </p>
          </div>
          <div className="brief-console">
            <div className="brief-meta">
              <span>
                Subject
                <strong>{lesson?.subject}</strong>
              </span>
              <span>
                Complexity
                <strong>{lesson?.complexity}</strong>
              </span>
              <span>
                Active layer
                <strong>{activeLayer}</strong>
              </span>
            </div>
            <div className="brief-tabs" role="tablist" aria-label="Lesson brief sections">
              {briefTabs.map((tab) => (
                <button
                  className={activeBriefTab === tab.id ? "active" : ""}
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeBriefTab === tab.id}
                  onClick={() => setActiveBriefTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="brief-item-grid">
              {briefItems?.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setStatusMessage(`${briefTabs.find((tab) => tab.id === activeBriefTab)?.label ?? "Brief"} item ${index + 1} selected`);
                    if (activeBriefTab === "connections") startLesson(`${lesson?.topic ?? "Concept"} ${item}`);
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="breakdown-panel" aria-label="Step-by-step lesson breakdown">
          <div className="breakdown-header">
            <div>
              <p className="eyebrow">Step-by-step breakdown</p>
              <h3>Reveal the model one move at a time.</h3>
              <p>
                Each step unlocks the next layer of intuition, then syncs with practice so the lesson feels guided from the first move.
              </p>
            </div>
            <button type="button" onClick={revealNextStep} disabled={allStepsRevealed}>
              {allStepsRevealed ? "All steps revealed" : "Reveal next step"}
            </button>
          </div>
          <div className="breakdown-sequence">
            {stepDetails.slice(0, revealedStepCount).map((step, index) => (
              <button
                className={[
                  "breakdown-step",
                  activeCheckpoint === index ? "active" : "",
                  completedCheckpoints.includes(index) ? "complete" : ""
                ].join(" ").trim()}
                key={step.title}
                type="button"
                onClick={() => selectCheckpoint(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.explanation}</p>
                  <strong>{step.check}</strong>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="lesson-sidebar">
          <div className="mini-panel progress-panel">
            <h3>Learning telemetry</h3>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>{progress}% toward today&apos;s mastery target.</p>
          </div>
          <div className="mini-panel">
            <h3>Visual components</h3>
            {lesson?.visuals.map((visual) => <span key={visual}>{visual}</span>)}
          </div>
          <div className="mini-panel memory-panel">
            <h3>Smart memory</h3>
            <p>{adaptiveNudge}</p>
            <div className="memory-list">
              {memorySignals.map((signalItem) => (
                <span key={signalItem}>{signalItem}</span>
              ))}
            </div>
          </div>
          <div className="mini-panel empty-state">
            <h3>Saved lessons</h3>
            <p>{bookmarks.length > 0 ? "Your saved concepts are ready in the rail." : "Pin a lesson and Visualearn will build your personal knowledge path here."}</p>
            <button type="button" onClick={toggleBookmark}>
              {isSaved ? "Saved to path" : "Save current lesson"}
            </button>
          </div>
        </aside>
      </section>

      <section className="knowledge-section">
        <div className="section-heading">
          <p className="eyebrow">Infinite knowledge graph</p>
          <h2>Concepts become a navigable universe.</h2>
        </div>
        <div className="graph-toolbar" aria-label="Knowledge graph controls">
          <span>Universe zoom</span>
          <input
            type="range"
            min="1"
            max="1.45"
            step="0.05"
            value={graphZoom}
            onChange={(event) => setGraphZoom(Number(event.target.value))}
            aria-label="Zoom knowledge graph"
          />
          <strong>{Math.round(graphZoom * 100)}%</strong>
          <span className="graph-path">
            Path: {lesson?.subject} / {activeUniverseNode?.originalLabel}
          </span>
        </div>
        <div className="graph-shell">
          <div className="graph-atmosphere" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="graph-viewport" style={{ transform: `scale(${graphZoom})` }}>
            <svg viewBox="0 0 100 100" role="img" aria-label="Interactive knowledge universe">
              <defs>
                <radialGradient id="graphCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                  <stop offset="48%" stopColor="white" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle className="graph-ring ring-a" cx="52" cy="50" r="19" />
              <circle className="graph-ring ring-b" cx="52" cy="50" r="32" />
              <circle className="graph-ring ring-c" cx="52" cy="50" r="43" />
              <circle className="graph-core" cx="52" cy="50" r="8" />
              {universeNodes.filter((node) => node.id !== "mastery").map((node) => (
                <line
                  className={activeGraphNode === node.id ? "active" : ""}
                  key={node.id}
                  x1={node.x}
                  y1={node.y}
                  x2={universeNodes[5].x}
                  y2={universeNodes[5].y}
                />
              ))}
            </svg>
            {universeNodes.map((node) => (
              <button
                className={[
                  "concept-node",
                  `depth-${node.depth}`,
                  activeGraphNode === node.id ? "active" : ""
                ].join(" ").trim()}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                key={node.id}
                type="button"
                onClick={() => {
                  setActiveGraphNode(node.id);
                  setStatusMessage(`${node.originalLabel} node selected`);
                }}
              >
                <span>{node.originalLabel}</span>
                {node.label}
              </button>
            ))}
          </div>
          <aside className="graph-inspector" aria-label="Selected knowledge path">
            <span>{activeUniverseNode?.originalLabel}</span>
            <h3>{activeUniverseNode?.label}</h3>
            <p>{activeUniverseNode?.detail}</p>
            <div className="graph-inspector-meta">
              <strong>{lesson?.subject}</strong>
              <strong>{Math.round(graphZoom * 100)}% zoom</strong>
            </div>
            <button
              type="button"
              onClick={() => startLesson(`${lesson?.topic ?? "Concept"} ${activeUniverseNode?.label ?? "connection"}`)}
            >
              Traverse concept
            </button>
          </aside>
        </div>
      </section>

      <section className="studio-section" id="studio">
        <div className="section-heading">
          <p className="eyebrow">Learning studio</p>
          <h2>Advanced modes feel built in, not bolted on.</h2>
        </div>
        <div className="studio-grid">
          <div className="studio-showcase">
            <div className="studio-tabs" role="tablist" aria-label="Learning studio modes">
              {studioModes.map((mode) => (
                <button
                  className={activeStudio === mode.id ? "active" : ""}
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStudio === mode.id}
                  onClick={() => setActiveStudio(mode.id)}
                >
                  <span>{mode.eyebrow}</span>
                  {mode.title}
                </button>
              ))}
            </div>
            <div className={`studio-canvas studio-${selectedStudio.id}`} aria-label={`${selectedStudio.title} preview`}>
              {selectedStudio.id === "whiteboard" ? (
                <div className="whiteboard-board">
                  <div className="whiteboard-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <svg className="whiteboard-sketch" viewBox="0 0 100 100" aria-hidden="true">
                    <path d="M 12 70 C 24 38, 42 28, 55 48 S 76 78, 91 26" />
                    <path className="whiteboard-secondary" d="M 18 72 L 82 22" />
                    <circle cx="55" cy="48" r="3" />
                  </svg>
                  <div className="studio-node studio-node-a">{lesson?.subject}</div>
                  <div className="studio-node studio-node-b">{activeStudioStep.label}</div>
                  <div className="studio-node studio-node-c">{lesson?.topic}</div>
                  <div className="whiteboard-caption">
                    <span>Stroke {studioStep + 1}</span>
                    <p>{activeStudioStep.detail}</p>
                  </div>
                </div>
              ) : null}

              {selectedStudio.id === "voice" ? (
                <div className="voice-stage">
                  <div className={`voice-ring ${voiceActive ? "live" : ""}`} aria-hidden="true">
                    <span />
                    <span />
                    <strong>{voiceActive ? "Live" : "Ready"}</strong>
                  </div>
                  <div className="voice-transcript">
                    <span>Voice walkthrough</span>
                    <h4>{activeStudioStep.label}</h4>
                    <p>
                      {voiceActive
                        ? `Now watch ${lesson?.topic ?? "the model"} shift as ${activeLayer.toLowerCase()} cues appear.`
                        : activeStudioStep.detail}
                    </p>
                  </div>
                  <div className="voice-wave" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : null}

              {selectedStudio.id === "battle" ? (
                <div className="battle-stage">
                  <div className="battle-score">
                    <span>
                      Learner
                      <strong>{7 + completedCheckpoints.length + battleRound}</strong>
                    </span>
                    <span>
                      AI rival
                      <strong>{6 + battleRound}</strong>
                    </span>
                    <span>
                      Tempo
                      <strong>{Math.min(98, 62 + battleRound * 4)}%</strong>
                    </span>
                  </div>
                  <div className="battle-arena" aria-hidden="true">
                    <span className="battle-player learner">You</span>
                    <span className="battle-orb battle-orb-a" />
                    <span className="battle-orb battle-orb-b" />
                    <span className="battle-player rival">AI</span>
                  </div>
                  <div className="battle-brief">
                    <span>Round {battleRound}</span>
                    <h4>{activeStudioStep.label}</h4>
                    <p>{activeStudioStep.detail}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="studio-control-panel">
            <p className="eyebrow">{selectedStudio.eyebrow}</p>
            <h3>{selectedStudio.title}</h3>
            <p>{selectedStudio.detail}</p>
            <div className="studio-status-grid">
              <span>
                Lesson
                <strong>{lesson?.topic}</strong>
              </span>
              <span>
                Step
                <strong>{activeStudioStep.label}</strong>
              </span>
              <span>
                Voice
                <strong>{voiceActive ? "Live" : "Ready"}</strong>
              </span>
              <span>
                Battle
                <strong>Round {battleRound}</strong>
              </span>
            </div>
            <div className="studio-sequence" aria-label={`${selectedStudio.title} sequence`}>
              {selectedStudioSequence.map((step, index) => (
                <button
                  className={studioStep === index ? "active" : ""}
                  key={step.label}
                  type="button"
                  onClick={() => {
                    setStudioStep(index);
                    setStatusMessage(`${selectedStudio.title}: ${step.label}`);
                  }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step.label}</strong>
                  <em>{step.detail}</em>
                </button>
              ))}
            </div>
            <div className="studio-actions">
              <button
                type="button"
                onClick={() => {
                  if (selectedStudio.id === "voice") {
                    setVoiceActive((value) => !value);
                    setStatusMessage(voiceActive ? "Narration paused" : "Voice walkthrough active");
                    return;
                  }

                  if (selectedStudio.id === "battle") {
                    setBattleRound((value) => value + 1);
                    setMemorySignals((items) =>
                      [`Battle round ${battleRound + 1}: pressure-tested recall`, ...items]
                        .filter((item, index, all) => all.indexOf(item) === index)
                        .slice(0, 4)
                    );
                    setStatusMessage("Quiz battle advanced");
                    return;
                  }

                  setStudioStep((value) => (value + 1) % selectedStudioSequence.length);
                  setStatusMessage("Whiteboard stroke advanced");
                }}
              >
                {selectedStudio.id === "voice"
                  ? voiceActive
                    ? "Pause voice"
                    : "Start voice"
                  : selectedStudio.id === "battle"
                    ? "Advance battle"
                    : "Advance stroke"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setStudioStep((value) => (value + 1) % selectedStudioSequence.length);
                  setStatusMessage(`${selectedStudio.title} sequence advanced`);
                }}
              >
                Next studio step
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="practice-section" id="practice">
        <div className="practice-card">
          <p className="eyebrow">Practice mode</p>
          <h2>Mastery is checked visually, not just verbally.</h2>
          <p>{lesson?.practice}</p>
          <div className="coach-card">
            <span>AI coach</span>
            <p>{currentCoachNote}</p>
            <button type="button" onClick={completeCheckpoint}>
              {completedCheckpoints.includes(activeCheckpoint) ? "Checkpoint complete" : "Mark understood"}
            </button>
          </div>
          <div className="answer-lab">
            <div className="answer-lab-header">
              <span>Answer lab</span>
              <strong>{currentStepDetail?.title ?? `Checkpoint ${activeCheckpoint + 1}`}</strong>
            </div>
            <label htmlFor="practice-answer">
              Predict the first visible response, then explain the hidden cause.
            </label>
            <textarea
              id="practice-answer"
              value={practiceAnswer}
              onChange={(event) => {
                setPracticeAnswer(event.target.value);
                if (practiceReview) setPracticeReview(null);
              }}
              placeholder={`If ${lesson?.topic ?? "the concept"} changes, I expect...`}
              rows={4}
            />
            <div className="answer-actions">
              <button type="button" onClick={analyzePracticeAnswer}>
                Analyze answer
              </button>
              <span>{practiceAnswer.trim().length} characters</span>
            </div>
            {practiceReview ? (
              <div className={`practice-review ${practiceReview.tone}`}>
                <div className="review-score" aria-label={`Practice score ${practiceReview.score} percent`}>
                  <span style={{ width: `${practiceReview.score}%` }} />
                </div>
                <div className="review-copy">
                  <strong>{practiceReview.label}</strong>
                  <p>{practiceReview.verdict}</p>
                  <span>{practiceReview.nextMove}</span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="step-list">
            {lesson?.steps.map((step, index) => (
              <button
                className={[
                  "step-item",
                  activeCheckpoint === index ? "active" : "",
                  completedCheckpoints.includes(index) ? "complete" : ""
                ].join(" ").trim()}
                key={step}
                type="button"
                onClick={() => selectCheckpoint(index)}
              >
                <span>{index + 1}</span>
                <p>{step}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="quiz-card">
          <div className="quiz-header">
            <div>
              <span>Prediction battle</span>
              <strong>{quizStateLabel}</strong>
            </div>
            <div className="quiz-streak">
              <span>Streak</span>
              <strong>{7 + completedCheckpoints.length}</strong>
            </div>
          </div>
          <div className="quiz-arena" aria-label="Quiz battle telemetry">
            <div className="quiz-radar" aria-hidden="true">
              <span />
              <span />
              <strong>{Math.round(quizAccuracy)}%</strong>
            </div>
            <div className="quiz-telemetry">
              <span>
                Accuracy
                <strong>{quizAccuracy}%</strong>
              </span>
              <span>
                Pressure
                <strong>{quizPressure}%</strong>
              </span>
              <span>
                Tempo
                <strong>{quizTempo}%</strong>
              </span>
            </div>
          </div>
          <div className="quiz-question">
            <span>Checkpoint {activeCheckpoint + 1}</span>
            <h3>Prediction check</h3>
            <p>If the main variable increases, which connected concept reacts first?</p>
          </div>
          {hintRevealed ? (
            <div className="hint-line">
              <span>Coach hint</span>
              <p>{lesson?.challenge}</p>
            </div>
          ) : null}
          <div className="quiz-options" aria-label="Quiz answer options">
            {lesson?.quizOptions.map((option, index) => (
              <button
                className={[
                  "quiz-option",
                  selectedQuizOption === option.id ? "selected" : "",
                  selectedQuizOption === option.id && option.correct ? "correct" : "",
                  selectedQuizOption === option.id && !option.correct ? "incorrect" : ""
                ].join(" ").trim()}
                key={option.id}
                type="button"
                onClick={() => selectQuizOption(option)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                <strong>{option.label}</strong>
                {selectedQuizOption === option.id ? (
                  <em>{option.correct ? "Model match" : "Needs repair"}</em>
                ) : null}
              </button>
            ))}
          </div>
          {selectedOption ? (
            <div className={selectedOption.correct ? "quiz-feedback correct" : "quiz-feedback incorrect"}>
              <span>{selectedOption.correct ? "Clean prediction" : "Misconception found"}</span>
              <p>{selectedOption.feedback}</p>
            </div>
          ) : null}
          <div className="quiz-trace" aria-label="Quiz reasoning trace">
            {quizTrace.map((trace, index) => (
              <span key={trace} className={index === quizTrace.length - 1 ? "active" : ""}>
                {trace}
              </span>
            ))}
          </div>
          <div className="mastery-signals" aria-label="Mastery signals">
            {lesson?.masterySignals.map((signalItem, index) => (
              <span key={signalItem}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                {signalItem}
              </span>
            ))}
          </div>
          <button type="button" onClick={() => setHintRevealed((value) => !value)}>
            {hintRevealed ? "Hide hint" : "Reveal hint"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setActiveCheckpoint((value) => {
                const nextCheckpoint = (value + 1) % 4;
                setRevealedStepCount((count) => Math.max(count, nextCheckpoint + 1));
                return nextCheckpoint;
              });
              setSelectedQuizOption(null);
              setPracticeAnswer("");
              setPracticeReview(null);
            }}
          >
            Advance checkpoint
          </button>
        </div>
      </section>
    </main>
  );
}
