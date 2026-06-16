"use client";

import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { CleanLesson, LessonActivity, LessonQuestion, LessonVisualBinding, LessonVisualElement } from "@/lib/visualearn-lessons";

type LessonExperienceProps = {
  lesson: CleanLesson;
};

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const [controlValues, setControlValues] = useState(() =>
    Object.fromEntries(lesson.scene.controls.map((control) => [control.label, control.value]))
  );
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [activeTargetId, setActiveTargetId] = useState<string | undefined>();
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const activities = lesson.activities.length
    ? lesson.activities
    : lesson.blocks.map((block) => ({
        kind: "observe" as const,
        title: block.title,
        prompt: block.body ?? lesson.scene.visualIntent,
        action: "Use the model, then continue.",
        targetId: block.targetId,
        reveal: block.question?.hint ?? block.body ?? lesson.scene.visualIntent,
        question: block.question
      }));
  const activeActivity = activities[activeActivityIndex] ?? activities[0];
  const activeId = selectedElementId ?? activeTargetId ?? activeActivity?.targetId ?? lesson.scene.callouts[0]?.targetId ?? lesson.scene.elements[0]?.id;
  const formatLabels = Array.from(new Set([lesson.format, lesson.scene.format].filter(Boolean)));
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
  const setControlValue = (label: string, value: number) => {
    setControlValues((current) => ({
      ...current,
      [label]: value
    }));
  };

  return (
    <div className="lesson-experience">
      <section className="lesson-stage lesson-stage-generated" aria-labelledby="lesson-stage-title">
        <div className="lesson-stage-copy">
          <p className="result-eyebrow">{lesson.subject} / {lesson.confidence.replace("-", " ")}</p>
          <h1 id="lesson-stage-title">{lesson.topic}</h1>
          <p>{lesson.scene.visualIntent}</p>
          <div className="format-chip-row" aria-label="Generated lesson format">
            {formatLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          {activeActivity ? (
            <ActiveActivityCard
              activity={activeActivity}
              index={activeActivityIndex}
              total={activities.length}
              selected={answers[`activity-${activeActivityIndex}`]}
              onAnswer={(value) => setAnswers((current) => ({ ...current, [`activity-${activeActivityIndex}`]: value }))}
              onStep={(index) => {
                setActiveActivityIndex(index);
                setActiveTargetId(activities[index]?.targetId);
                setSelectedElementId(undefined);
              }}
              onBack={() => {
                const nextIndex = Math.max(0, activeActivityIndex - 1);
                setActiveActivityIndex(nextIndex);
                setActiveTargetId(activities[nextIndex]?.targetId);
                setSelectedElementId(undefined);
              }}
              onNext={() => {
                const nextIndex = Math.min(activities.length - 1, activeActivityIndex + 1);
                setActiveActivityIndex(nextIndex);
                setActiveTargetId(activities[nextIndex]?.targetId);
                setSelectedElementId(undefined);
              }}
            />
          ) : null}
        </div>

        <div className="simulation-shell generated-shell">
          <div className="simulation-topline">
            <div>
              <span>{lesson.scene.background} scene</span>
              <strong>{lesson.scene.title}</strong>
            </div>
            <p>{lesson.scene.visualIntent}</p>
          </div>

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
                  onInput={(event) => setControlValue(control.label, Number(event.currentTarget.value))}
                  onChange={(event) => setControlValue(control.label, Number(event.currentTarget.value))}
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

          <GeneratedSceneCanvas
            lesson={lesson}
            intensity={intensity}
            activeId={activeId}
            controlValues={controlValues}
            onActivateTarget={(targetId) => {
              setActiveTargetId(targetId);
              setSelectedElementId(targetId);
              const nextIndex = activities.findIndex((activity) => activity.targetId === targetId);
              if (nextIndex >= 0) setActiveActivityIndex(nextIndex);
            }}
          />
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

function ActiveActivityCard({
  activity,
  index,
  total,
  selected,
  onAnswer,
  onStep,
  onBack,
  onNext
}: {
  activity: LessonActivity;
  index: number;
  total: number;
  selected?: string;
  onAnswer: (value: string) => void;
  onStep: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const showReveal = activity.kind === "reveal" || (activity.question ? Boolean(selected) : false);
  const canGoBack = index > 0;
  const canGoNext = index < total - 1;

  return (
    <article className="activity-card" data-target-id={activity.targetId}>
      <div className="activity-progress" aria-label="Lesson progress">
        {Array.from({ length: total }).map((_, stepIndex) => (
          <button
            type="button"
            key={stepIndex}
            className={stepIndex === index ? "active" : ""}
            onClick={() => onStep(stepIndex)}
            aria-label={`Go to step ${stepIndex + 1}`}
          />
        ))}
      </div>
      <div className="activity-kicker">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{activity.kind}</strong>
      </div>
      <div className="activity-copy">
        <h2>{activity.title}</h2>
        <p>{activity.prompt}</p>
        {activity.action ? <small>{activity.action}</small> : null}
      </div>
      {activity.question ? (
        <QuestionCard question={activity.question} id={`activity-${index}`} selected={selected} onAnswer={onAnswer} compact />
      ) : null}
      <div className={`activity-reveal ${showReveal ? "visible" : ""}`}>
        <strong>{activity.question ? "Reveal" : "What to notice"}</strong>
        <p>{activity.reveal}</p>
      </div>
      <div className="activity-actions">
        <button type="button" onClick={onBack} disabled={!canGoBack}>
          Back
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext}>
          {canGoNext ? "Continue" : "Finish"}
        </button>
      </div>
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
  controlValues,
  onActivateTarget
}: {
  lesson: CleanLesson;
  intensity: number;
  activeId?: string;
  controlValues: Record<string, number>;
  onActivateTarget: (targetId: string) => void;
}) {
  const elements = lesson.scene.elements;
  const byId = useMemo(() => new Map(elements.map((element) => [element.id, element])), [elements]);
  const controlState = useMemo(() => getControlState(lesson, controlValues), [lesson, controlValues]);
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
            <SceneElement
              key={element.id}
              element={element}
              byId={byId}
              active={element.id === activeId}
              controlState={controlState}
              onSelect={onActivateTarget}
            />
          ))}
        </svg>
        <div className="scene-active-caption">
          <span>{elements.find((element) => element.id === activeId)?.label ?? lesson.scene.title}</span>
          <strong>{elements.find((element) => element.id === activeId)?.detail ?? elements.find((element) => element.id === activeId)?.latex ?? "Click a part of the model or move a slider to test the idea."}</strong>
        </div>
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
  active,
  controlState,
  onSelect
}: {
  element: LessonVisualElement;
  byId: Map<string, LessonVisualElement>;
  active: boolean;
  controlState: ControlState;
  onSelect: (targetId: string) => void;
}) {
  const className = `scene-element scene-${element.type} ${active ? "active" : ""}`;
  const adjusted = adjustElement(element, controlState);
  const x = adjusted.x ?? 50;
  const y = adjusted.y ?? 50;
  const emphasis = element.emphasis ?? 0.5;
  const interactiveProps = {
    className,
    style: {
      opacity: adjusted.opacity,
      transformOrigin: adjusted.transformOrigin ?? "50px 50px",
      transform: adjusted.transform
    } as CSSProperties,
    role: "button",
    tabIndex: 0,
    onClick: () => onSelect(element.id),
    onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") onSelect(element.id);
    }
  };

  if (element.type === "axis") {
    return (
      <g {...interactiveProps}>
        <line x1="10" y1="82" x2="90" y2="82" />
        <line x1="14" y1="88" x2="14" y2="12" />
        {active && element.label ? <text x="18" y="15">{element.label}</text> : null}
      </g>
    );
  }

  if (element.type === "region") {
    return (
      <g {...interactiveProps} style={{ ...interactiveProps.style, opacity: adjusted.opacity ?? 0.24 + emphasis * 0.55 }}>
        <rect x={x} y={y} width={adjusted.width ?? element.width ?? 18} height={adjusted.height ?? element.height ?? 14} rx="5" />
        <ElementLabel element={element} x={x + (element.width ?? 18) / 2} y={y + 5} active={active} />
      </g>
    );
  }

  if (element.type === "surface" || element.type === "path") {
    return (
      <g {...interactiveProps}>
        <path d={adjusted.d ?? element.d ?? "M12 50 C30 20 70 20 88 50"} />
        <ElementLabel element={element} x={x} y={y} active={active} />
      </g>
    );
  }

  if (element.type === "curve") {
    return (
      <g {...interactiveProps}>
        <path d={pointsToPath(adjusted.points ?? element.points)} />
        <ElementLabel element={element} x={element.points?.[Math.floor((element.points?.length ?? 1) / 2)]?.x ?? x} y={(element.points?.[1]?.y ?? y) - 5} active={active} />
      </g>
    );
  }

  if (element.type === "vector") {
    const x2 = adjusted.x2 ?? element.x2 ?? x + 12;
    const y2 = adjusted.y2 ?? element.y2 ?? y - 12;
    return (
      <g {...interactiveProps}>
        <line x1={x} y1={y} x2={x2} y2={y2} markerEnd="url(#sceneArrow)" />
        <ElementLabel element={element} x={(x + x2) / 2 + 3} y={(y + y2) / 2 - 3} active={active} />
      </g>
    );
  }

  if (element.type === "link") {
    const from = element.from ? byId.get(element.from) : undefined;
    const to = element.to ? byId.get(element.to) : undefined;
    if (!from || !to) return null;

    return (
      <g {...interactiveProps}>
        <line x1={from.x ?? 50} y1={from.y ?? 50} x2={to.x ?? 50} y2={to.y ?? 50} />
        <ElementLabel element={element} x={((from.x ?? 50) + (to.x ?? 50)) / 2} y={((from.y ?? 50) + (to.y ?? 50)) / 2 - 2} active={active} />
      </g>
    );
  }

  if (element.type === "particle") {
    return (
      <g {...interactiveProps}>
        <circle cx={x} cy={y} r={2.1 + emphasis * 2.2} />
        <circle cx={x} cy={y} r={6 + emphasis * 4} className="scene-pulse-ring" />
        <ElementLabel element={element} x={x + 7} y={y - 5} active={active} />
      </g>
    );
  }

  if (element.type === "node") {
    const width = Math.max(14, Math.min(30, (element.label?.length ?? 8) * 1.25));
    return (
      <g {...interactiveProps}>
        <rect x={x - width / 2} y={y - 5.5} width={width} height="11" rx="4" />
        <text x={x} y={y + 1.2} textAnchor="middle" className={active ? "" : "scene-hidden-text"}>
          {element.label}
        </text>
      </g>
    );
  }

  if (element.type === "formula") {
    const formulaLabel = element.label || "formula";
    const width = Math.max(16, Math.min(30, formulaLabel.length * 1.2));
    return (
      <g {...interactiveProps}>
        <rect x={Math.max(4, x - width / 2)} y={y - 5.5} width={width} height="11" rx="4" />
        <text x={x} y={y + 1.2} textAnchor="middle" className={active ? "" : "scene-hidden-text"}>
          {formulaLabel}
        </text>
      </g>
    );
  }

  return (
    <g {...interactiveProps}>
      <circle cx={x} cy={y} r="3" />
      <ElementLabel element={element} x={x + 5} y={y - 4} active={active} />
    </g>
  );
}

function ElementLabel({ element, x, y, active }: { element: LessonVisualElement; x: number; y: number; active: boolean }) {
  if (["path", "surface", "region", "vector", "link"].includes(element.type)) return null;
  if (!element.label || !active) return null;
  return (
    <text x={x} y={y} className="scene-label">
      {element.label}
    </text>
  );
}

type ControlState = {
  primary: number;
  secondary: number;
  byLabel: Record<string, number>;
};

function getControlState(lesson: CleanLesson, values: Record<string, number>): ControlState {
  const byLabel: Record<string, number> = {};
  lesson.scene.controls.forEach((control) => {
    const value = values[control.label] ?? control.value;
    byLabel[control.label.toLowerCase()] = (value - control.min) / Math.max(1, control.max - control.min);
  });

  const normalized = Object.values(byLabel);
  return {
    primary: normalized[0] ?? 0.5,
    secondary: normalized[1] ?? normalized[0] ?? 0.5,
    byLabel
  };
}

function adjustElement(element: LessonVisualElement, controlState: ControlState): Partial<LessonVisualElement> & {
  opacity?: number;
  transform?: string;
  transformOrigin?: string;
} {
  const adjusted: Partial<LessonVisualElement> & { opacity?: number; transform?: string; transformOrigin?: string } = {
    x: element.x,
    y: element.y,
    x2: element.x2,
    y2: element.y2,
    width: element.width,
    height: element.height,
    points: element.points,
    d: element.d,
    opacity: 0.52 + (element.emphasis ?? 0.55) * 0.34
  };
  const transforms: string[] = [];
  const bindings = element.bindings?.length ? element.bindings : fallbackRuntimeBindings(element);

  bindings.forEach((binding, index) => {
    const raw = controlState.byLabel[binding.control.toLowerCase()] ?? (index % 2 === 0 ? controlState.primary : controlState.secondary);
    const normalized = binding.direction === "inverse" ? 1 - raw : raw;
    const centered = (normalized - 0.5) * 2;
    const amount = binding.amount;
    const delta = centered * amount;
    const pivotX = binding.pivotX ?? element.x ?? 50;
    const pivotY = binding.pivotY ?? element.y ?? 50;
    adjusted.transformOrigin = `${pivotX}px ${pivotY}px`;

    if (binding.property === "opacity") {
      adjusted.opacity = clamp((adjusted.opacity ?? 0.65) + delta, 0.08, 1);
    } else if (binding.property === "scale") {
      transforms.push(`scale(${clamp(1 + delta, 0.35, 2.2)})`);
    } else if (binding.property === "pathScale") {
      transforms.push(`scale(${clamp(1 + delta, 0.45, 2.1)})`);
    } else if (binding.property === "rotate") {
      transforms.push(`rotate(${delta}deg)`);
    } else if (binding.property === "translateX") {
      transforms.push(`translate(${delta}px, 0)`);
    } else if (binding.property === "translateY") {
      transforms.push(`translate(0, ${delta}px)`);
    } else if (binding.property === "pointX" && adjusted.points?.length) {
      adjusted.points = adjusted.points.map((point, pointIndex) => ({
        ...point,
        x: clamp(point.x + delta * ((pointIndex + 1) / adjusted.points!.length), 0, 100)
      }));
    } else if (binding.property === "pointY" && adjusted.points?.length) {
      adjusted.points = adjusted.points.map((point, pointIndex) => ({
        ...point,
        y: clamp(point.y + delta * Math.sin((pointIndex + 1) / adjusted.points!.length * Math.PI), 0, 100)
      }));
    } else {
      const key = binding.property as "x" | "y" | "x2" | "y2" | "width" | "height";
      adjusted[key] = clamp((adjusted[key] ?? fallbackCoordinate(element, key)) + delta, 0, 100);
    }
  });

  return {
    ...adjusted,
    transform: transforms.join(" ") || undefined
  };
}

function fallbackRuntimeBindings(element: LessonVisualElement): LessonVisualBinding[] {
  const control = "__primary";
  if (element.type === "curve") return [{ control, property: "pointY" as const, amount: 7, pivotX: 50, pivotY: 50 }];
  if (element.type === "vector") return [{ control, property: "rotate" as const, amount: 14, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
  if (element.type === "path" || element.type === "surface") return [{ control, property: "pathScale" as const, amount: 0.14, pivotX: 50, pivotY: 50 }];
  if (element.type === "region") return [{ control, property: "scale" as const, amount: 0.12, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
  return [{ control, property: "scale" as const, amount: 0.1, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
}

function fallbackCoordinate(element: LessonVisualElement, key: "x" | "y" | "x2" | "y2" | "width" | "height") {
  const fallback = {
    x: 50,
    y: 50,
    x2: (element.x ?? 50) + 12,
    y2: (element.y ?? 50) - 12,
    width: 18,
    height: 12
  };

  return fallback[key];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
