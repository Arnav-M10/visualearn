"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { CleanLesson, LessonBlock, LessonQuestion, LessonVisualElement } from "@/lib/visualearn-lessons";

type LessonExperienceProps = {
  lesson: CleanLesson;
};

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const [controlValues, setControlValues] = useState(() =>
    Object.fromEntries(lesson.scene.controls.map((control) => [control.label, control.value]))
  );
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [activeTargetId, setActiveTargetId] = useState<string | undefined>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const activeBlock = lesson.blocks[activeBlockIndex] ?? lesson.blocks[0];
  const activeId = activeTargetId ?? activeBlock?.targetId ?? lesson.scene.callouts[0]?.targetId ?? lesson.scene.elements[0]?.id;
  const intensity = useMemo(() => {
    const normalized = lesson.scene.controls.map((control) => {
      const value = controlValues[control.label] ?? control.value;
      const range = Math.max(1, control.max - control.min);
      return (value - control.min) / range;
    });

    if (!normalized.length) return 0.55;
    const average = normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
    return Math.max(0.08, Math.min(1, average));
  }, [controlValues, lesson.scene.controls]);

  const updateControl = (label: string, delta: number) => {
    const control = lesson.scene.controls.find((item) => item.label === label);
    if (!control) return;

    setControlValues((current) => ({
      ...current,
      [label]: Math.min(control.max, Math.max(control.min, (current[label] ?? control.value) + delta))
    }));
  };

  return (
    <div className="lesson-experience">
      <section className="lesson-stage lesson-stage-generated" aria-labelledby="lesson-stage-title">
        <div className="lesson-stage-copy">
          <p className="result-eyebrow">{lesson.subject} / {lesson.confidence.replace("-", " ")}</p>
          <h1 id="lesson-stage-title">{lesson.topic}</h1>
          <p>{lesson.summary}</p>
          <div className="format-chip-row" aria-label="Generated lesson format">
            <span>{lesson.format}</span>
            <span>{lesson.scene.format}</span>
          </div>
        </div>

        <div className="simulation-shell generated-shell">
          <div className="simulation-topline">
            <div>
              <span>{lesson.scene.background} scene</span>
              <strong>{lesson.scene.title}</strong>
            </div>
            <p>{lesson.scene.visualIntent}</p>
          </div>

          <GeneratedSceneCanvas
            lesson={lesson}
            intensity={intensity}
            activeId={activeId}
            onActivateTarget={(targetId) => {
              setActiveTargetId(targetId);
              const nextIndex = lesson.blocks.findIndex((block) => block.targetId === targetId);
              if (nextIndex >= 0) setActiveBlockIndex(nextIndex);
            }}
          />

          <div className="simulation-controls generated-controls" aria-label="Model controls">
            {lesson.scene.controls.map((control) => (
              <label key={control.label}>
                <span>
                  {control.label}
                  <strong>
                    {Math.round(controlValues[control.label] ?? control.value)}
                    {control.unit}
                  </strong>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  value={controlValues[control.label] ?? control.value}
                  onChange={(event) =>
                    setControlValues((current) => ({
                      ...current,
                      [control.label]: Number(event.target.value)
                    }))
                  }
                />
                <div className="control-steppers" aria-label={`${control.label} quick controls`}>
                  <button type="button" onClick={() => updateControl(control.label, -10)}>
                    -
                  </button>
                  <button type="button" onClick={() => updateControl(control.label, 10)}>
                    +
                  </button>
                </div>
                <small>{control.effect}</small>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="generated-learning-stream" aria-label="Generated learning sequence">
        <div className="stream-heading">
          <p className="result-eyebrow">Generated path</p>
          <h2>Follow the picture first.</h2>
        </div>

        <div className="lesson-block-grid">
          {lesson.blocks.map((block, index) => (
            <LessonBlockCard
              key={`${block.title}-${index}`}
              block={block}
              index={index}
              active={index === activeBlockIndex}
              selected={answers[`block-${index}`]}
              onFocus={() => {
                setActiveBlockIndex(index);
                setActiveTargetId(block.targetId);
              }}
              onAnswer={(value) => setAnswers((current) => ({ ...current, [`block-${index}`]: value }))}
            />
          ))}
        </div>
      </section>

      <section className="practice-grid generated-practice" aria-label="Practice questions">
        <div className="practice-heading">
          <p className="result-eyebrow">Practice loop</p>
          <h2>Short checks. Real transfer.</h2>
        </div>
        {lesson.practice.map((question, index) => (
          <QuestionCard
            key={`${question.question}-${index}`}
            question={question}
            id={`practice-${index}`}
            selected={answers[`practice-${index}`]}
            onAnswer={(value) => setAnswers((current) => ({ ...current, [`practice-${index}`]: value }))}
          />
        ))}
      </section>

      <section className="source-row" aria-label="Sources and next questions">
        <div>
          <p className="result-eyebrow">Go deeper</p>
          <div className="source-list">
            {lesson.sources.length ? (
              lesson.sources.map((source) => (
                <a href={source.url} key={source.url}>
                  <strong>{source.title}</strong>
                  <span>{source.extract}</span>
                </a>
              ))
            ) : (
              <p>No source summary found. Treat this as a starting model and verify details before deep study.</p>
            )}
          </div>
        </div>
        <div>
          <p className="result-eyebrow">Next questions</p>
          <div className="follow-up-list">
            {lesson.followUps.map((question) => (
              <a href={`/learn?topic=${encodeURIComponent(question)}`} key={question}>
                {question}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LessonBlockCard({
  block,
  index,
  active,
  selected,
  onFocus,
  onAnswer
}: {
  block: LessonBlock;
  index: number;
  active: boolean;
  selected?: string;
  onFocus: () => void;
  onAnswer: (value: string) => void;
}) {
  return (
    <article className={`lesson-block-card ${active ? "active" : ""}`} data-target-id={block.targetId} onMouseEnter={onFocus} onFocus={onFocus}>
      <button type="button" className="block-focus-button" onClick={onFocus}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{block.kind}</strong>
      </button>
      <div className="block-copy">
        <h3>{block.title}</h3>
        {block.body ? <p>{block.body}</p> : null}
      </div>
      {block.question ? (
        <QuestionCard question={block.question} id={`block-${index}`} selected={selected} onAnswer={onAnswer} compact />
      ) : null}
    </article>
  );
}

function QuestionCard({
  question,
  id,
  selected,
  onAnswer,
  compact = false
}: {
  question: LessonQuestion;
  id: string;
  selected?: string;
  onAnswer: (value: string) => void;
  compact?: boolean;
}) {
  const isAnswered = Boolean(selected);
  const correct = selected === question.answer;

  return (
    <article className={`question-card ${compact ? "compact" : ""} ${isAnswered ? (correct ? "correct" : "incorrect") : ""}`}>
      <h3>{question.question}</h3>
      <div className="question-options">
        {question.choices.map((choice) => (
          <button
            type="button"
            key={choice}
            className={selected === choice ? "selected" : ""}
            onClick={() => onAnswer(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      {isAnswered ? (
        <p>
          <strong>{correct ? "Yes." : "Not quite."}</strong> {correct ? question.hint : `Look for: ${question.answer}. ${question.hint}`}
        </p>
      ) : (
        <small id={id}>{question.hint}</small>
      )}
    </article>
  );
}

function GeneratedSceneCanvas({
  lesson,
  intensity,
  activeId,
  onActivateTarget
}: {
  lesson: CleanLesson;
  intensity: number;
  activeId?: string;
  onActivateTarget: (targetId: string) => void;
}) {
  const elements = lesson.scene.elements;
  const byId = useMemo(() => new Map(elements.map((element) => [element.id, element])), [elements]);
  const sorted = useMemo(
    () =>
      [...elements].sort((a, b) => {
        const order = ["region", "surface", "path", "axis", "link", "curve", "vector", "particle", "node", "formula", "annotation"];
        return order.indexOf(a.type) - order.indexOf(b.type);
      }),
    [elements]
  );

  return (
    <>
      <div
        className={`simulation-canvas generated-canvas scene-${lesson.scene.background}`}
        style={{ "--lesson-intensity": intensity } as CSSProperties}
      >
        <svg viewBox="0 0 100 100" role="img" aria-label={`${lesson.topic} generated visual model`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="sceneNodeGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#9cc7ff" stopOpacity="0.58" />
            </radialGradient>
            <linearGradient id="sceneLineGlow" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#8dc2ff" stopOpacity="0.68" />
            </linearGradient>
            <marker id="sceneArrow" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="scene-arrow" />
            </marker>
          </defs>
          <BackgroundGrid background={lesson.scene.background} />
          {sorted.map((element) => (
            <SceneElement key={element.id} element={element} byId={byId} active={element.id === activeId} />
          ))}
        </svg>
      </div>
      <div className="generated-callouts">
        {lesson.scene.callouts.slice(0, 4).map((callout) => (
          <button
            type="button"
            className={callout.targetId === activeId ? "active" : ""}
            key={`${callout.title}-${callout.targetId}`}
            data-target-id={callout.targetId}
            onClick={() => callout.targetId && onActivateTarget(callout.targetId)}
          >
            <strong>{callout.title}</strong>
            <span>{callout.body}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function BackgroundGrid({ background }: { background: CleanLesson["scene"]["background"] }) {
  if (background === "contour") {
    return (
      <>
        <line x1="8" y1="50" x2="92" y2="50" className="scene-axis" />
        <line x1="50" y1="8" x2="50" y2="92" className="scene-axis" />
        <text x="88" y="47" className="scene-mini-text">
          Re
        </text>
        <text x="53" y="13" className="scene-mini-text">
          Im
        </text>
      </>
    );
  }

  if (background === "timeline") {
    return <path d="M10 50 H90" className="scene-axis strong" />;
  }

  if (background === "space") {
    return (
      <>
        <circle cx="21" cy="18" r="0.8" className="scene-star" />
        <circle cx="76" cy="19" r="0.6" className="scene-star" />
        <circle cx="84" cy="68" r="0.7" className="scene-star" />
        <circle cx="18" cy="76" r="0.5" className="scene-star" />
      </>
    );
  }

  return null;
}

function SceneElement({
  element,
  byId,
  active
}: {
  element: LessonVisualElement;
  byId: Map<string, LessonVisualElement>;
  active: boolean;
}) {
  const className = `scene-element scene-${element.type} ${active ? "active" : ""}`;
  const x = element.x ?? 50;
  const y = element.y ?? 50;
  const emphasis = element.emphasis ?? 0.5;

  if (element.type === "axis") {
    return (
      <g className={className}>
        <line x1="10" y1="82" x2="90" y2="82" />
        <line x1="14" y1="88" x2="14" y2="12" />
        {element.label ? <text x="18" y="15">{element.label}</text> : null}
      </g>
    );
  }

  if (element.type === "region") {
    return (
      <g className={className} style={{ opacity: 0.24 + emphasis * 0.55 }}>
        <rect x={x} y={y} width={element.width ?? 18} height={element.height ?? 14} rx="5" />
        <ElementLabel element={element} x={x + (element.width ?? 18) / 2} y={y + 5} />
      </g>
    );
  }

  if (element.type === "surface" || element.type === "path") {
    return (
      <g className={className}>
        <path d={element.d ?? "M12 50 C30 20 70 20 88 50"} />
        <ElementLabel element={element} x={x} y={y} />
      </g>
    );
  }

  if (element.type === "curve") {
    return (
      <g className={className}>
        <path d={pointsToPath(element.points)} />
        <ElementLabel element={element} x={element.points?.[Math.floor((element.points?.length ?? 1) / 2)]?.x ?? x} y={(element.points?.[1]?.y ?? y) - 5} />
      </g>
    );
  }

  if (element.type === "vector") {
    const x2 = element.x2 ?? x + 12;
    const y2 = element.y2 ?? y - 12;
    return (
      <g className={className}>
        <line x1={x} y1={y} x2={x2} y2={y2} markerEnd="url(#sceneArrow)" />
        <ElementLabel element={element} x={(x + x2) / 2 + 3} y={(y + y2) / 2 - 3} />
      </g>
    );
  }

  if (element.type === "link") {
    const from = element.from ? byId.get(element.from) : undefined;
    const to = element.to ? byId.get(element.to) : undefined;
    if (!from || !to) return null;

    return (
      <g className={className}>
        <line x1={from.x ?? 50} y1={from.y ?? 50} x2={to.x ?? 50} y2={to.y ?? 50} />
        <ElementLabel element={element} x={((from.x ?? 50) + (to.x ?? 50)) / 2} y={((from.y ?? 50) + (to.y ?? 50)) / 2 - 2} />
      </g>
    );
  }

  if (element.type === "particle") {
    return (
      <g className={className}>
        <circle cx={x} cy={y} r={2.1 + emphasis * 2.2} />
        <circle cx={x} cy={y} r={6 + emphasis * 4} className="scene-pulse-ring" />
        <ElementLabel element={element} x={x + 7} y={y - 5} />
      </g>
    );
  }

  if (element.type === "node") {
    const width = Math.max(14, Math.min(30, (element.label?.length ?? 8) * 1.25));
    return (
      <g className={className}>
        <rect x={x - width / 2} y={y - 5.5} width={width} height="11" rx="4" />
        <text x={x} y={y + 1.2} textAnchor="middle">
          {element.label}
        </text>
      </g>
    );
  }

  if (element.type === "formula") {
    return (
      <g className={className}>
        <rect x={Math.max(4, x - 28)} y={y - 7} width="56" height="14" rx="4" />
        <text x={x} y={y + 1.5} textAnchor="middle">
          {element.latex || element.label}
        </text>
      </g>
    );
  }

  return (
    <g className={className}>
      <circle cx={x} cy={y} r="3" />
      <ElementLabel element={element} x={x + 5} y={y - 4} />
    </g>
  );
}

function ElementLabel({ element, x, y }: { element: LessonVisualElement; x: number; y: number }) {
  if (!element.label) return null;
  return (
    <text x={x} y={y} className="scene-label">
      {element.label}
    </text>
  );
}

function pointsToPath(points?: { x: number; y: number }[]) {
  if (!points?.length) return "M12 76 C28 62 38 28 52 44 S76 62 90 18";
  if (points.length < 3) return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

  let path = `M${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q${current.x} ${current.y} ${midX} ${midY}`;
  }

  const last = points[points.length - 1];
  return `${path} T${last.x} ${last.y}`;
}
