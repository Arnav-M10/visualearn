export type LessonSource = {
  title: string;
  extract: string;
  url: string;
};

export type SimulationKind =
  | "graph"
  | "flow"
  | "orbit"
  | "network"
  | "timeline"
  | "particles"
  | "balance"
  | "system";

export type LessonControl = {
  label: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
  effect: string;
};

export type LessonNode = {
  label: string;
  detail: string;
  weight: number;
};

export type LessonQuestion = {
  question: string;
  choices: string[];
  answer: string;
  hint: string;
};

export type LessonCheckpoint = {
  title: string;
  microLesson: string;
  visualCue: string;
  question: LessonQuestion;
};

export type CleanLesson = {
  topic: string;
  subject: string;
  confidence: "ai-generated" | "source-backed" | "ungrounded";
  sources: LessonSource[];
  summary: string;
  simulation: {
    kind: SimulationKind;
    title: string;
    thesis: string;
    controls: LessonControl[];
    nodes: LessonNode[];
    xLabel: string;
    yLabel: string;
  };
  checkpoints: LessonCheckpoint[];
  practice: LessonQuestion[];
  followUps: string[];
};

const simulationKinds: SimulationKind[] = [
  "graph",
  "flow",
  "orbit",
  "network",
  "timeline",
  "particles",
  "balance",
  "system"
];

function normalizeTopic(topicInput: string) {
  return topicInput.trim().replace(/\s+/g, " ") || "black holes";
}

function inferSubject(topic: string, sourceText = "") {
  const value = `${topic} ${sourceText}`.toLowerCase();

  if (/(derivative|integral|matrix|vector|equation|graph|calculus|algebra|geometry|probability|statistics|slope|function|theorem|proof)/.test(value)) return "Math";
  if (/(gravity|motion|wave|quantum|force|energy|relativity|electric|magnet|momentum|velocity|mass|particle|field)/.test(value)) return "Physics";
  if (/(revolution|empire|war|history|civilization|treaty|dynasty|colonial|ancient|medieval|state|political)/.test(value)) return "History";
  if (/(dna|cell|biology|organ|ecosystem|protein|evolution|gene|mitosis|photosynthesis|enzyme|organism|species)/.test(value)) return "Biology";
  if (/(algorithm|code|recursion|sorting|computer|programming|data|binary|network|database|software|model|neural)/.test(value)) return "Computer Science";
  if (/(market|supply|demand|economics|inflation|trade|money|price|finance|interest|capital|labor)/.test(value)) return "Economics";
  if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base|electron|compound|ion)/.test(value)) return "Chemistry";
  if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit|telescope|supernova|universe)/.test(value)) return "Astronomy";
  if (/(philosophy|ethics|logic|argument|consciousness|meaning|truth|justice|knowledge|moral)/.test(value)) return "Philosophy";

  return "General";
}

function chooseSimulationKind(subject: string, topic: string): SimulationKind {
  const value = `${subject} ${topic}`.toLowerCase();
  if (/(math|economics|derivative|function|supply|demand|rate|price|graph)/.test(value)) return "graph";
  if (/(history|timeline|revolution|war|era|period)/.test(value)) return "timeline";
  if (/(astronomy|orbit|gravity|planet|star|black hole)/.test(value)) return "orbit";
  if (/(computer|network|neural|algorithm|data|philosophy|argument)/.test(value)) return "network";
  if (/(chemistry|particle|quantum|molecule|atom|reaction)/.test(value)) return "particles";
  if (/(biology|cell|ecosystem|photosynthesis|process|cycle)/.test(value)) return "flow";
  return "system";
}

function compact(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function getSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&quot;/g, "\"").replace(/&#039;/g, "'");
}

function extractTerms(text: string, topic: string) {
  const stopwords = new Set([
    "about",
    "after",
    "also",
    "being",
    "between",
    "called",
    "could",
    "first",
    "from",
    "have",
    "into",
    "more",
    "most",
    "other",
    "their",
    "there",
    "these",
    "through",
    "which",
    "while",
    "with"
  ]);
  const topicWords = new Set(topic.toLowerCase().split(/\W+/).filter(Boolean));
  const seen = new Set<string>();

  return text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => {
      const normalized = word.toLowerCase();
      if (normalized.length < 5) return false;
      if (stopwords.has(normalized) || topicWords.has(normalized) || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, 6);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Visualearn lesson generator"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchTopicSources(topicInput: string): Promise<LessonSource[]> {
  const topic = normalizeTopic(topicInput);
  const search = await fetchJson<{
    query?: { search?: { title?: string; snippet?: string }[] };
  }>(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`
  );
  const titles =
    search?.query?.search
      ?.map((item) => item.title)
      .filter((title): title is string => Boolean(title))
      .slice(0, 3) ?? [topic];

  const summaries = await Promise.all(
    titles.map(async (title) => {
      const summary = await fetchJson<{
        title?: string;
        extract?: string;
        content_urls?: { desktop?: { page?: string } };
        type?: string;
      }>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);

      if (!summary?.extract || summary.type === "disambiguation") return null;
      return {
        title: summary.title ?? title,
        extract: summary.extract,
        url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      };
    })
  );

  const sources = summaries.filter((source): source is LessonSource => Boolean(source));

  if (sources.length > 0) return sources;

  const fallbackSummary = await fetchJson<{
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    type?: string;
  }>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);

  if (!fallbackSummary?.extract || fallbackSummary.type === "disambiguation") return [];

  return [
    {
      title: fallbackSummary.title ?? topic,
      extract: fallbackSummary.extract,
      url: fallbackSummary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`
    }
  ];
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

function sanitizeLesson(value: Partial<CleanLesson>, topic: string, sources: LessonSource[]): CleanLesson {
  const sourceText = sources.map((source) => source.extract).join(" ");
  const subject = typeof value.subject === "string" && value.subject.trim() ? value.subject.trim() : inferSubject(topic, sourceText);
  const kind = simulationKinds.includes(value.simulation?.kind as SimulationKind)
    ? (value.simulation?.kind as SimulationKind)
    : chooseSimulationKind(subject, topic);
  const terms = extractTerms(`${topic} ${sourceText}`, topic);
  const nodes = Array.isArray(value.simulation?.nodes) && value.simulation.nodes.length >= 3
    ? value.simulation.nodes
    : buildFallbackNodes(topic, terms, sourceText);
  const controls = Array.isArray(value.simulation?.controls) && value.simulation.controls.length > 0
    ? value.simulation.controls
    : buildFallbackControls(subject);
  const checkpoints = Array.isArray(value.checkpoints) && value.checkpoints.length >= 3
    ? value.checkpoints
    : buildFallbackCheckpoints(topic, sourceText, terms);
  const practice = Array.isArray(value.practice) && value.practice.length >= 3
    ? value.practice
    : buildFallbackPractice(topic, terms);

  return {
    topic: typeof value.topic === "string" && value.topic.trim() ? value.topic.trim() : topic,
    subject,
    confidence: value.confidence === "ai-generated" ? "ai-generated" : sources.length > 0 ? "source-backed" : "ungrounded",
    sources,
    summary:
      typeof value.summary === "string" && value.summary.trim()
        ? compact(value.summary, 210)
        : compact(getSentences(sourceText).slice(0, 2).join(" ") || `Visualearn could not find a strong source for ${topic}, so this lesson stays conceptual and asks you to verify details before going deep.`, 210),
    simulation: {
      kind,
      title:
        typeof value.simulation?.title === "string" && value.simulation.title.trim()
          ? value.simulation.title.trim()
          : `${topic} as a live model`,
      thesis:
        typeof value.simulation?.thesis === "string" && value.simulation.thesis.trim()
          ? compact(value.simulation.thesis, 160)
          : `Move one variable and watch how the important relationship in ${topic} changes.`,
      xLabel:
        typeof value.simulation?.xLabel === "string" && value.simulation.xLabel.trim()
          ? value.simulation.xLabel.trim()
          : "input",
      yLabel:
        typeof value.simulation?.yLabel === "string" && value.simulation.yLabel.trim()
          ? value.simulation.yLabel.trim()
          : "response",
      nodes: nodes.slice(0, 6).map((node, index) => ({
        label: compact(String(node.label || terms[index] || `part ${index + 1}`), 28),
        detail: compact(String(node.detail || `A key piece of ${topic}.`), 110),
        weight: safeNumber(node.weight, 55 + index * 7, 10, 100)
      })),
      controls: controls.slice(0, 3).map((control, index) => ({
        label: compact(String(control.label || `variable ${index + 1}`), 26),
        min: safeNumber(control.min, 0, -100, 100),
        max: safeNumber(control.max, 100, -100, 200),
        value: safeNumber(control.value, 50, -100, 200),
        unit: typeof control.unit === "string" ? compact(control.unit, 8) : "",
        effect: compact(String(control.effect || "Changes the model response."), 90)
      }))
    },
    checkpoints: checkpoints.slice(0, 4).map((checkpoint, index) => ({
      title: compact(String(checkpoint.title || `Checkpoint ${index + 1}`), 40),
      microLesson: compact(String(checkpoint.microLesson || `Notice one important relationship in ${topic}.`), 150),
      visualCue: compact(String(checkpoint.visualCue || "Watch the highlighted part of the model."), 90),
      question: sanitizeQuestion(checkpoint.question, topic, terms, index)
    })),
    practice: practice.slice(0, 5).map((question, index) => sanitizeQuestion(question, topic, terms, index)),
    followUps:
      Array.isArray(value.followUps) && value.followUps.length >= 3
        ? value.followUps.slice(0, 5).map((item) => compact(String(item), 80))
        : [
            `Show ${topic} with a different simulation`,
            `Quiz me harder on ${topic}`,
            `Give me sources to go deeper on ${topic}`
          ]
  };
}

function sanitizeQuestion(question: Partial<LessonQuestion> | undefined, topic: string, terms: string[], index: number): LessonQuestion {
  const fallbackChoices = ["It increases", "It decreases", "It changes shape", "It depends on the context"];
  const choices = Array.isArray(question?.choices) && question.choices.length >= 3
    ? question.choices.slice(0, 4).map((choice) => compact(String(choice), 70))
    : fallbackChoices;

  return {
    question:
      typeof question?.question === "string" && question.question.trim()
        ? compact(question.question, 120)
        : `What changes first in ${topic} when ${terms[index] ?? "the main input"} changes?`,
    choices,
    answer:
      typeof question?.answer === "string" && question.answer.trim()
        ? compact(question.answer, 90)
        : choices[choices.length - 1],
    hint:
      typeof question?.hint === "string" && question.hint.trim()
        ? compact(question.hint, 120)
        : "Use the simulation: change one control and watch the first visible response."
  };
}

function buildFallbackNodes(topic: string, terms: string[], sourceText: string): LessonNode[] {
  const sentences = getSentences(sourceText);
  const labels = terms.length >= 4 ? terms : ["Input", "Mechanism", "Constraint", "Output"];

  return labels.slice(0, 6).map((label, index) => ({
    label,
    detail: compact(sentences[index] ?? `${label} is one part of the model for ${topic}.`, 105),
    weight: 44 + index * 9
  }));
}

function buildFallbackControls(subject: string): LessonControl[] {
  const label = /(Math|Physics|Economics)/.test(subject) ? "input strength" : "focus";
  return [
    {
      label,
      min: 0,
      max: 100,
      value: 54,
      unit: "%",
      effect: "Changes the main response in the visual model."
    },
    {
      label: "complexity",
      min: 0,
      max: 100,
      value: 36,
      unit: "%",
      effect: "Adds more interacting parts to the simulation."
    }
  ];
}

function buildFallbackCheckpoints(topic: string, sourceText: string, terms: string[]): LessonCheckpoint[] {
  const sentences = getSentences(sourceText);
  return [0, 1, 2].map((index) => ({
    title: ["See the system", "Move one variable", "Explain the change"][index],
    microLesson: compact(sentences[index] ?? `Use the model to identify what matters in ${topic}.`, 150),
    visualCue: `Watch ${terms[index] ?? "the highlighted node"} as the simulation changes.`,
    question: sanitizeQuestion(undefined, topic, terms, index)
  }));
}

function buildFallbackPractice(topic: string, terms: string[]): LessonQuestion[] {
  return [0, 1, 2].map((index) =>
    sanitizeQuestion(
      {
        question: `Which part of ${topic} would you change to test ${terms[index] ?? "the main relationship"}?`,
        choices: ["The input", "The constraint", "The output", "The label only"],
        answer: index === 2 ? "The output" : "The input",
        hint: "A good test changes something causal, not just the name."
      },
      topic,
      terms,
      index
    )
  );
}

function lessonPrompt(topic: string, sources: LessonSource[]) {
  const sourceBlock = sources.length
    ? sources
        .map((source, index) => `SOURCE ${index + 1}: ${source.title}\nURL: ${source.url}\nSUMMARY: ${source.extract}`)
        .join("\n\n")
    : "No reliable source summary was found. Be explicit about uncertainty and keep claims general.";

  return `Generate a visual-first lesson for: ${topic}

Use the sources below as grounding. Do not invent unsupported factual claims. Keep text short.

${sourceBlock}

Return ONLY JSON with this shape:
{
  "topic": string,
  "subject": string,
  "summary": "one short factual setup, max 35 words",
  "simulation": {
    "kind": "graph|flow|orbit|network|timeline|particles|balance|system",
    "title": string,
    "thesis": "what the learner should see by moving the simulation, max 25 words",
    "xLabel": string,
    "yLabel": string,
    "controls": [
      {"label": string, "min": number, "max": number, "value": number, "unit": string, "effect": string}
    ],
    "nodes": [
      {"label": string, "detail": "max 18 words", "weight": number}
    ]
  },
  "checkpoints": [
    {
      "title": string,
      "microLesson": "max 22 words",
      "visualCue": "what to inspect in the simulation, max 16 words",
      "question": {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
    }
  ],
  "practice": [
    {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
  ],
  "followUps": [string,string,string,string]
}

Requirements:
- No paragraph walls.
- At least 4 simulation nodes.
- At least 2 controls.
- At least 3 checkpoints.
- At least 4 practice questions.
- Questions should test causality, misconceptions, visual reading, and transfer.`;
}

async function generateWithOpenAI(topic: string, sources: LessonSource[]): Promise<Partial<CleanLesson> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are Visualearn's lesson generator. Create concise, source-grounded, simulation-first lessons for any topic. Return valid JSON only."
          },
          {
            role: "user",
            content: lessonPrompt(topic, sources)
          }
        ],
        text: {
          format: {
            type: "json_object"
          }
        }
      }),
      cache: "no-store"
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      output_text?: string;
      output?: { content?: { text?: string }[] }[];
    };
    const text =
      data.output_text ??
      data.output
        ?.flatMap((item) => item.content ?? [])
        .map((content) => content.text)
        .find(Boolean);

    if (!text) return null;
    return JSON.parse(text) as Partial<CleanLesson>;
  } catch {
    return null;
  }
}

export async function composeCleanLesson(topicInput: string): Promise<CleanLesson> {
  const topic = normalizeTopic(topicInput);
  const sources = await fetchTopicSources(topic);
  const generated = await generateWithOpenAI(topic, sources);

  return sanitizeLesson(
    {
      ...generated,
      confidence: generated ? "ai-generated" : sources.length > 0 ? "source-backed" : "ungrounded"
    },
    topic,
    sources
  );
}
