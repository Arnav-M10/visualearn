"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { CleanLesson, LessonQuestion } from "@/lib/visualearn-lessons";

type LessonExperienceProps = {
  lesson: CleanLesson;
};

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const [controlValues, setControlValues] = useState(() =>
    Object.fromEntries(lesson.simulation.controls.map((control) => [control.label, control.value]))
  );
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const intensity = useMemo(() => {
    const values = Object.values(controlValues);
    if (!values.length) return 0.5;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.max(0.08, Math.min(1, average / 100));
  }, [controlValues]);
  const active = lesson.checkpoints[activeCheckpoint] ?? lesson.checkpoints[0];
  const updateControl = (label: string, delta: number) => {
    const control = lesson.simulation.controls.find((item) => item.label === label);
    if (!control) return;

    setControlValues((current) => ({
      ...current,
      [label]: Math.min(control.max, Math.max(control.min, (current[label] ?? control.value) + delta))
    }));
  };

  return (
    <div className="lesson-experience">
      <section className="lesson-stage" aria-labelledby="lesson-stage-title">
        <div className="lesson-stage-copy">
          <p className="result-eyebrow">{lesson.subject} / {lesson.confidence.replace("-", " ")}</p>
          <h1 id="lesson-stage-title">{lesson.topic}</h1>
          <p>{lesson.summary}</p>
        </div>

        <div className="simulation-shell">
          <div className="simulation-topline">
            <div>
              <span>{lesson.simulation.kind}</span>
              <strong>{lesson.simulation.title}</strong>
            </div>
            <p>{lesson.simulation.thesis}</p>
          </div>

          <SimulationCanvas lesson={lesson} intensity={intensity} activeIndex={activeCheckpoint} />

          <div className="simulation-controls" aria-label="Simulation controls">
            {lesson.simulation.controls.map((control) => (
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

      <section className="lesson-checkpoint-shell" aria-label="Guided checkpoints">
        <div className="checkpoint-tabs">
          {lesson.checkpoints.map((checkpoint, index) => (
            <button
              type="button"
              className={index === activeCheckpoint ? "active" : ""}
              key={checkpoint.title}
              onClick={() => setActiveCheckpoint(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {checkpoint.title}
            </button>
          ))}
        </div>

        <article className="checkpoint-card">
          <div>
            <p className="result-eyebrow">Inspect</p>
            <h2>{active.title}</h2>
            <p>{active.microLesson}</p>
            <small>{active.visualCue}</small>
          </div>
          <QuestionCard
            question={active.question}
            id={`checkpoint-${activeCheckpoint}`}
            selected={answers[`checkpoint-${activeCheckpoint}`]}
            onAnswer={(value) => setAnswers((current) => ({ ...current, [`checkpoint-${activeCheckpoint}`]: value }))}
          />
        </article>
      </section>

      <section className="practice-grid" aria-label="Practice questions">
        <div className="practice-heading">
          <p className="result-eyebrow">Practice loop</p>
          <h2>Answer, reveal, keep moving.</h2>
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

function QuestionCard({
  question,
  id,
  selected,
  onAnswer
}: {
  question: LessonQuestion;
  id: string;
  selected?: string;
  onAnswer: (value: string) => void;
}) {
  const isAnswered = Boolean(selected);
  const correct = selected === question.answer;

  return (
    <article className={`question-card ${isAnswered ? (correct ? "correct" : "incorrect") : ""}`}>
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

function SimulationCanvas({
  lesson,
  intensity,
  activeIndex
}: {
  lesson: CleanLesson;
  intensity: number;
  activeIndex: number;
}) {
  const nodes = lesson.simulation.nodes;
  const kind = lesson.simulation.kind;

  return (
    <div className={`simulation-canvas simulation-${kind}`} style={{ "--lesson-intensity": intensity } as CSSProperties}>
      <svg viewBox="0 0 720 420" role="img" aria-label={`${lesson.topic} simulation`}>
        <defs>
          <linearGradient id="lessonGlow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#9cc7ff" stopOpacity="0.58" />
          </linearGradient>
        </defs>
        {kind === "graph" ? <GraphVisual intensity={intensity} /> : null}
        {kind === "timeline" ? <TimelineVisual nodes={nodes} activeIndex={activeIndex} /> : null}
        {kind === "orbit" ? <OrbitVisual nodes={nodes} intensity={intensity} /> : null}
        {kind === "particles" ? <ParticleVisual nodes={nodes} intensity={intensity} /> : null}
        {kind === "flow" || kind === "system" || kind === "balance" ? <FlowVisual nodes={nodes} activeIndex={activeIndex} /> : null}
        {kind === "network" ? <NetworkVisual nodes={nodes} activeIndex={activeIndex} /> : null}
      </svg>
      <div className="simulation-labels">
        {nodes.slice(0, 4).map((node, index) => (
          <span className={index === activeIndex ? "active" : ""} key={node.label}>
            <strong>{node.label}</strong>
            {node.detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function GraphVisual({ intensity }: { intensity: number }) {
  const end = 150 + intensity * 150;
  return (
    <>
      <path d="M80 340 H650 M92 60 V350" className="sim-axis" />
      <path d={`M92 318 C180 ${290 - end / 5}, 280 ${250 - end / 4}, 380 ${210 - end / 3} S560 ${170 - end / 5}, 642 ${92 + end / 8}`} className="sim-curve" />
      <circle cx={380} cy={210 - end / 3} r="13" className="sim-hotspot" />
      <line x1="298" y1={260 - end / 4} x2="470" y2={154 - end / 3} className="sim-tangent" />
    </>
  );
}

function TimelineVisual({ nodes, activeIndex }: { nodes: { label: string; weight: number }[]; activeIndex: number }) {
  return (
    <>
      <path d="M90 216 H630" className="sim-axis" />
      {nodes.slice(0, 5).map((node, index) => {
        const x = 110 + index * 128;
        const active = index === activeIndex;
        return (
          <g key={node.label}>
            <circle cx={x} cy="216" r={active ? 24 : 16} className={active ? "sim-hotspot" : "sim-node"} />
            <text x={x} y={active ? 170 : 180} textAnchor="middle" className="sim-text">
              {node.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function OrbitVisual({ nodes, intensity }: { nodes: { label: string; weight: number }[]; intensity: number }) {
  return (
    <>
      <circle cx="360" cy="210" r={42 + intensity * 16} className="sim-core" />
      {[0, 1, 2].map((index) => (
        <ellipse key={index} cx="360" cy="210" rx={115 + index * 58} ry={52 + index * 28} className="sim-orbit" transform={`rotate(${index * 58} 360 210)`} />
      ))}
      {nodes.slice(0, 4).map((node, index) => {
        const angle = (index / 4) * Math.PI * 2 + intensity;
        const x = 360 + Math.cos(angle) * (120 + index * 24);
        const y = 210 + Math.sin(angle) * (72 + index * 16);
        return <circle key={node.label} cx={x} cy={y} r={8 + index * 2} className="sim-hotspot" />;
      })}
    </>
  );
}

function ParticleVisual({ nodes, intensity }: { nodes: { label: string; weight: number }[]; intensity: number }) {
  return (
    <>
      {nodes.slice(0, 6).map((node, index) => {
        const x = 120 + ((index * 94 + node.weight * 3) % 470);
        const y = 92 + ((index * 71 + node.weight * 2) % 230);
        return (
          <g key={node.label}>
            <circle cx={x} cy={y} r={14 + intensity * 16} className={index % 2 ? "sim-node" : "sim-hotspot"} />
            <circle cx={x + 34} cy={y + 18} r={7 + intensity * 7} className="sim-node muted" />
          </g>
        );
      })}
    </>
  );
}

function FlowVisual({ nodes, activeIndex }: { nodes: { label: string; weight: number }[]; activeIndex: number }) {
  return (
    <>
      {nodes.slice(0, 5).map((node, index) => {
        const x = 88 + index * 124;
        const active = index === activeIndex;
        return (
          <g key={node.label}>
            {index < 4 ? <path d={`M${x + 62} 210 C${x + 88} 170, ${x + 104} 250, ${x + 124} 210`} className="sim-link" /> : null}
            <rect x={x} y={active ? 152 : 168} width="92" height={active ? 92 : 68} rx="22" className={active ? "sim-active-box" : "sim-box"} />
            <text x={x + 46} y={active ? 204 : 208} textAnchor="middle" className="sim-text">
              {node.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function NetworkVisual({ nodes, activeIndex }: { nodes: { label: string; weight: number }[]; activeIndex: number }) {
  const points = nodes.slice(0, 6).map((node, index) => ({
    node,
    x: 145 + ((index * 137) % 420),
    y: 88 + ((index * 91) % 245)
  }));

  return (
    <>
      {points.map((point, index) =>
        points.slice(index + 1).map((other) => (
          <line key={`${point.node.label}-${other.node.label}`} x1={point.x} y1={point.y} x2={other.x} y2={other.y} className="sim-link" />
        ))
      )}
      {points.map((point, index) => (
        <g key={point.node.label}>
          <circle cx={point.x} cy={point.y} r={index === activeIndex ? 30 : 21} className={index === activeIndex ? "sim-hotspot" : "sim-node"} />
          <text x={point.x} y={point.y + 48} textAnchor="middle" className="sim-text">
            {point.node.label}
          </text>
        </g>
      ))}
    </>
  );
}
