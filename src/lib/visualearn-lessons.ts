export type LessonSource = {
  title: string;
  extract: string;
  url: string;
};

export type LessonControl = {
  label: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
  effect: string;
};

export type LessonQuestion = {
  question: string;
  choices: string[];
  answer: string;
  hint: string;
};

export type LessonVisualBinding = {
  control: string;
  property:
    | "x"
    | "y"
    | "x2"
    | "y2"
    | "width"
    | "height"
    | "opacity"
    | "scale"
    | "rotate"
    | "translateX"
    | "translateY"
    | "pathScale"
    | "pointX"
    | "pointY";
  amount: number;
  pivotX?: number;
  pivotY?: number;
  direction?: "normal" | "inverse";
};

export type LessonVisualElement = {
  type:
    | "axis"
    | "curve"
    | "path"
    | "region"
    | "node"
    | "link"
    | "formula"
    | "vector"
    | "particle"
    | "surface"
    | "annotation";
  id: string;
  label?: string;
  detail?: string;
  from?: string;
  to?: string;
  d?: string;
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  latex?: string;
  emphasis?: number;
  bindings?: LessonVisualBinding[];
};

export type LessonStoryboardStep = {
  title: string;
  narration: string;
  targetIds: string[];
  camera?: {
    x: number;
    y: number;
    zoom: number;
  };
};

export type LessonScene = {
  title: string;
  format: string;
  visualIntent: string;
  background: "plane" | "contour" | "field" | "lab" | "timeline" | "space" | "none";
  controls: LessonControl[];
  elements: LessonVisualElement[];
  callouts: {
    title: string;
    body: string;
    targetId?: string;
  }[];
  storyboard: LessonStoryboardStep[];
};

export type LessonBlock = {
  kind: "visual" | "inspect" | "micro" | "question" | "challenge" | "source";
  title: string;
  body?: string;
  targetId?: string;
  question?: LessonQuestion;
};

export type LessonActivity = {
  kind: "observe" | "predict" | "manipulate" | "check" | "reveal" | "transfer";
  title: string;
  prompt: string;
  action?: string;
  targetId?: string;
  control?: string;
  reveal: string;
  question?: LessonQuestion;
};

export type CleanLesson = {
  topic: string;
  subject: string;
  confidence: "ai-generated" | "source-generated" | "needs-api" | "generation-failed";
  sources: LessonSource[];
  summary: string;
  format: string;
  scene: LessonScene;
  blocks: LessonBlock[];
  activities: LessonActivity[];
  practice: LessonQuestion[];
  followUps: string[];
  generationIssue?: string;
};

const visualTypes = new Set<LessonVisualElement["type"]>([
  "axis",
  "curve",
  "path",
  "region",
  "node",
  "link",
  "formula",
  "vector",
  "particle",
  "surface",
  "annotation"
]);

const backgrounds = new Set<LessonScene["background"]>(["plane", "contour", "field", "lab", "timeline", "space", "none"]);
const blockKinds = new Set<LessonBlock["kind"]>(["visual", "inspect", "micro", "question", "challenge", "source"]);
const activityKinds = new Set<LessonActivity["kind"]>(["observe", "predict", "manipulate", "check", "reveal", "transfer"]);
const bindingProperties = new Set<LessonVisualBinding["property"]>([
  "x",
  "y",
  "x2",
  "y2",
  "width",
  "height",
  "opacity",
  "scale",
  "rotate",
  "translateX",
  "translateY",
  "pathScale",
  "pointX",
  "pointY"
]);

function normalizeTopic(topicInput: string) {
  return topicInput.trim().replace(/\s+/g, " ") || "integrals";
}

function inferSubject(topic: string, sourceText = "") {
  const classify = (value: string) => {
    if (/(dna|cell|biology|organ|ecosystem|protein|evolution|gene|mitosis|photosynthesis|enzyme|organism|species)/.test(value)) return "Biology";
    if (/(integral|derivative|matrix|vector|equation|calculus|algebra|geometry|probability|statistics|theorem|proof|complex|series|limit|polynomial|trigonometry)/.test(value)) return "Math";
    if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base|electron|compound|ion)/.test(value)) return "Chemistry";
    if (/\b(gravity|motion|wave|quantum|force|relativity|electric|magnet|momentum|velocity|mass|particle)\b/.test(value)) return "Physics";
    if (/(algorithm|code|recursion|sorting|computer|programming|data|binary|network|database|software|neural)/.test(value)) return "Computer Science";
    if (/(market|supply|demand|economics|inflation|trade|money|price|finance|interest|capital|labor)/.test(value)) return "Economics";
    if (/(revolution|empire|war|history|civilization|treaty|dynasty|colonial|ancient|medieval|political)/.test(value)) return "History";
    if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit|telescope|supernova|universe)/.test(value)) return "Astronomy";
    return "General";
  };

  const topicSubject = classify(topic.toLowerCase());
  if (topicSubject !== "General") return topicSubject;

  const sourceSubject = classify(`${topic} ${sourceText}`.toLowerCase());
  if (sourceSubject !== "General") return sourceSubject;

  return "General";
}

function compact(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function sourceText(sources: LessonSource[]) {
  return sources.map((source) => `${source.title}. ${source.extract}`).join(" ");
}

function getSentences(text: string, max = 8) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 35 && sentence.length < 260)
    .slice(0, max);
}

function extractTerms(text: string, topic: string, max = 8) {
  const stopwords = new Set([
    "about",
    "after",
    "also",
    "because",
    "before",
    "between",
    "could",
    "every",
    "first",
    "from",
    "have",
    "into",
    "more",
    "most",
    "other",
    "over",
    "such",
    "than",
    "that",
    "their",
    "there",
    "these",
    "this",
    "through",
    "used",
    "uses",
    "when",
    "where",
    "which",
    "with",
    "would"
  ]);
  const topicWords = topic.toLowerCase().split(/\W+/).filter(Boolean);
  const counts = new Map<string, number>();

  for (const word of `${topic} ${text}`.toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []) {
    if (stopwords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + (topicWords.includes(word) ? 4 : 1));
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, max);
}

function hashText(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function rotateAnswer(question: Omit<LessonQuestion, "choices" | "answer"> & { choices: string[]; answer: string }, seed: string): LessonQuestion {
  const choices = [...question.choices];
  const shift = hashText(`${seed}:${question.question}`) % choices.length;
  const rotated = choices.slice(shift).concat(choices.slice(0, shift));

  return {
    ...question,
    choices: rotated,
    answer: question.answer
  };
}

function question(seed: string, value: LessonQuestion): LessonQuestion {
  return rotateAnswer(value, seed);
}

function extractPhrases(text: string, topic: string, max = 8) {
  const phrases = [
    ...topic.matchAll(/[A-Z]?[a-z]+(?:\s+[A-Z]?[a-z]+){1,3}/g),
    ...text.matchAll(/[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){1,4}/g)
  ]
    .map((match) => compact(match[0].replace(/\s+/g, " "), 34))
    .filter((phrase) => phrase.length > 5 && !/^(In|The|This|These|There|When|Where|Which)\b/.test(phrase));

  return Array.from(new Set(phrases)).slice(0, max);
}

function requestTimeout(ms: number) {
  return AbortSignal.timeout(ms);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "Visualearn lesson generator"
      },
      signal: requestTimeout(8000),
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
    query?: { search?: { title?: string }[] };
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

  return summaries.filter((source): source is LessonSource => Boolean(source));
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

function safeCoord(value: unknown, fallback: number) {
  return safeNumber(value, fallback, 0, 100);
}

function safeId(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim().replace(/[^\w-]/g, "-") : fallback;
}

function sanitizeQuestion(question: Partial<LessonQuestion> | undefined, topic: string, index: number): LessonQuestion {
  const fallbackChoices = [`A true statement about ${topic}`, "A common misconception", "An unrelated detail", "A decorative label"];
  const choices = Array.isArray(question?.choices) && question.choices.length >= 3
    ? question.choices.slice(0, 4).map((choice) => compact(String(choice), 96))
    : fallbackChoices;
  const rawAnswer = typeof question?.answer === "string" ? compact(question.answer, 96) : "";

  return {
    question:
      typeof question?.question === "string" && question.question.trim()
        ? compact(question.question, 180)
        : `Which statement correctly explains ${topic} at this step?`,
    choices,
    answer: rawAnswer && choices.includes(rawAnswer) ? rawAnswer : choices[0],
    hint:
      typeof question?.hint === "string" && question.hint.trim()
        ? compact(question.hint, 180)
        : index % 2 ? "Look for the invariant, not the animation." : "Name the concept before choosing."
  };
}

function sanitizeControl(control: Partial<LessonControl> | undefined, index: number): LessonControl {
  const min = safeNumber(control?.min, 0, -100, 100);
  const max = safeNumber(control?.max, 100, min + 1, 200);
  return {
    label: compact(String(control?.label || `control ${index + 1}`), 36),
    min,
    max,
    value: safeNumber(control?.value, 50, min, max),
    unit: typeof control?.unit === "string" ? compact(control.unit, 8) : "",
    effect: compact(String(control?.effect || "Changes one real quantity in this concept."), 130)
  };
}

function controlKey(value: string) {
  return value.toLowerCase().replace(/[^\w]+/g, " ").trim();
}

function sanitizeBinding(binding: Partial<LessonVisualBinding> | undefined, controls: LessonControl[], index: number): LessonVisualBinding | null {
  const fallbackControl = controls[index % Math.max(1, controls.length)]?.label;
  const rawControl = typeof binding?.control === "string" && binding.control.trim() ? binding.control : fallbackControl;
  if (!rawControl) return null;

  const matchedControl =
    controls.find((control) => controlKey(control.label) === controlKey(rawControl)) ??
    controls.find((control) => controlKey(control.label).includes(controlKey(rawControl)) || controlKey(rawControl).includes(controlKey(control.label)));

  const property = bindingProperties.has(binding?.property as LessonVisualBinding["property"])
    ? (binding?.property as LessonVisualBinding["property"])
    : "scale";

  return {
    control: matchedControl?.label ?? rawControl,
    property,
    amount: safeNumber(binding?.amount, 0.18, -80, 80),
    pivotX: binding?.pivotX === undefined ? 50 : safeCoord(binding.pivotX, 50),
    pivotY: binding?.pivotY === undefined ? 50 : safeCoord(binding.pivotY, 50),
    direction: binding?.direction === "inverse" ? "inverse" : "normal"
  };
}

function defaultBindingsForElement(element: LessonVisualElement, controls: LessonControl[], index: number): LessonVisualBinding[] {
  const control = controls[index % Math.max(1, controls.length)]?.label;
  if (!control) return [];

  if (element.type === "curve") return [{ control, property: "pointY", amount: 10, pivotX: 50, pivotY: 50 }];
  if (element.type === "path" || element.type === "surface") return [{ control, property: "pathScale", amount: 0.2, pivotX: 50, pivotY: 50 }];
  if (element.type === "region") return [{ control, property: "width", amount: 10, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
  if (element.type === "vector") return [{ control, property: "rotate", amount: 18, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
  if (element.type === "link") return [{ control, property: "opacity", amount: 0.35, pivotX: 50, pivotY: 50 }];

  return [{ control, property: index % 2 ? "translateX" : "translateY", amount: 7, pivotX: element.x ?? 50, pivotY: element.y ?? 50 }];
}

function sanitizeElement(element: Partial<LessonVisualElement>, controls: LessonControl[], index: number): LessonVisualElement {
  const type = visualTypes.has(element.type as LessonVisualElement["type"]) ? (element.type as LessonVisualElement["type"]) : "annotation";
  const sanitized: LessonVisualElement = {
    type,
    id: safeId(element.id, `${type}-${index}`),
    label: typeof element.label === "string" ? compact(element.label, 40) : undefined,
    detail: typeof element.detail === "string" ? compact(element.detail, 150) : undefined,
    from: typeof element.from === "string" ? safeId(element.from, "") : undefined,
    to: typeof element.to === "string" ? safeId(element.to, "") : undefined,
    d: typeof element.d === "string" ? compact(element.d, 420) : undefined,
    points: Array.isArray(element.points)
      ? element.points.slice(0, 18).map((point, pointIndex) => ({
          x: safeCoord(point.x, 12 + pointIndex * 5),
          y: safeCoord(point.y, 70 - pointIndex * 3)
        }))
      : undefined,
    x: element.x === undefined ? undefined : safeCoord(element.x, 50),
    y: element.y === undefined ? undefined : safeCoord(element.y, 50),
    x2: element.x2 === undefined ? undefined : safeCoord(element.x2, 62),
    y2: element.y2 === undefined ? undefined : safeCoord(element.y2, 38),
    width: element.width === undefined ? undefined : safeNumber(element.width, 18, 1, 100),
    height: element.height === undefined ? undefined : safeNumber(element.height, 12, 1, 100),
    latex: typeof element.latex === "string" ? compact(element.latex, 90) : undefined,
    emphasis: safeNumber(element.emphasis, 0.6, 0, 1)
  };
  const bindings = Array.isArray(element.bindings)
    ? element.bindings
        .slice(0, 6)
        .map((binding, bindingIndex) => sanitizeBinding(binding, controls, bindingIndex))
        .filter((binding): binding is LessonVisualBinding => Boolean(binding))
    : [];

  return {
    ...sanitized,
    bindings: bindings.length ? bindings : defaultBindingsForElement(sanitized, controls, index)
  };
}

function sanitizeScene(scene: Partial<LessonScene> | undefined, topic: string): LessonScene {
  const controls = Array.isArray(scene?.controls) && scene.controls.length >= 2
    ? scene.controls.slice(0, 5).map(sanitizeControl)
    : [];
  const elements = Array.isArray(scene?.elements) && scene.elements.length >= 6
    ? scene.elements.slice(0, 24).map((element, index) => sanitizeElement(element, controls, index))
    : [];
  const fallbackTarget = elements[0]?.id;

  return {
    title: compact(String(scene?.title || `${topic} generated simulator`), 76),
    format: compact(String(scene?.format || "fresh generated visual lesson"), 54),
    visualIntent: compact(String(scene?.visualIntent || `Discover ${topic} by manipulating the generated visual.`), 210),
    background: backgrounds.has(scene?.background as LessonScene["background"]) ? (scene?.background as LessonScene["background"]) : "field",
    controls,
    elements,
    callouts: Array.isArray(scene?.callouts)
      ? scene.callouts.slice(0, 6).map((callout, index) => ({
          title: compact(String(callout.title || `Moment ${index + 1}`), 48),
          body: compact(String(callout.body || "Use this visual element to reason about the concept."), 160),
          targetId: typeof callout.targetId === "string" ? safeId(callout.targetId, fallbackTarget ?? "") : elements[index]?.id
        }))
      : [],
    storyboard: Array.isArray(scene?.storyboard)
      ? scene.storyboard.slice(0, 8).map((step, index) => ({
          title: compact(String(step.title || `Animation beat ${index + 1}`), 56),
          narration: compact(String(step.narration || "A generated animation beat explains one conceptual change."), 190),
          targetIds: Array.isArray(step.targetIds) ? step.targetIds.slice(0, 5).map((id) => safeId(id, "")).filter(Boolean) : [],
          camera: step.camera
            ? {
                x: safeCoord(step.camera.x, 50),
                y: safeCoord(step.camera.y, 50),
                zoom: safeNumber(step.camera.zoom, 1, 0.5, 3)
              }
            : undefined
        }))
      : []
  };
}

function sanitizeActivity(activity: Partial<LessonActivity> | undefined, topic: string, index: number): LessonActivity {
  return {
    kind: activityKinds.has(activity?.kind as LessonActivity["kind"]) ? (activity?.kind as LessonActivity["kind"]) : index === 0 ? "observe" : "check",
    title: compact(String(activity?.title || `Step ${index + 1}`), 64),
    prompt: compact(String(activity?.prompt || `Reason about ${topic}, then answer before revealing.`), 210),
    action: typeof activity?.action === "string" ? compact(activity.action, 140) : "Predict first, then interact.",
    targetId: typeof activity?.targetId === "string" ? safeId(activity.targetId, "") : undefined,
    control: typeof activity?.control === "string" ? compact(activity.control, 36) : undefined,
    reveal: compact(String(activity?.reveal || "The reveal should connect the action to the concept."), 210),
    question: activity?.question ? sanitizeQuestion(activity.question, topic, index) : undefined
  };
}

function sanitizeBlock(block: Partial<LessonBlock> | undefined, topic: string, index: number): LessonBlock {
  return {
    kind: blockKinds.has(block?.kind as LessonBlock["kind"]) ? (block?.kind as LessonBlock["kind"]) : index % 2 ? "question" : "visual",
    title: compact(String(block?.title || `Move ${index + 1}`), 64),
    body: typeof block?.body === "string" ? compact(block.body, 210) : undefined,
    targetId: typeof block?.targetId === "string" ? safeId(block.targetId, "") : undefined,
    question: block?.question ? sanitizeQuestion(block.question, topic, index) : undefined
  };
}

function validateGeneratedLesson(lesson: CleanLesson) {
  return (
    lesson.scene.controls.length >= 2 &&
    lesson.scene.elements.length >= 6 &&
    lesson.activities.length >= 5 &&
    lesson.practice.length >= 3 &&
    lesson.scene.storyboard.length >= 3
  );
}

function sanitizeLesson(value: Partial<CleanLesson>, topic: string, sources: LessonSource[]): CleanLesson | null {
  const sourceText = sources.map((source) => source.extract).join(" ");
  const scene = sanitizeScene(value.scene, topic);
  const activities = Array.isArray(value.activities) ? value.activities.slice(0, 9).map((activity, index) => sanitizeActivity(activity, topic, index)) : [];
  const blocks = Array.isArray(value.blocks) ? value.blocks.slice(0, 9).map((block, index) => sanitizeBlock(block, topic, index)) : [];
  const practice = Array.isArray(value.practice) ? value.practice.slice(0, 8).map((question, index) => sanitizeQuestion(question, topic, index)) : [];
  const lesson: CleanLesson = {
    topic: typeof value.topic === "string" && value.topic.trim() ? compact(value.topic, 90) : topic,
    subject: typeof value.subject === "string" && value.subject.trim() ? compact(value.subject, 40) : inferSubject(topic, sourceText),
    confidence: "ai-generated",
    sources,
    summary: typeof value.summary === "string" ? compact(value.summary, 280) : "",
    format: compact(String(value.format || scene.format), 56),
    scene,
    blocks,
    activities,
    practice,
    followUps:
      Array.isArray(value.followUps) && value.followUps.length
        ? value.followUps.slice(0, 5).map((item) => compact(String(item), 100))
        : []
  };

  return validateGeneratedLesson(lesson) ? lesson : null;
}

function buildGenerationIssueLesson(topic: string, sources: LessonSource[], issue: CleanLesson["confidence"], message: string): CleanLesson {
  const subject = inferSubject(topic, sources.map((source) => source.extract).join(" "));
  return {
    topic,
    subject,
    confidence: issue,
    sources,
    summary: "Visualearn did not generate a lesson because serving a fake or templated lesson would be worse than pausing.",
    format: "generation required",
    generationIssue: message,
    scene: {
      title: "Fresh AI lesson required",
      format: "no cached template",
      visualIntent: "Add a model key so Visualearn can generate a unique interactive lesson for this exact query.",
      background: "none",
      controls: [],
      elements: [],
      callouts: [],
      storyboard: []
    },
    blocks: [],
    activities: [],
    practice: [],
    followUps: []
  };
}

function buildIntegralSourceScene(topic: string, sentences: string[]): LessonScene {
  return {
    title: "Accumulation from pieces",
    format: "source-compiled accumulation lab",
    visualIntent: "Build an integral by adding thin pieces, then watch the total stabilize as the pieces get finer.",
    background: "plane",
    controls: [
      {
        label: "slice count",
        min: 4,
        max: 80,
        value: 24,
        unit: "",
        effect: "Adds more, thinner rectangles so the sum approaches the curved area."
      },
      {
        label: "upper bound",
        min: 25,
        max: 92,
        value: 68,
        unit: "%",
        effect: "Moves the right endpoint and changes how much accumulation is included."
      }
    ],
    elements: [
      { type: "axis", id: "axes", label: "input and output axes", x: 12, y: 78, x2: 92, y2: 78, emphasis: 0.45 },
      {
        type: "curve",
        id: "curve",
        label: "changing quantity",
        detail: "The height of the graph is what each tiny slice contributes.",
        points: [
          { x: 14, y: 69 },
          { x: 24, y: 58 },
          { x: 34, y: 40 },
          { x: 45, y: 32 },
          { x: 55, y: 42 },
          { x: 68, y: 27 },
          { x: 82, y: 22 }
        ],
        emphasis: 0.92,
        bindings: [{ control: "upper bound", property: "pointX", amount: 7, pivotX: 50, pivotY: 50 }]
      },
      {
        type: "region",
        id: "area",
        label: "accumulated area",
        detail: "The integral collects all slice contributions across the interval.",
        x: 15,
        y: 32,
        width: 53,
        height: 46,
        emphasis: 0.86,
        bindings: [
          { control: "upper bound", property: "width", amount: 18, pivotX: 15, pivotY: 78 },
          { control: "slice count", property: "opacity", amount: 0.2, pivotX: 50, pivotY: 50 }
        ]
      },
      {
        type: "region",
        id: "slices",
        label: "Riemann slices",
        detail: "More slices make the rectangular estimate track the curve more closely.",
        x: 15,
        y: 35,
        width: 53,
        height: 43,
        emphasis: 0.72,
        bindings: [
          { control: "slice count", property: "scale", amount: 0.22, pivotX: 15, pivotY: 78 },
          { control: "upper bound", property: "width", amount: 18, pivotX: 15, pivotY: 78 }
        ]
      },
      {
        type: "node",
        id: "left-bound",
        label: "start a",
        detail: "Accumulation starts at the left endpoint.",
        x: 15,
        y: 82,
        emphasis: 0.66
      },
      {
        type: "node",
        id: "right-bound",
        label: "end b",
        detail: "Moving this endpoint changes the total area collected.",
        x: 68,
        y: 82,
        emphasis: 0.86,
        bindings: [{ control: "upper bound", property: "x", amount: 18, pivotX: 15, pivotY: 82 }]
      },
      {
        type: "vector",
        id: "accumulation-arrow",
        label: "add left to right",
        detail: "An integral is a total built across an interval, not a single local reading.",
        x: 22,
        y: 86,
        x2: 68,
        y2: 86,
        emphasis: 0.78,
        bindings: [{ control: "upper bound", property: "x2", amount: 18, pivotX: 22, pivotY: 86 }]
      },
      {
        type: "formula",
        id: "integral-symbol",
        label: "integral notation",
        latex: "\\int_a^b f(x)\\,dx",
        detail: "The notation means add tiny contributions f(x) dx from a to b.",
        x: 57,
        y: 18,
        emphasis: 0.9
      },
      {
        type: "annotation",
        id: "limit-note",
        label: "limit of sums",
        detail: sentences[0] ?? `${topic} is understood by turning many small contributions into one accumulated total.`,
        x: 69,
        y: 48,
        emphasis: 0.68,
        bindings: [{ control: "slice count", property: "translateY", amount: -6, pivotX: 69, pivotY: 48 }]
      }
    ],
    callouts: [
      { title: "Read height", body: "Each slice uses graph height as a contribution.", targetId: "curve" },
      { title: "Add width", body: "A thin width dx turns height into a tiny area.", targetId: "slices" },
      { title: "Collect pieces", body: "The shaded region is the total of those pieces.", targetId: "area" },
      { title: "Move b", body: "Changing the endpoint changes the accumulated total.", targetId: "right-bound" },
      { title: "Take the limit", body: "More slices reduce the estimate error.", targetId: "limit-note" }
    ],
    storyboard: [
      { title: "Start with an interval", narration: "Mark the inputs from a to b before measuring any total.", targetIds: ["left-bound", "right-bound"], camera: { x: 42, y: 75, zoom: 1.15 } },
      { title: "Lift tiny rectangles", narration: "Each rectangle uses the curve height over a narrow width.", targetIds: ["slices", "curve"], camera: { x: 42, y: 52, zoom: 1.2 } },
      { title: "Add them", narration: "The integral is the accumulated area of all contributions.", targetIds: ["area", "accumulation-arrow"], camera: { x: 45, y: 58, zoom: 1.05 } },
      { title: "Refine the estimate", narration: "More slices make the rectangles hug the curve more faithfully.", targetIds: ["slices", "limit-note"], camera: { x: 48, y: 50, zoom: 1.25 } },
      { title: "Read the notation", narration: "The symbol says: add f(x) dx from a to b.", targetIds: ["integral-symbol", "area"], camera: { x: 59, y: 30, zoom: 1.15 } }
    ]
  };
}

function buildTaylorBoundSourceScene(topic: string, sentences: string[]): LessonScene {
  return {
    title: "Taylor error envelope",
    format: "remainder-bound checkpoint lab",
    visualIntent: "Compare a Taylor polynomial to the true curve, then tighten the Lagrange error bound by changing degree and interval width.",
    background: "plane",
    controls: [
      { label: "degree n", min: 1, max: 8, value: 3, unit: "", effect: "Higher degree usually makes the polynomial track the curve longer near the center." },
      { label: "distance from center", min: 5, max: 90, value: 42, unit: "%", effect: "Moving farther from the center makes the remainder bound larger." },
      { label: "derivative ceiling", min: 10, max: 100, value: 55, unit: "%", effect: "A larger maximum derivative bound raises the worst-case error envelope." }
    ],
    elements: [
      { type: "axis", id: "axes", label: "x and y axes", x: 12, y: 78, x2: 92, y2: 78, emphasis: 0.42 },
      {
        type: "curve",
        id: "true-curve",
        label: "true function",
        detail: "The actual function being approximated near the center.",
        points: [
          { x: 12, y: 72 },
          { x: 24, y: 58 },
          { x: 38, y: 43 },
          { x: 52, y: 36 },
          { x: 66, y: 33 },
          { x: 82, y: 26 }
        ],
        emphasis: 0.96
      },
      {
        type: "curve",
        id: "taylor-poly",
        label: "Taylor polynomial",
        detail: "The local polynomial approximation centered at a.",
        points: [
          { x: 16, y: 70 },
          { x: 30, y: 56 },
          { x: 44, y: 45 },
          { x: 58, y: 38 },
          { x: 72, y: 39 },
          { x: 86, y: 47 }
        ],
        emphasis: 0.82,
        bindings: [
          { control: "degree n", property: "pointY", amount: -10, pivotX: 50, pivotY: 50 },
          { control: "distance from center", property: "pointX", amount: 4, pivotX: 50, pivotY: 50 }
        ]
      },
      {
        type: "region",
        id: "error-band",
        label: "allowed error",
        detail: "The bound is a ceiling on the possible remainder, not the exact error.",
        x: 41,
        y: 29,
        width: 36,
        height: 28,
        emphasis: 0.7,
        bindings: [
          { control: "distance from center", property: "height", amount: 16, pivotX: 50, pivotY: 50 },
          { control: "derivative ceiling", property: "height", amount: 13, pivotX: 50, pivotY: 50 },
          { control: "degree n", property: "height", amount: -8, pivotX: 50, pivotY: 50 }
        ]
      },
      { type: "node", id: "center-a", label: "center a", detail: "Taylor information is anchored at this point.", x: 38, y: 80, emphasis: 0.72 },
      {
        type: "node",
        id: "test-x",
        label: "test x",
        detail: "The bound grows with distance |x-a|.",
        x: 70,
        y: 80,
        emphasis: 0.84,
        bindings: [{ control: "distance from center", property: "x", amount: 18, pivotX: 38, pivotY: 80 }]
      },
      {
        type: "vector",
        id: "distance",
        label: "|x-a|",
        detail: "Distance from the center is raised to the n+1 power.",
        x: 38,
        y: 86,
        x2: 70,
        y2: 86,
        emphasis: 0.75,
        bindings: [{ control: "distance from center", property: "x2", amount: 18, pivotX: 38, pivotY: 86 }]
      },
      {
        type: "formula",
        id: "bound-formula",
        label: "remainder bound",
        latex: "|R_n(x)| \\le \\frac{M}{(n+1)!}|x-a|^{n+1}",
        detail: "M is a maximum possible (n+1)st derivative on the interval.",
        x: 58,
        y: 17,
        emphasis: 0.92
      },
      {
        type: "annotation",
        id: "m-note",
        label: "M is worst-case",
        detail: sentences[0] ?? "The Lagrange form of the remainder gives a bound on the error after a Taylor polynomial approximation.",
        x: 76,
        y: 55,
        emphasis: 0.68,
        bindings: [{ control: "derivative ceiling", property: "translateY", amount: -7, pivotX: 76, pivotY: 55 }]
      }
    ],
    callouts: [
      { title: "Approximate locally", body: "The polynomial is built from information at a.", targetId: "taylor-poly" },
      { title: "Measure distance", body: "|x-a| controls how far the estimate travels.", targetId: "distance" },
      { title: "Bound the unknown", body: "M caps the next derivative over the interval.", targetId: "m-note" },
      { title: "Read the envelope", body: "The band is worst-case allowed error.", targetId: "error-band" },
      { title: "Use the formula", body: "Degree, distance, and M determine the bound.", targetId: "bound-formula" }
    ],
    storyboard: [
      { title: "Anchor at a", narration: "Place the Taylor polynomial at the center where derivatives are known.", targetIds: ["center-a", "taylor-poly"], camera: { x: 42, y: 58, zoom: 1.15 } },
      { title: "Walk to x", narration: "Move away from the center and watch distance enter the estimate.", targetIds: ["test-x", "distance"], camera: { x: 55, y: 78, zoom: 1.2 } },
      { title: "Reveal the remainder", narration: "The gap between true curve and polynomial is the remainder.", targetIds: ["true-curve", "taylor-poly"], camera: { x: 56, y: 42, zoom: 1.18 } },
      { title: "Wrap it in a bound", narration: "Lagrange gives a worst-case envelope around that unknown gap.", targetIds: ["error-band", "m-note"], camera: { x: 65, y: 45, zoom: 1.12 } },
      { title: "Tune the formula", narration: "Higher degree, smaller distance, or lower M tightens the guaranteed error.", targetIds: ["bound-formula", "error-band"], camera: { x: 58, y: 25, zoom: 1.1 } }
    ]
  };
}

function buildProcessSourceScene(topic: string, sentences: string[], phrases: string[]): LessonScene {
  const labels = [
    phrases[0] ?? topic,
    phrases[1] ?? "input",
    phrases[2] ?? "conversion",
    phrases[3] ?? "output",
    phrases[4] ?? "constraint"
  ];

  return {
    title: `${compact(topic, 34)} process studio`,
    format: "source-compiled process checkpoints",
    visualIntent: "Follow the concept as a sequence: input, transformation, output, and the condition that can break the pattern.",
    background: "lab",
    controls: [
      { label: "input strength", min: 0, max: 100, value: 52, unit: "%", effect: "Changes how much the first stage can feed the process." },
      { label: "limiting factor", min: 0, max: 100, value: 35, unit: "%", effect: "Adds friction so the output stops growing linearly." }
    ],
    elements: [
      { type: "particle", id: "input", label: compact(labels[1], 26), detail: sentences[0] ?? `The input that starts ${topic}.`, x: 16, y: 50, emphasis: 0.8, bindings: [{ control: "input strength", property: "scale", amount: 0.35, pivotX: 16, pivotY: 50 }] },
      { type: "vector", id: "flow-1", label: "enters", x: 22, y: 50, x2: 38, y2: 50, emphasis: 0.7, bindings: [{ control: "input strength", property: "opacity", amount: 0.25, pivotX: 30, pivotY: 50 }] },
      { type: "surface", id: "transform", label: compact(labels[2], 28), detail: sentences[1] ?? "The stage where the input changes form.", d: "M38 35 C50 25 62 35 62 50 C62 65 50 75 38 65 Z", x: 50, y: 50, emphasis: 0.86, bindings: [{ control: "limiting factor", property: "pathScale", amount: -0.12, pivotX: 50, pivotY: 50 }] },
      { type: "vector", id: "flow-2", label: "becomes", x: 62, y: 50, x2: 78, y2: 50, emphasis: 0.7, bindings: [{ control: "limiting factor", property: "opacity", amount: -0.28, pivotX: 70, pivotY: 50 }] },
      { type: "node", id: "output", label: compact(labels[3], 28), detail: sentences[2] ?? "The visible result of the process.", x: 84, y: 50, emphasis: 0.82, bindings: [{ control: "input strength", property: "scale", amount: 0.16, pivotX: 84, pivotY: 50 }] },
      { type: "region", id: "constraint", label: compact(labels[4], 28), detail: sentences[3] ?? "A condition that limits or redirects the process.", x: 41, y: 68, width: 38, height: 12, emphasis: 0.6, bindings: [{ control: "limiting factor", property: "height", amount: 16, pivotX: 60, pivotY: 74 }] },
      { type: "formula", id: "rule", label: compact(labels[0], 28), latex: "input \\rightarrow transform \\rightarrow output", detail: "The reusable structure is the ordered change, not a memorized sentence.", x: 50, y: 18, emphasis: 0.75 },
      { type: "annotation", id: "source-note", label: "source clue", detail: sentences[4] ?? `Use sources to decide what each stage means for ${topic}.`, x: 24, y: 78, emphasis: 0.6 }
    ],
    callouts: [
      { title: "Start with input", body: "Ask what enters the process.", targetId: "input" },
      { title: "Transform it", body: "Track what changes form or state.", targetId: "transform" },
      { title: "Read output", body: "Predict the result before revealing.", targetId: "output" },
      { title: "Add constraint", body: "Limits explain why output may plateau.", targetId: "constraint" },
      { title: "Transfer rule", body: "Use the sequence on a new case.", targetId: "rule" }
    ],
    storyboard: [
      { title: "Introduce input", narration: "A visible quantity enters the system.", targetIds: ["input", "flow-1"], camera: { x: 24, y: 50, zoom: 1.2 } },
      { title: "Transform", narration: "The process changes that input into a new form.", targetIds: ["transform"], camera: { x: 50, y: 50, zoom: 1.22 } },
      { title: "Predict output", narration: "The output should follow from the transformation.", targetIds: ["flow-2", "output"], camera: { x: 72, y: 50, zoom: 1.18 } },
      { title: "Constrain", narration: "A limiting factor can stop simple more-input-more-output thinking.", targetIds: ["constraint"], camera: { x: 60, y: 70, zoom: 1.14 } },
      { title: "Abstract", narration: "Now compress the process into a reusable rule.", targetIds: ["rule"], camera: { x: 50, y: 22, zoom: 1.08 } }
    ]
  };
}

function buildSourceCompiledLesson(topic: string, sources: LessonSource[], reason: string): CleanLesson {
  const text = sourceText(sources);
  const subject = inferSubject(topic, text);
  const sentences = getSentences(text);
  const phrases = extractPhrases(text, topic);
  const isIntegral = /\b(integral|integrals|integration|riemann|antiderivative|area under|accumulation)\b/i.test(`${topic} ${text}`);
  const isTaylorBound = /\b(lagrange|taylor|remainder|error bound|error estimate|polynomial approximation)\b/i.test(`${topic} ${text}`);
  const scene = isIntegral
    ? buildIntegralSourceScene(topic, sentences)
    : isTaylorBound
      ? buildTaylorBoundSourceScene(topic, sentences)
      : buildProcessSourceScene(topic, sentences, phrases);
  const firstSource = sources[0];
  const summary =
    sentences[0] ??
    (firstSource ? compact(firstSource.extract, 220) : `A source-compiled interactive model for ${topic}, generated without a paid AI key.`);

  const activities: LessonActivity[] = isIntegral
    ? [
        {
          kind: "observe",
          title: "Predict the total",
          prompt: "Before moving anything, what does the shaded amount represent?",
          action: "Choose, then reveal.",
          targetId: "area",
          reveal: "It represents the accumulated area from the start to the chosen endpoint.",
          question: question(topic, {
            question: "What is a definite integral measuring here?",
            choices: ["Total accumulated area over an interval", "Only one isolated graph height", "Only the graph's maximum height", "Where the curve crosses zero"],
            answer: "Total accumulated area over an interval",
            hint: "Look at the whole interval being collected."
          })
        },
        {
          kind: "manipulate",
          title: "Move the endpoint",
          prompt: "Increase the upper bound. What should happen to the accumulated total?",
          action: "Drag upper bound.",
          targetId: "right-bound",
          control: "upper bound",
          reveal: "When the endpoint moves right, the integral includes more slices of the graph.",
          question: question(topic, {
            question: "Why can changing b change the value of an integral?",
            choices: ["It changes how much of the interval is included", "It changes the definition of f(x)", "It always makes the graph steeper", "It removes dx"],
            answer: "It changes how much of the interval is included",
            hint: "The endpoint controls the collection window."
          })
        },
        {
          kind: "predict",
          title: "Make slices thinner",
          prompt: "Raise slice count. What should improve?",
          action: "Drag slice count.",
          targetId: "slices",
          control: "slice count",
          reveal: "Thinner slices reduce the mismatch between rectangles and the curve.",
          question: question(topic, {
            question: "What does the limiting process fix in a Riemann sum?",
            choices: ["The rectangle estimate error", "The axis labels", "The fact that area has units", "The curve's color"],
            answer: "The rectangle estimate error",
            hint: "More, thinner pieces track curved boundaries better."
          })
        },
        {
          kind: "check",
          title: "Connect notation",
          prompt: "Map each part of the symbol to the picture.",
          action: "Inspect the formula.",
          targetId: "integral-symbol",
          reveal: "a and b mark the interval; f(x) is height; dx is a tiny width.",
          question: question(topic, {
            question: "In \\int_a^b f(x) dx, what does dx suggest visually?",
            choices: ["A very small width", "A final answer", "A new endpoint", "A random constant"],
            answer: "A very small width",
            hint: "It is the thin horizontal piece each contribution uses."
          })
        },
        {
          kind: "reveal",
          title: "Say the idea aloud",
          prompt: "Use one sentence: an integral turns many small ___ into one ___.",
          action: "Fill the blanks.",
          targetId: "accumulation-arrow",
          reveal: "An integral turns many small contributions into one accumulated total.",
          question: question(topic, {
            question: "Which sentence best summarizes integration?",
            choices: ["Add tiny contributions across an interval", "Read one isolated graph value", "List unrelated data points", "Ignore the interval"],
            answer: "Add tiny contributions across an interval",
            hint: "The arrow moves across the whole interval."
          })
        },
        {
          kind: "transfer",
          title: "Transfer",
          prompt: "If height means speed, what does area under speed over time give?",
          action: "Predict first.",
          targetId: "area",
          reveal: "Speed times small time gives small distance; adding them gives total distance.",
          question: question(topic, {
            question: "Why can area under a speed-time graph mean distance?",
            choices: ["Each tiny speed x time piece is distance", "Distance is just the highest speed", "Time disappears from the graph", "Only the first speed matters"],
            answer: "Each tiny speed x time piece is distance",
            hint: "Think units: speed multiplied by time."
          })
        }
      ]
    : isTaylorBound
      ? [
          {
            kind: "observe",
            title: "Spot the approximation",
            prompt: "Which curve is the polynomial allowed to imitate near the center?",
            action: "Answer before reveal.",
            targetId: "taylor-poly",
            reveal: "The Taylor polynomial imitates the true function near the center a.",
            question: question(topic, {
              question: "What is the Taylor polynomial trying to approximate?",
              choices: ["The true function near a", "The axis labels", "Only the value of M", "A random interval endpoint"],
              answer: "The true function near a",
              hint: "Approximation starts at the center where derivative information is known."
            })
          },
          {
            kind: "predict",
            title: "Walk away from a",
            prompt: "Increase distance from center. Predict what happens to the worst-case error.",
            action: "Move distance.",
            targetId: "distance",
            control: "distance from center",
            reveal: "The bound grows with |x-a|^(n+1), so distance matters a lot.",
            question: question(topic, {
              question: "Why does distance from a affect the Lagrange bound?",
              choices: ["The formula includes |x-a| raised to n+1", "The graph changes color", "The degree disappears", "M becomes zero"],
              answer: "The formula includes |x-a| raised to n+1",
              hint: "Look at the distance term in the bound."
            })
          },
          {
            kind: "manipulate",
            title: "Raise the degree",
            prompt: "Increase degree n. What should happen to the bound near the center?",
            action: "Move degree n.",
            targetId: "error-band",
            control: "degree n",
            reveal: "Higher degree adds more local information and divides by a larger factorial.",
            question: question(topic, {
              question: "What does increasing n usually do near the center?",
              choices: ["It can tighten the approximation", "It deletes the interval", "It makes M irrelevant", "It changes a into b"],
              answer: "It can tighten the approximation",
              hint: "More Taylor terms usually help close to a."
            })
          },
          {
            kind: "check",
            title: "Interpret M",
            prompt: "Decide what M is allowed to mean.",
            action: "Inspect derivative ceiling.",
            targetId: "m-note",
            control: "derivative ceiling",
            reveal: "M is a maximum possible next-derivative size on the whole interval.",
            question: question(topic, {
              question: "In the Lagrange error bound, what is M?",
              choices: ["A ceiling for the next derivative on the interval", "The exact error", "The x-coordinate of the center", "The polynomial degree"],
              answer: "A ceiling for the next derivative on the interval",
              hint: "It is deliberately worst-case."
            })
          },
          {
            kind: "reveal",
            title: "Bound versus exact",
            prompt: "Is the shaded band the exact error or a guarantee?",
            action: "Choose carefully.",
            targetId: "error-band",
            reveal: "The Lagrange bound gives a guarantee; the exact error can be smaller.",
            question: question(topic, {
              question: "What does the Lagrange error bound tell you?",
              choices: ["A maximum guaranteed error size", "The exact missing term every time", "The graph's maximum height", "The only possible polynomial"],
              answer: "A maximum guaranteed error size",
              hint: "Bound means safe ceiling, not exact measurement."
            })
          },
          {
            kind: "transfer",
            title: "Use the guarantee",
            prompt: "To guarantee smaller error, which lever is safest?",
            action: "Predict first.",
            targetId: "bound-formula",
            reveal: "Stay closer to a, use more terms, or prove a smaller derivative ceiling M.",
            question: question(topic, {
              question: "Which change can reduce a Taylor error bound?",
              choices: ["Use a smaller interval around a", "Ignore M", "Move x farther away", "Remove the factorial"],
              answer: "Use a smaller interval around a",
              hint: "Smaller |x-a| directly shrinks the distance term."
            })
          }
        ]
    : [
        {
          kind: "observe",
          title: "Find the input",
          prompt: "What enters the process before anything changes?",
          action: "Pick before reveal.",
          targetId: "input",
          reveal: "A process becomes learnable when you can name what enters it.",
          question: question(topic, {
            question: `In a process explanation of ${topic}, what should you identify first?`,
            choices: ["The input or starting condition", "A random label", "The final answer only", "The longest source sentence"],
            answer: "The input or starting condition",
            hint: "Start where the change begins."
          })
        },
        {
          kind: "predict",
          title: "Predict the change",
          prompt: "Before revealing, predict what transformation the middle stage performs.",
          action: "Inspect transform.",
          targetId: "transform",
          reveal: "The middle stage is where the input becomes a different output.",
          question: question(topic, {
            question: "What makes a process explanation powerful?",
            choices: ["It tells how the input changes", "It hides the mechanism", "It uses only labels", "It avoids predictions"],
            answer: "It tells how the input changes",
            hint: "The mechanism is the lesson."
          })
        },
        {
          kind: "manipulate",
          title: "Change the input",
          prompt: "Move input strength. Predict whether output should keep rising.",
          action: "Drag input strength.",
          targetId: "output",
          control: "input strength",
          reveal: "More input can raise output until a limiting factor dominates.",
          question: question(topic, {
            question: "Why might more input stop producing more output?",
            choices: ["A limiting factor can become the bottleneck", "The process stops existing", "The source becomes false", "Labels move around"],
            answer: "A limiting factor can become the bottleneck",
            hint: "Most real systems have constraints."
          })
        },
        {
          kind: "check",
          title: "Name the output",
          prompt: "Use the transformation to predict the output.",
          action: "Answer, then reveal.",
          targetId: "output",
          reveal: "The output is what lets you check whether your mental model works.",
          question: question(topic, {
            question: "A strong process model should let you predict what?",
            choices: ["A result or output", "Only the title", "A random source link", "The color of the diagram"],
            answer: "A result or output",
            hint: "Explanations should let you anticipate consequences."
          })
        },
        {
          kind: "reveal",
          title: "Add the constraint",
          prompt: "Identify what limits the process.",
          action: "Inspect constraint.",
          targetId: "constraint",
          control: "limiting factor",
          reveal: "The constraint is what prevents simple one-variable thinking.",
          question: question(topic, {
            question: "Why include constraints in a lesson?",
            choices: ["They show when a simple pattern can fail", "They replace examples", "They make every topic identical", "They remove the mechanism"],
            answer: "They show when a simple pattern can fail",
            hint: "Boundaries make knowledge usable."
          })
        },
        {
          kind: "transfer",
          title: "Transfer",
          prompt: "Apply the input-transform-output pattern to a new case.",
          action: "Use the formula.",
          targetId: "rule",
          reveal: "Transfer means spotting the same sequence inside a different surface story.",
          question: question(topic, {
            question: "What proves you understand beyond memorization?",
            choices: ["Using the idea in a new situation", "Repeating the same wording", "Pointing at the diagram", "Skipping the sources"],
            answer: "Using the idea in a new situation",
            hint: "The goal is usable knowledge."
          })
        }
      ];

  return {
    topic,
    subject,
    confidence: "source-generated",
    sources,
    summary,
    format: scene.format,
    generationIssue: reason,
    scene,
    blocks: activities.slice(0, 5).map((activity, index) => ({
      kind: index % 2 ? "question" : "visual",
      title: activity.title,
      body: activity.prompt,
      targetId: activity.targetId,
      question: activity.question
    })),
    activities,
    practice: activities
      .map((activity) => activity.question)
      .filter((question): question is LessonQuestion => Boolean(question))
      .slice(0, 4),
    followUps: [
      `${topic} worked example`,
      `${topic} common misconception`,
      `${topic} visual proof`,
      `${topic} practice problems`
    ]
  };
}

function lessonPrompt(topic: string, sources: LessonSource[]) {
  const sourceBlock = sources.length
    ? sources
        .map((source, index) => `SOURCE ${index + 1}: ${source.title}\nURL: ${source.url}\nSUMMARY: ${source.extract}`)
        .join("\n\n")
    : "No source summary was found. Keep factual claims cautious and focus on conceptual structure.";

  return `Create a brand-new Brilliant-style interactive lesson for this exact query: ${topic}

Ground facts in the sources. Do not use a cached lesson, a common-topic template, or a reused simulator. The lesson must be newly designed for this query and must not accidentally switch to a neighboring concept.

${sourceBlock}

Return ONLY valid JSON with this exact shape:
{
  "topic": string,
  "subject": string,
  "summary": "factual setup, max 45 words",
  "format": "unique format name for this exact lesson",
  "scene": {
    "title": string,
    "format": string,
    "visualIntent": "what the learner will discover visually, max 36 words",
    "background": "plane|contour|field|lab|timeline|space|none",
    "controls": [
      {"label": string, "min": number, "max": number, "value": number, "unit": string, "effect": string}
    ],
    "elements": [
      {
        "type": "axis|curve|path|region|node|link|formula|vector|particle|surface|annotation",
        "id": "stable-kebab-id",
        "label": string,
        "detail": "what this object means conceptually",
        "from": "id for link only",
        "to": "id for link only",
        "d": "SVG path in a 0-100 coordinate system",
        "points": [{"x": number, "y": number}],
        "x": number,
        "y": number,
        "x2": number,
        "y2": number,
        "width": number,
        "height": number,
        "latex": string,
        "emphasis": number,
        "bindings": [
          {
            "control": "exact label from scene.controls",
            "property": "x|y|x2|y2|width|height|opacity|scale|rotate|translateX|translateY|pathScale|pointX|pointY",
            "amount": number,
            "pivotX": number,
            "pivotY": number,
            "direction": "normal|inverse"
          }
        ]
      }
    ],
    "callouts": [
      {"title": string, "body": "max 24 words", "targetId": "element id"}
    ],
    "storyboard": [
      {
        "title": "Manim-style animation beat",
        "narration": "one visual transformation explained in concept terms",
        "targetIds": ["element ids animated in this beat"],
        "camera": {"x": number, "y": number, "zoom": number}
      }
    ]
  },
  "activities": [
    {
      "kind": "observe|predict|manipulate|check|reveal|transfer",
      "title": string,
      "prompt": "max 30 words; one thing the learner must do",
      "action": "max 18 words; drag/click/compare/predict",
      "targetId": "element id",
      "control": "optional exact control label",
      "reveal": "max 36 words; conceptual feedback after the learner acts",
      "question": {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
    }
  ],
  "blocks": [
    {
      "kind": "visual|inspect|micro|question|challenge|source",
      "title": string,
      "body": "max 30 words",
      "targetId": "element id",
      "question": {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
    }
  ],
  "practice": [
    {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
  ],
  "followUps": [string,string,string,string]
}

Non-negotiable requirements:
- This is a Brilliant clone: teach by doing, one idea per step, prediction before explanation, reveal after action.
- Do not quiz on the model, the diagram, the interface, or whether the visual is good. Quiz only on the underlying concept.
- The simulator must be mathematically/scientifically/historically faithful. If the query is "integral", do not teach derivatives except as a brief contrast if needed; build the correct concept for the requested query.
- Create at least 9 visual elements, 2-4 controls, 5 callouts, 5 storyboard beats, 6 activities, 4 conceptual practice questions.
- Every important visual element must have bindings to controls. Sliders should change conceptually meaningful quantities, not random decoration.
- The storyboard should feel like a Manim animation plan: objects appear, transform, accumulate, split, rotate, trace, or highlight in a purposeful sequence.
- Never reuse a named common lesson format. Invent this lesson fresh from the topic and sources.
- Avoid paragraph walls. Most teaching should happen through visual state changes, prediction prompts, and precise feedback.`;
}

function parseLessonJson(text: string): Partial<CleanLesson> | null {
  try {
    return JSON.parse(text) as Partial<CleanLesson>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Partial<CleanLesson>;
    } catch {
      return null;
    }
  }
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
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
        input: [
          {
            role: "system",
            content:
              "You are Visualearn's lesson authoring engine. Generate a fresh, source-grounded, Brilliant-quality interactive lesson and Manim-style visual storyboard for the user's exact query. Never use cached templates. Return JSON only."
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
      signal: requestTimeout(45000),
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
    return parseLessonJson(text);
  } catch {
    return null;
  }
}

async function generateWithPollinations(topic: string, sources: LessonSource[]): Promise<Partial<CleanLesson> | null> {
  const model = process.env.POLLINATIONS_MODEL ?? "openai";

  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are Visualearn's free hosted lesson authoring engine. Generate a fresh, source-grounded, Brilliant-quality interactive lesson and Manim-style visual storyboard for the user's exact query. Never use cached templates. Return JSON only."
          },
          {
            role: "user",
            content: lessonPrompt(topic, sources)
          }
        ],
        temperature: 0.45,
        stream: false,
        max_tokens: 6000
      }),
      signal: requestTimeout(6500),
      cache: "no-store"
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;

    if (!text) return null;
    return parseLessonJson(text);
  } catch {
    return null;
  }
}

async function generateWithOllama(topic: string, sources: LessonSource[]): Promise<Partial<CleanLesson> | null> {
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        system:
          "You are Visualearn's local lesson authoring engine. Generate a fresh, source-grounded, Brilliant-quality interactive lesson and Manim-style visual storyboard for the user's exact query. Never use cached templates. Return JSON only.",
        prompt: lessonPrompt(topic, sources),
        format: "json",
        stream: false,
        options: {
          temperature: 0.45
        }
      }),
      signal: requestTimeout(12000),
      cache: "no-store"
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      response?: string;
    };

    if (!data.response) return null;
    return parseLessonJson(data.response);
  } catch {
    return null;
  }
}

export async function composeCleanLesson(topicInput: string): Promise<CleanLesson> {
  const topic = normalizeTopic(topicInput);
  const sources = await fetchTopicSources(topic);
  const generated =
    (await generateWithOpenAI(topic, sources)) ??
    (await generateWithPollinations(topic, sources)) ??
    (await generateWithOllama(topic, sources));

  if (!generated) {
    const hasCloudKey = Boolean(process.env.OPENAI_API_KEY);
    return buildSourceCompiledLesson(
      topic,
      sources,
      hasCloudKey
        ? "The model call failed or returned unusable output, so Visualearn compiled a source-grounded lesson instead."
        : "The free hosted generator and local fallback were unavailable, so Visualearn compiled a source-grounded lesson instead."
    );
  }

  return (
    sanitizeLesson(generated, topic, sources) ??
    buildSourceCompiledLesson(
      topic,
      sources,
      "The model response was missing required lesson pieces, so Visualearn compiled a source-grounded lesson instead."
    )
  );
}
