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
};

export type LessonBlock = {
  kind: "visual" | "inspect" | "micro" | "question" | "challenge" | "source";
  title: string;
  body?: string;
  targetId?: string;
  question?: LessonQuestion;
};

export type CleanLesson = {
  topic: string;
  subject: string;
  confidence: "ai-generated" | "source-backed" | "ungrounded";
  sources: LessonSource[];
  summary: string;
  format: string;
  scene: LessonScene;
  blocks: LessonBlock[];
  practice: LessonQuestion[];
  followUps: string[];
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

function normalizeTopic(topicInput: string) {
  return topicInput.trim().replace(/\s+/g, " ") || "black holes";
}

function inferSubject(topic: string, sourceText = "") {
  const value = `${topic} ${sourceText}`.toLowerCase();

  if (/(derivative|integral|residue|cauchy|contour|matrix|vector|equation|calculus|algebra|geometry|probability|statistics|slope|function|theorem|proof|complex)/.test(value)) return "Math";
  if (/(gravity|motion|wave|quantum|force|energy|relativity|electric|magnet|momentum|velocity|mass|particle|field)/.test(value)) return "Physics";
  if (/(revolution|empire|war|history|civilization|treaty|dynasty|colonial|ancient|medieval|state|political)/.test(value)) return "History";
  if (/(dna|cell|biology|organ|ecosystem|protein|evolution|gene|mitosis|photosynthesis|enzyme|organism|species)/.test(value)) return "Biology";
  if (/(algorithm|code|recursion|sorting|computer|programming|data|binary|network|database|software|model|neural)/.test(value)) return "Computer Science";
  if (/(market|supply|demand|economics|inflation|trade|money|price|finance|interest|capital|labor)/.test(value)) return "Economics";
  if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base|electron|compound|ion)/.test(value)) return "Chemistry";
  if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit|telescope|supernova|universe|black hole)/.test(value)) return "Astronomy";
  if (/(philosophy|ethics|logic|argument|consciousness|meaning|truth|justice|knowledge|moral)/.test(value)) return "Philosophy";

  return "General";
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
    .slice(0, 8);
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

function safeCoord(value: unknown, fallback: number) {
  return safeNumber(value, fallback, 0, 100);
}

function sanitizeQuestion(question: Partial<LessonQuestion> | undefined, topic: string, terms: string[], index: number): LessonQuestion {
  const fallbackChoices = ["The visual structure", "Only the label", "An unrelated detail", "Nothing changes"];
  const choices = Array.isArray(question?.choices) && question.choices.length >= 3
    ? question.choices.slice(0, 4).map((choice) => compact(String(choice), 80))
    : fallbackChoices;

  return {
    question:
      typeof question?.question === "string" && question.question.trim()
        ? compact(question.question, 150)
        : `What part of the ${topic} model should move first when ${terms[index] ?? "the key condition"} changes?`,
    choices,
    answer:
      typeof question?.answer === "string" && question.answer.trim() && choices.includes(compact(question.answer, 80))
        ? compact(question.answer, 80)
        : choices[0],
    hint:
      typeof question?.hint === "string" && question.hint.trim()
        ? compact(question.hint, 150)
        : "Read the highlighted visual relationship, then decide what is causal instead of decorative."
  };
}

function sanitizeControl(control: Partial<LessonControl> | undefined, index: number): LessonControl {
  const min = safeNumber(control?.min, 0, -100, 100);
  const max = safeNumber(control?.max, 100, min + 1, 200);
  return {
    label: compact(String(control?.label || `lens ${index + 1}`), 32),
    min,
    max,
    value: safeNumber(control?.value, 50, min, max),
    unit: typeof control?.unit === "string" ? compact(control.unit, 8) : "",
    effect: compact(String(control?.effect || "Changes what the visual emphasizes."), 110)
  };
}

function sanitizeElement(element: Partial<LessonVisualElement>, index: number): LessonVisualElement {
  const type = visualTypes.has(element.type as LessonVisualElement["type"]) ? (element.type as LessonVisualElement["type"]) : "annotation";
  const id = typeof element.id === "string" && element.id.trim() ? element.id.trim().replace(/[^\w-]/g, "-") : `${type}-${index}`;

  return {
    type,
    id,
    label: typeof element.label === "string" ? compact(element.label, 38) : undefined,
    detail: typeof element.detail === "string" ? compact(element.detail, 130) : undefined,
    from: typeof element.from === "string" ? element.from.trim().replace(/[^\w-]/g, "-") : undefined,
    to: typeof element.to === "string" ? element.to.trim().replace(/[^\w-]/g, "-") : undefined,
    d: typeof element.d === "string" ? compact(element.d, 360) : undefined,
    points: Array.isArray(element.points)
      ? element.points.slice(0, 16).map((point, pointIndex) => ({
          x: safeCoord(point.x, 12 + pointIndex * 6),
          y: safeCoord(point.y, 72 - pointIndex * 4)
        }))
      : undefined,
    x: element.x === undefined ? undefined : safeCoord(element.x, 50),
    y: element.y === undefined ? undefined : safeCoord(element.y, 50),
    x2: element.x2 === undefined ? undefined : safeCoord(element.x2, 62),
    y2: element.y2 === undefined ? undefined : safeCoord(element.y2, 38),
    width: element.width === undefined ? undefined : safeNumber(element.width, 18, 1, 100),
    height: element.height === undefined ? undefined : safeNumber(element.height, 12, 1, 100),
    latex: typeof element.latex === "string" ? compact(element.latex, 70) : undefined,
    emphasis: safeNumber(element.emphasis, 0.55, 0, 1)
  };
}

function sanitizeScene(scene: Partial<LessonScene> | undefined, topic: string, subject: string, sources: LessonSource[]): LessonScene {
  const sourceText = sources.map((source) => source.extract).join(" ");
  const terms = extractTerms(`${topic} ${sourceText}`, topic);
  const fallbackScene = buildSourceDerivedScene(topic, subject, sourceText, terms);
  const rawElements = Array.isArray(scene?.elements) && scene.elements.length >= 4 ? scene.elements : fallbackScene.elements;
  const elements = rawElements.slice(0, 18).map(sanitizeElement);
  const controls = Array.isArray(scene?.controls) && scene.controls.length > 0 ? scene.controls : fallbackScene.controls;
  const callouts = Array.isArray(scene?.callouts) && scene.callouts.length >= 2 ? scene.callouts : fallbackScene.callouts;
  const background = backgrounds.has(scene?.background as LessonScene["background"])
    ? (scene?.background as LessonScene["background"])
    : fallbackScene.background;

  return {
    title: compact(String(scene?.title || fallbackScene.title || `${topic} model`), 70),
    format: compact(String(scene?.format || fallbackScene.format || "custom visual model"), 42),
    visualIntent: compact(String(scene?.visualIntent || fallbackScene.visualIntent), 180),
    background,
    controls: controls.slice(0, 4).map(sanitizeControl),
    elements,
    callouts: callouts.slice(0, 6).map((callout, index) => ({
      title: compact(String(callout.title || terms[index] || `Signal ${index + 1}`), 42),
      body: compact(String(callout.body || `Watch this part of ${topic} before reading more.`), 150),
      targetId: typeof callout.targetId === "string" ? callout.targetId.trim().replace(/[^\w-]/g, "-") : elements[index]?.id
    }))
  };
}

function sanitizeLesson(value: Partial<CleanLesson>, topic: string, sources: LessonSource[]): CleanLesson {
  const sourceText = sources.map((source) => source.extract).join(" ");
  const subject = typeof value.subject === "string" && value.subject.trim() ? value.subject.trim() : inferSubject(topic, sourceText);
  const terms = extractTerms(`${topic} ${sourceText}`, topic);
  const scene = sanitizeScene(value.scene, topic, subject, sources);
  const blocks = Array.isArray(value.blocks) && value.blocks.length >= 4
    ? value.blocks
    : buildSourceDerivedBlocks(topic, sourceText, terms, scene);
  const practice = Array.isArray(value.practice) && value.practice.length >= 3
    ? value.practice
    : buildSourceDerivedPractice(topic, terms, scene);

  return {
    topic: typeof value.topic === "string" && value.topic.trim() ? value.topic.trim() : topic,
    subject,
    confidence: value.confidence === "ai-generated" ? "ai-generated" : sources.length > 0 ? "source-backed" : "ungrounded",
    sources,
    summary:
      typeof value.summary === "string" && value.summary.trim()
        ? compact(value.summary, 240)
        : compact(getSentences(sourceText).slice(0, 2).join(" ") || `Visualearn could not find a strong source for ${topic}, so this model stays conceptual and asks you to verify details before going deep.`, 240),
    format: compact(String(value.format || scene.format || "custom visual lesson"), 44),
    scene,
    blocks: blocks.slice(0, 9).map((block, index) => ({
      kind: blockKinds.has(block.kind as LessonBlock["kind"]) ? (block.kind as LessonBlock["kind"]) : index % 3 === 1 ? "question" : "inspect",
      title: compact(String(block.title || scene.callouts[index]?.title || `Move ${index + 1}`), 56),
      body: typeof block.body === "string" ? compact(block.body, 180) : scene.callouts[index]?.body,
      targetId: typeof block.targetId === "string" ? block.targetId.trim().replace(/[^\w-]/g, "-") : scene.callouts[index]?.targetId,
      question: block.question ? sanitizeQuestion(block.question, topic, terms, index) : index % 3 === 1 ? sanitizeQuestion(undefined, topic, terms, index) : undefined
    })),
    practice: practice.slice(0, 6).map((question, index) => sanitizeQuestion(question, topic, terms, index)),
    followUps:
      Array.isArray(value.followUps) && value.followUps.length >= 3
        ? value.followUps.slice(0, 5).map((item) => compact(String(item), 90))
        : [
            `Show ${topic} from a different visual angle`,
            `Make a harder quiz on ${topic}`,
            `Compare ${topic} to a nearby idea`,
            `Give me primary sources for ${topic}`
          ]
  };
}

function buildSourceDerivedScene(topic: string, subject: string, sourceText: string, terms: string[]): LessonScene {
  const value = `${topic} ${sourceText}`.toLowerCase();

  if (/(cauchy|residue|contour|complex integral|singularit|pole)/.test(value)) {
    return {
      title: "Contour, poles, and residue sum",
      format: "complex-plane walkthrough",
      visualIntent: "The integral is read from singularities inside the contour, not from a generic slope or curve.",
      background: "contour",
      controls: [
        { label: "contour radius", min: 20, max: 90, value: 62, unit: "%", effect: "Changes which poles are visibly enclosed by the path." },
        { label: "residue weight", min: 0, max: 100, value: 58, unit: "%", effect: "Brightens the pole contributions that feed the theorem." }
      ],
      elements: [
        { type: "axis", id: "complex-axis", label: "complex plane", x: 50, y: 50, emphasis: 0.4 },
        { type: "path", id: "contour", label: "closed contour C", d: "M24 50 C24 25 48 14 68 22 C90 31 86 70 62 78 C40 86 22 70 24 50 Z", emphasis: 0.95 },
        { type: "region", id: "inside", label: "inside C", x: 29, y: 27, width: 45, height: 48, emphasis: 0.28 },
        { type: "particle", id: "pole-a", label: "pole z1", detail: "Residue counted", x: 43, y: 45, emphasis: 1 },
        { type: "particle", id: "pole-b", label: "pole z2", detail: "Residue counted", x: 61, y: 57, emphasis: 0.9 },
        { type: "particle", id: "outside-pole", label: "outside pole", detail: "Not enclosed", x: 82, y: 28, emphasis: 0.35 },
        { type: "vector", id: "orientation", label: "positive orientation", x: 71, y: 27, x2: 78, y2: 39, emphasis: 0.72 },
        { type: "formula", id: "residue-formula", label: "residue theorem", latex: "integral_C f(z) dz = 2 pi i sum Res(f, zk)", x: 50, y: 91, emphasis: 1 },
        { type: "annotation", id: "inside-outside", label: "inside vs outside", detail: "Only enclosed singularities contribute.", x: 18, y: 20, emphasis: 0.65 }
      ],
      callouts: [
        { title: "Trace the contour", body: "Start with the closed path. The theorem cares about what the path encloses.", targetId: "contour" },
        { title: "Find enclosed poles", body: "Each enclosed singularity contributes its residue to the sum.", targetId: "pole-a" },
        { title: "Ignore outside poles", body: "A singularity outside the contour is visible, but it is not counted.", targetId: "outside-pole" },
        { title: "Read the equation", body: "The whole contour integral collapses into 2 pi i times the enclosed residue sum.", targetId: "residue-formula" }
      ]
    };
  }

  if (/(derivative|slope|tangent|differentiation|local linear)/.test(value)) {
    return {
      title: "Local slope microscope",
      format: "tangent-line lab",
      visualIntent: "Zoom into a curve until it behaves like a line; the derivative is that local rate.",
      background: "plane",
      controls: [
        { label: "zoom", min: 0, max: 100, value: 56, unit: "%", effect: "Makes the neighborhood around x smaller and more linear." },
        { label: "point x", min: 0, max: 100, value: 48, unit: "%", effect: "Slides the tangent point along the curve." }
      ],
      elements: [
        { type: "axis", id: "xy-axis", label: "x and y", emphasis: 0.45 },
        { type: "curve", id: "curve", label: "function f(x)", points: [{ x: 12, y: 76 }, { x: 24, y: 68 }, { x: 36, y: 46 }, { x: 49, y: 42 }, { x: 62, y: 54 }, { x: 78, y: 26 }, { x: 90, y: 18 }], emphasis: 0.95 },
        { type: "node", id: "point", label: "x=a", detail: "Point of measurement", x: 49, y: 42, emphasis: 1 },
        { type: "vector", id: "tangent", label: "tangent slope", x: 31, y: 55, x2: 68, y2: 28, emphasis: 0.95 },
        { type: "region", id: "zoom-window", label: "tiny interval", x: 42, y: 32, width: 18, height: 24, emphasis: 0.32 },
        { type: "formula", id: "derivative-limit", label: "limit definition", latex: "f'(a)=lim h->0 [f(a+h)-f(a)]/h", x: 51, y: 91, emphasis: 0.9 },
        { type: "annotation", id: "linearization", label: "locally straight", detail: "At high zoom, the curve looks almost like its tangent.", x: 76, y: 70, emphasis: 0.62 }
      ],
      callouts: [
        { title: "Pick a point", body: "A derivative is measured at a specific input, not across the whole curve.", targetId: "point" },
        { title: "Shrink the window", body: "As the interval gets tiny, secant behavior settles into tangent behavior.", targetId: "zoom-window" },
        { title: "Read the tangent", body: "The tangent line carries the instantaneous rate of change.", targetId: "tangent" },
        { title: "Connect to the limit", body: "The formula says the same thing: compare nearby outputs as h approaches zero.", targetId: "derivative-limit" }
      ]
    };
  }

  if (/(photosynthesis|chloroplast|carbon fixation|light reaction)/.test(value)) {
    return {
      title: "Light to sugar factory",
      format: "cell process lab",
      visualIntent: "Energy enters as light, moves through chloroplast machinery, and exits as stored chemical energy.",
      background: "lab",
      controls: [
        { label: "light intensity", min: 0, max: 100, value: 64, unit: "%", effect: "Raises the energy available to the light reactions." },
        { label: "CO2 supply", min: 0, max: 100, value: 52, unit: "%", effect: "Changes how much carbon can be fixed into sugar." }
      ],
      elements: [
        { type: "vector", id: "sunlight", label: "light", x: 9, y: 18, x2: 34, y2: 34, emphasis: 0.95 },
        { type: "region", id: "chloroplast", label: "chloroplast", x: 28, y: 25, width: 46, height: 42, emphasis: 0.55 },
        { type: "node", id: "thylakoid", label: "light reactions", x: 43, y: 43, emphasis: 0.9 },
        { type: "node", id: "calvin", label: "Calvin cycle", x: 61, y: 53, emphasis: 0.82 },
        { type: "vector", id: "co2", label: "CO2 in", x: 84, y: 28, x2: 66, y2: 48, emphasis: 0.72 },
        { type: "vector", id: "sugar", label: "sugar out", x: 61, y: 62, x2: 84, y2: 78, emphasis: 0.88 },
        { type: "formula", id: "photo-formula", latex: "CO2 + H2O + light -> sugar + O2", x: 50, y: 88, emphasis: 0.74 }
      ],
      callouts: [
        { title: "Capture light", body: "The model begins where photons energize the chloroplast.", targetId: "sunlight" },
        { title: "Move energy", body: "Light reactions create energy carriers for the next stage.", targetId: "thylakoid" },
        { title: "Fix carbon", body: "The Calvin cycle turns carbon input into stored sugar.", targetId: "calvin" },
        { title: "Check outputs", body: "Sugar and oxygen are products of the whole process.", targetId: "sugar" }
      ]
    };
  }

  if (/(supply|demand|market|price|equilibrium)/.test(value)) {
    return {
      title: "Market pressure crossing",
      format: "equilibrium graph",
      visualIntent: "Price settles where buyer pressure and seller pressure meet.",
      background: "plane",
      controls: [
        { label: "demand shock", min: 0, max: 100, value: 54, unit: "%", effect: "Moves buyer willingness through the scene." },
        { label: "supply shock", min: 0, max: 100, value: 46, unit: "%", effect: "Moves seller availability through the scene." }
      ],
      elements: [
        { type: "axis", id: "market-axis", label: "price / quantity", emphasis: 0.45 },
        { type: "curve", id: "demand", label: "demand", points: [{ x: 16, y: 24 }, { x: 34, y: 38 }, { x: 54, y: 57 }, { x: 82, y: 76 }], emphasis: 0.85 },
        { type: "curve", id: "supply", label: "supply", points: [{ x: 16, y: 76 }, { x: 36, y: 62 }, { x: 54, y: 57 }, { x: 82, y: 28 }], emphasis: 0.85 },
        { type: "node", id: "equilibrium", label: "equilibrium", x: 54, y: 57, emphasis: 1 },
        { type: "formula", id: "price-signal", latex: "Qd(P*) = Qs(P*)", x: 50, y: 90, emphasis: 0.75 }
      ],
      callouts: [
        { title: "Demand slopes down", body: "Higher prices usually reduce quantity demanded.", targetId: "demand" },
        { title: "Supply slopes up", body: "Higher prices usually invite more quantity supplied.", targetId: "supply" },
        { title: "Intersection matters", body: "The crossing point is where market pressure balances.", targetId: "equilibrium" }
      ]
    };
  }

  if (/(war|revolution|history|empire|treaty|dynasty|era|period)/.test(value)) {
    const labels = terms.length >= 4 ? terms.slice(0, 5) : ["pressure", "spark", "turning point", "reaction", "legacy"];
    return {
      title: "Cause and consequence timeline",
      format: "event-chain map",
      visualIntent: "Read the topic as a chain of pressures, triggering events, reactions, and consequences.",
      background: "timeline",
      controls: [
        { label: "time focus", min: 0, max: 100, value: 42, unit: "%", effect: "Slides attention from causes toward consequences." },
        { label: "context depth", min: 0, max: 100, value: 56, unit: "%", effect: "Reveals wider political or social pressure." }
      ],
      elements: labels.map((label, index) => ({
        type: "node",
        id: `event-${index}`,
        label,
        x: 14 + index * 18,
        y: index % 2 ? 58 : 42,
        emphasis: index === 2 ? 1 : 0.6
      })),
      callouts: labels.slice(0, 4).map((label, index) => ({
        title: label,
        body: getSentences(sourceText)[index] ?? `${label} shapes the next part of ${topic}.`,
        targetId: `event-${index}`
      }))
    };
  }

  if (/(black hole|gravity|orbit|planet|star|galaxy|space|relativity)/.test(value)) {
    return {
      title: "Gravity well and horizon",
      format: "spacetime field",
      visualIntent: "Mass curves the surrounding field; near the horizon, paths stop escaping cleanly.",
      background: "space",
      controls: [
        { label: "mass", min: 0, max: 100, value: 70, unit: "%", effect: "Deepens the central well and bends nearby paths." },
        { label: "distance", min: 0, max: 100, value: 44, unit: "%", effect: "Moves the probe closer to or farther from the horizon." }
      ],
      elements: [
        { type: "surface", id: "gravity-field", label: "curved field", d: "M10 70 C25 60 34 56 45 62 C52 68 58 85 69 69 C77 58 84 56 92 62", emphasis: 0.52 },
        { type: "region", id: "horizon", label: "event horizon", x: 42, y: 33, width: 22, height: 22, emphasis: 0.9 },
        { type: "node", id: "singularity", label: "center", x: 53, y: 44, emphasis: 1 },
        { type: "path", id: "light-path", label: "bent light", d: "M11 28 C32 18 43 28 49 39 C56 53 72 60 90 52", emphasis: 0.82 },
        { type: "vector", id: "probe", label: "falling object", x: 76, y: 22, x2: 62, y2: 36, emphasis: 0.76 }
      ],
      callouts: [
        { title: "Field curves", body: "The central mass reshapes paths around it.", targetId: "gravity-field" },
        { title: "Horizon boundary", body: "The event horizon marks the region where escape changes qualitatively.", targetId: "horizon" },
        { title: "Light bends", body: "Even light paths are deflected by the gravitational geometry.", targetId: "light-path" }
      ]
    };
  }

  const labels = terms.length >= 5 ? terms.slice(0, 6) : ["core idea", "mechanism", "constraint", "example", "misconception", "transfer"];
  const elements: LessonVisualElement[] = labels.map((label, index) => ({
    type: "node",
    id: `concept-${index}`,
    label,
    detail: getSentences(sourceText)[index],
    x: 18 + (index % 3) * 31,
    y: 28 + Math.floor(index / 3) * 32,
    emphasis: index === 0 ? 1 : 0.5 + index * 0.06
  }));

  return {
    title: `${topic} concept model`,
    format: `${subject.toLowerCase()} concept atlas`,
    visualIntent: `Use the visual to separate the central idea in ${topic} from supporting details and common traps.`,
    background: "field",
    controls: [
      { label: "focus", min: 0, max: 100, value: 54, unit: "%", effect: "Brightens the core idea and its nearest supports." },
      { label: "transfer", min: 0, max: 100, value: 42, unit: "%", effect: "Pushes attention toward examples and applications." }
    ],
    elements: [
      ...elements,
      { type: "link", id: "concept-link-0", from: "concept-0", to: "concept-1", label: "supports", emphasis: 0.6 },
      { type: "link", id: "concept-link-1", from: "concept-1", to: "concept-2", label: "constrains", emphasis: 0.52 },
      { type: "link", id: "concept-link-2", from: "concept-0", to: "concept-3", label: "applies to", emphasis: 0.48 }
    ],
    callouts: labels.slice(0, 4).map((label, index) => ({
      title: label,
      body: compact(getSentences(sourceText)[index] ?? `${label} is one visible part of ${topic}.`, 140),
      targetId: `concept-${index}`
    }))
  };
}

function buildSourceDerivedBlocks(topic: string, sourceText: string, terms: string[], scene: LessonScene): LessonBlock[] {
  const sentences = getSentences(sourceText);
  const callouts = scene.callouts.length ? scene.callouts : [{ title: scene.title, body: scene.visualIntent, targetId: scene.elements[0]?.id }];
  return [
    {
      kind: "visual",
      title: callouts[0]?.title ?? "Start with the model",
      body: callouts[0]?.body ?? scene.visualIntent,
      targetId: callouts[0]?.targetId
    },
    {
      kind: "question",
      title: "Quick check",
      body: "Answer before reading the next card.",
      targetId: callouts[1]?.targetId,
      question: sanitizeQuestion(
        {
          question: `Which visual part is doing the main explanatory work for ${topic}?`,
          choices: [
            callouts[1]?.title ?? scene.elements[0]?.label ?? "The highlighted part",
            "The page title only",
            "A decorative background",
            "An unrelated outside fact"
          ],
          answer: callouts[1]?.title ?? scene.elements[0]?.label ?? "The highlighted part",
          hint: "Look for the element connected to cause, boundary, or transformation."
        },
        topic,
        terms,
        0
      )
    },
    {
      kind: "inspect",
      title: callouts[2]?.title ?? "Change one condition",
      body: callouts[2]?.body ?? sentences[1] ?? `Use the controls to test what changes inside the ${topic} model.`,
      targetId: callouts[2]?.targetId
    },
    {
      kind: "micro",
      title: "One-sentence model",
      body: compact(sentences[0] ?? scene.visualIntent, 180),
      targetId: callouts[0]?.targetId
    },
    {
      kind: "challenge",
      title: "Transfer it",
      body: `Change the topic slightly. Which part of this ${scene.format} would stay the same, and which part would need a new diagram?`,
      targetId: scene.elements.at(-1)?.id
    }
  ];
}

function buildSourceDerivedPractice(topic: string, terms: string[], scene: LessonScene): LessonQuestion[] {
  const labels = scene.callouts.map((callout) => callout.title).filter(Boolean);
  const first = labels[0] ?? scene.elements[0]?.label ?? "the highlighted element";
  const second = labels[1] ?? scene.elements[1]?.label ?? "the next element";

  return [
    {
      question: `In this model of ${topic}, what should you inspect first?`,
      choices: [first, "The footer sources", "The button labels", "A random color"],
      answer: first,
      hint: "Start where the scene assigns causal or boundary importance."
    },
    {
      question: `What is the best use of the controls in this lesson?`,
      choices: ["Test how the visual relationship changes", "Hide the sources", "Change the topic title", "Skip the model"],
      answer: "Test how the visual relationship changes",
      hint: "Controls are for varying conditions, not decorating the page."
    },
    {
      question: `Which move would show real understanding of ${topic}?`,
      choices: [`Explain how ${first} affects ${second}`, "Memorize only the title", "Ignore the visual model", "Pick the longest answer"],
      answer: `Explain how ${first} affects ${second}`,
      hint: "Understanding means naming a relationship, not just a component."
    },
    {
      question: `If this diagram were wrong, where would the error most likely matter?`,
      choices: ["In which elements cause, enclose, transform, or constrain others", "In the rounded corners", "In the navigation bar", "In the source link styling"],
      answer: "In which elements cause, enclose, transform, or constrain others",
      hint: "A learning visual earns its keep through relationships."
    }
  ];
}

function lessonPrompt(topic: string, sources: LessonSource[]) {
  const sourceBlock = sources.length
    ? sources
        .map((source, index) => `SOURCE ${index + 1}: ${source.title}\nURL: ${source.url}\nSUMMARY: ${source.extract}`)
        .join("\n\n")
    : "No reliable source summary was found. Be explicit about uncertainty and keep claims general.";

  return `Generate a bespoke visual-first lesson for: ${topic}

Use the sources below as grounding. Do not invent unsupported factual claims. Spend the tokens needed to make the lesson precise. Text should be short because the visual scene carries the explanation.

${sourceBlock}

Return ONLY JSON with this shape:
{
  "topic": string,
  "subject": string,
  "summary": "short factual setup, max 45 words",
  "format": "a custom format name chosen for this exact topic, not a generic template",
  "scene": {
    "title": string,
    "format": string,
    "visualIntent": "what the learner should discover visually, max 32 words",
    "background": "plane|contour|field|lab|timeline|space|none",
    "controls": [
      {"label": string, "min": number, "max": number, "value": number, "unit": string, "effect": string}
    ],
    "elements": [
      {
        "type": "axis|curve|path|region|node|link|formula|vector|particle|surface|annotation",
        "id": "stable-kebab-id",
        "label": string,
        "detail": string,
        "from": "id for link only",
        "to": "id for link only",
        "d": "SVG path in a 0-100 coordinate system for path/surface",
        "points": [{"x": number, "y": number}],
        "x": number,
        "y": number,
        "x2": number,
        "y2": number,
        "width": number,
        "height": number,
        "latex": string,
        "emphasis": number
      }
    ],
    "callouts": [
      {"title": string, "body": "max 24 words", "targetId": "element id"}
    ]
  },
  "blocks": [
    {
      "kind": "visual|inspect|micro|question|challenge|source",
      "title": string,
      "body": "max 32 words",
      "targetId": "element id",
      "question": {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
    }
  ],
  "practice": [
    {"question": string, "choices": [string,string,string,string], "answer": string, "hint": string}
  ],
  "followUps": [string,string,string,string]
}

Hard requirements:
- Do not use a lesson template. Choose a different format and block order based on the concept.
- Invent a visual grammar for this exact topic. Generic graph/network/flow is unacceptable unless the topic truly requires that exact object.
- Every visual element must correspond to a real concept, step, object, boundary, force, event, or misconception from the topic.
- For Cauchy Residue Theorem, draw a complex-plane contour with enclosed poles/residue sum/inside-vs-outside logic, not a derivative graph.
- For derivatives, draw a curve, shrinking interval, tangent/local linearization, and limit idea.
- Include at least 7 visual elements, 2 controls, 4 callouts, 5 blocks, and 4 practice questions.
- At least 2 blocks should include questions. Questions should test causality, misconception, visual reading, and transfer.
- Keep prose concise and avoid paragraph walls.`;
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
              "You are Visualearn's lesson generator. Create source-grounded, bespoke visual models for any topic. Never reuse a generic template when the topic calls for a different structure. Return valid JSON only."
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
