export type LessonSource = {
  title?: string;
  extract?: string;
  url?: string;
  found: boolean;
};

export type CleanLesson = {
  topic: string;
  subject: string;
  source: LessonSource;
  confidence: "source-backed" | "curated" | "inferred";
  answer: string;
  whyItMatters: string;
  visualModel: {
    title: string;
    parts: { label: string; detail: string }[];
  };
  steps: { title: string; detail: string }[];
  misconception: string;
  example: string;
  practice: {
    prompt: string;
    hint: string;
  };
  nextQuestions: string[];
};

type LessonBlueprint = {
  subject: string;
  answer: string;
  whyItMatters: string;
  visualTitle: string;
  parts: { label: string; detail: string }[];
  steps: { title: string; detail: string }[];
  misconception: string;
  example: string;
  practice: {
    prompt: string;
    hint: string;
  };
};

const curatedLessons: Record<string, LessonBlueprint> = {
  derivative: {
    subject: "Math",
    answer:
      "A derivative tells you the instant rate of change of something. On a graph, it is the slope of the tangent line at one exact point.",
    whyItMatters:
      "Derivatives let you reason about speed, growth, optimization, and change without only comparing two far-apart values.",
    visualTitle: "Curve, point, tangent",
    parts: [
      { label: "Curve", detail: "The changing quantity you are studying." },
      { label: "Point", detail: "The exact input where you want the rate." },
      { label: "Tangent", detail: "The line that shows the local direction of the curve." },
      { label: "Slope", detail: "Rise over run of that tangent line." }
    ],
    steps: [
      { title: "Pick a point", detail: "Choose the exact x-value you care about." },
      { title: "Zoom in", detail: "At high zoom, the curve near that point looks almost straight." },
      { title: "Read the slope", detail: "The slope of that local line is the derivative." }
    ],
    misconception: "A derivative is not the average change over a whole interval. It is the local change at one point.",
    example: "If position changes over time, the derivative of position is velocity.",
    practice: {
      prompt: "If a curve gets steeper as x increases, what happens to its derivative?",
      hint: "Think about the tangent line becoming more vertical."
    }
  },
  derivatives: {
    subject: "Math",
    answer:
      "Derivatives measure instant rate of change. They answer: if the input changes a tiny bit right here, how fast does the output change?",
    whyItMatters:
      "They are the foundation for motion, optimization, graph behavior, and many models in science and engineering.",
    visualTitle: "Moving tangent line",
    parts: [
      { label: "Input", detail: "The x-value you move along the graph." },
      { label: "Output", detail: "The y-value produced by the function." },
      { label: "Tangent line", detail: "A local straight-line view of the curve." },
      { label: "Derivative", detail: "The slope of that tangent line." }
    ],
    steps: [
      { title: "Start with a function", detail: "Imagine the function as a curve." },
      { title: "Slide along it", detail: "Watch the tangent line tilt as the point moves." },
      { title: "Track slope", detail: "That changing slope is the derivative function." }
    ],
    misconception: "Do not treat the derivative as a y-value. It is a slope value.",
    example: "For y = x^2, the derivative is 2x, so the slope grows as x moves away from 0.",
    practice: {
      prompt: "At the bottom of a U-shaped parabola, what should the derivative be?",
      hint: "The tangent line is flat there."
    }
  },
  "black holes": {
    subject: "Physics",
    answer:
      "A black hole is a region of spacetime where gravity is so strong that once something crosses the event horizon, it cannot escape.",
    whyItMatters:
      "Black holes reveal how gravity, light, time, and spacetime behave at extreme limits.",
    visualTitle: "Mass bends escape paths",
    parts: [
      { label: "Mass", detail: "Concentrated matter creates intense gravity." },
      { label: "Curved spacetime", detail: "Nearby paths bend inward." },
      { label: "Event horizon", detail: "The boundary where escape becomes impossible." },
      { label: "Accretion disk", detail: "Hot material can orbit before falling in." }
    ],
    steps: [
      { title: "Compress mass", detail: "Put enough mass into a small enough region." },
      { title: "Escape speed rises", detail: "The speed needed to leave becomes greater and greater." },
      { title: "Horizon forms", detail: "Past the event horizon, outward paths no longer escape." }
    ],
    misconception: "A black hole is not a cosmic vacuum cleaner. Far away, its gravity acts like any object with the same mass.",
    example: "If the Sun became a black hole with the same mass, Earth would not be sucked in; it would keep orbiting that mass.",
    practice: {
      prompt: "What changes first when more mass is squeezed into the same small radius?",
      hint: "Track escape speed and the event horizon."
    }
  },
  "neural networks": {
    subject: "Computer Science",
    answer:
      "A neural network is a system of connected nodes that learns patterns by adjusting weights between inputs and outputs.",
    whyItMatters:
      "Neural networks power image recognition, language models, recommendation systems, and many modern AI tools.",
    visualTitle: "Inputs, weights, activations",
    parts: [
      { label: "Inputs", detail: "Numbers that describe the thing being analyzed." },
      { label: "Weights", detail: "Learned strengths between connections." },
      { label: "Activation", detail: "A node's response after combining signals." },
      { label: "Output", detail: "The prediction or classification." }
    ],
    steps: [
      { title: "Send data in", detail: "Input values move through layers." },
      { title: "Combine signals", detail: "Weights amplify or reduce each signal." },
      { title: "Update weights", detail: "Training nudges weights to reduce mistakes." }
    ],
    misconception: "A neural network does not store understanding like a human. It stores learned numerical relationships.",
    example: "For handwritten digits, early layers detect strokes, later layers combine strokes into digit predictions.",
    practice: {
      prompt: "If a model keeps predicting too low, what should training adjust?",
      hint: "Look at the weights that feed into the output."
    }
  },
  "dna replication": {
    subject: "Biology",
    answer:
      "DNA replication is the process cells use to copy DNA before cell division. Each original strand helps build a matching new strand.",
    whyItMatters:
      "It explains inheritance, growth, repair, and why copying errors can matter biologically.",
    visualTitle: "Unzip, match, proofread",
    parts: [
      { label: "Helix opens", detail: "The two DNA strands separate." },
      { label: "Base pairing", detail: "A pairs with T, and C pairs with G." },
      { label: "Polymerase", detail: "An enzyme builds the new strand." },
      { label: "Proofreading", detail: "Errors are checked and corrected." }
    ],
    steps: [
      { title: "Unzip", detail: "The DNA double helix separates into two templates." },
      { title: "Match bases", detail: "New complementary bases attach to each template." },
      { title: "Seal copies", detail: "The cell ends with two DNA molecules." }
    ],
    misconception: "Replication does not make two totally new molecules from scratch. Each copy keeps one original strand.",
    example: "If one template strand reads A-C-G, the new matching strand becomes T-G-C.",
    practice: {
      prompt: "What is the complementary DNA strand for T-A-C-G?",
      hint: "Use A with T, and C with G."
    }
  },
  "french revolution": {
    subject: "History",
    answer:
      "The French Revolution was a period of political and social upheaval that overthrew the old monarchy and challenged inherited privilege.",
    whyItMatters:
      "It reshaped ideas about citizenship, rights, power, nationalism, and modern political change.",
    visualTitle: "Pressure, rupture, reform",
    parts: [
      { label: "Debt", detail: "Financial crisis weakened the monarchy." },
      { label: "Inequality", detail: "Different estates had unequal burdens and privileges." },
      { label: "Assembly", detail: "Political groups fought over representation and power." },
      { label: "Radicalization", detail: "Conflict escalated into deeper transformation." }
    ],
    steps: [
      { title: "Pressure builds", detail: "Debt, hunger, and inequality create instability." },
      { title: "Authority breaks", detail: "Old institutions lose legitimacy." },
      { title: "New order contested", detail: "Competing groups fight over what should replace it." }
    ],
    misconception: "It was not one simple event or one clean movement. It was a sequence of crises, choices, and power struggles.",
    example: "The storming of the Bastille mattered as a symbol of popular resistance to royal authority.",
    practice: {
      prompt: "Name one economic pressure and one political pressure that pushed the revolution forward.",
      hint: "Separate money problems from representation problems."
    }
  },
  photosynthesis: {
    subject: "Biology",
    answer:
      "Photosynthesis is how plants, algae, and some bacteria convert light energy into stored chemical energy, usually making sugars from carbon dioxide and water.",
    whyItMatters:
      "It is the entry point for most food chains and one of the main ways carbon moves through living systems.",
    visualTitle: "Light becomes stored energy",
    parts: [
      { label: "Light", detail: "Energy arrives from the sun and is captured by pigments such as chlorophyll." },
      { label: "Water", detail: "Water molecules help provide electrons and hydrogen." },
      { label: "Carbon dioxide", detail: "Carbon from the air is assembled into sugar molecules." },
      { label: "Sugar and oxygen", detail: "Sugar stores energy; oxygen is released as a byproduct." }
    ],
    steps: [
      { title: "Capture light", detail: "Chlorophyll absorbs light energy in the chloroplast." },
      { title: "Move energy", detail: "Light reactions convert that energy into chemical carriers." },
      { title: "Build sugar", detail: "The Calvin cycle uses carbon dioxide to form energy-rich sugars." }
    ],
    misconception: "Plants do not get most of their mass from soil. Much of the carbon in plant tissue comes from carbon dioxide in the air.",
    example: "A leaf in bright light can make more sugar because more usable light energy is available, as long as water and carbon dioxide are not limiting.",
    practice: {
      prompt: "If a plant has light and water but very little carbon dioxide, which output becomes harder to make?",
      hint: "Track where the carbon atoms in sugar come from."
    }
  },
  "supply and demand": {
    subject: "Economics",
    answer:
      "Supply and demand describe how buyers' willingness to buy and sellers' willingness to sell interact to shape market prices and quantities.",
    whyItMatters:
      "The model explains shortages, surpluses, price changes, and why incentives shift behavior.",
    visualTitle: "Two curves, one clearing point",
    parts: [
      { label: "Demand", detail: "How much buyers want at each possible price." },
      { label: "Supply", detail: "How much sellers offer at each possible price." },
      { label: "Price", detail: "The signal both sides respond to." },
      { label: "Equilibrium", detail: "The point where quantity demanded and quantity supplied match." }
    ],
    steps: [
      { title: "Draw demand", detail: "As price rises, buyers usually want less." },
      { title: "Draw supply", detail: "As price rises, sellers usually offer more." },
      { title: "Find the crossing", detail: "The intersection predicts the market-clearing price and quantity." }
    ],
    misconception: "Demand is not the same as wanting something. In economics, demand includes willingness and ability to pay at a price.",
    example: "If a frost damages orange crops, supply falls. With demand unchanged, orange prices tend to rise.",
    practice: {
      prompt: "What happens to price if demand rises while supply stays the same?",
      hint: "Picture the demand curve shifting right."
    }
  },
  recursion: {
    subject: "Computer Science",
    answer:
      "Recursion is a programming pattern where a function solves a problem by calling itself on a smaller version of that problem.",
    whyItMatters:
      "It makes tree traversal, divide-and-conquer algorithms, and nested structures easier to express.",
    visualTitle: "Base case, smaller call, return",
    parts: [
      { label: "Problem", detail: "The original task you want to solve." },
      { label: "Base case", detail: "The smallest version that can be answered immediately." },
      { label: "Recursive step", detail: "The rule that calls the same function on a smaller input." },
      { label: "Return path", detail: "The chain of answers combining back upward." }
    ],
    steps: [
      { title: "Name the smaller problem", detail: "Show exactly how each call gets closer to the base case." },
      { title: "Stop cleanly", detail: "Define the condition where no more recursive calls happen." },
      { title: "Combine results", detail: "Use each returned answer to build the final answer." }
    ],
    misconception: "Recursion is not magic repetition. Without a base case and smaller input, it never finishes.",
    example: "To compute factorial(4), use 4 * factorial(3), then 3 * factorial(2), until factorial(1) returns 1.",
    practice: {
      prompt: "What are the base case and smaller call for summing numbers from n down to 1?",
      hint: "Ask when n is small enough to answer immediately."
    }
  },
  "quantum tunneling": {
    subject: "Physics",
    answer:
      "Quantum tunneling is when a particle has a chance to appear beyond an energy barrier even though classical physics says it should not have enough energy to cross.",
    whyItMatters:
      "It helps explain nuclear fusion, radioactive decay, scanning tunneling microscopes, and behavior inside tiny electronic devices.",
    visualTitle: "Wave meets barrier",
    parts: [
      { label: "Particle wave", detail: "Quantum particles are described by a probability wave." },
      { label: "Barrier", detail: "A region that would block the particle in a classical model." },
      { label: "Probability tail", detail: "Part of the wave extends into and sometimes past the barrier." },
      { label: "Detection", detail: "A measurement may find the particle on the far side." }
    ],
    steps: [
      { title: "Start with a wave", detail: "Model the particle by where it might be, not only by a single path." },
      { title: "Add a barrier", detail: "The wave shrinks through the barrier instead of ending instantly." },
      { title: "Read probability", detail: "A small remaining wave on the far side means tunneling can occur." }
    ],
    misconception: "The particle is not secretly drilling a tunnel. Tunneling is about probability amplitude across a barrier.",
    example: "In the Sun, tunneling helps protons get close enough for fusion despite electrical repulsion.",
    practice: {
      prompt: "Would tunneling become more or less likely if the barrier gets wider?",
      hint: "A wider barrier gives the wave more distance to fade."
    }
  },
  mitochondria: {
    subject: "Biology",
    answer:
      "Mitochondria are cell structures that convert energy from food molecules into ATP, the usable energy currency cells spend to do work.",
    whyItMatters:
      "They connect food, oxygen, cellular work, metabolism, and many health-related processes.",
    visualTitle: "Fuel, oxygen, ATP",
    parts: [
      { label: "Fuel molecules", detail: "Food is broken into smaller molecules that carry stored energy." },
      { label: "Inner membrane", detail: "A folded surface where key energy-transfer steps happen." },
      { label: "Oxygen", detail: "Oxygen helps receive electrons at the end of the chain." },
      { label: "ATP", detail: "The cell's spendable energy molecule." }
    ],
    steps: [
      { title: "Break down fuel", detail: "Food molecules are processed into energy-carrying electrons." },
      { title: "Pump protons", detail: "Electron transport builds a concentration gradient." },
      { title: "Make ATP", detail: "ATP synthase uses that gradient to produce ATP." }
    ],
    misconception: "Mitochondria do not create energy from nothing. They convert stored chemical energy into a form cells can use.",
    example: "Muscle cells contain many mitochondria because movement requires a steady ATP supply.",
    practice: {
      prompt: "Why would a cell that uses lots of energy tend to have more mitochondria?",
      hint: "Connect ATP demand to ATP production."
    }
  },
  algebra: {
    subject: "Math",
    answer:
      "Algebra is a way to describe relationships with symbols so unknown values can be solved, compared, or transformed.",
    whyItMatters:
      "It lets you move from arithmetic on one example to reasoning about whole families of situations.",
    visualTitle: "Unknown, rule, balance",
    parts: [
      { label: "Variable", detail: "A symbol standing for a number that may be unknown or changing." },
      { label: "Expression", detail: "A combination of numbers, variables, and operations." },
      { label: "Equation", detail: "A statement that two expressions are equal." },
      { label: "Balance", detail: "Whatever you do to one side of an equation must also happen to the other." }
    ],
    steps: [
      { title: "Identify the unknown", detail: "Name the value you are trying to find." },
      { title: "Keep equality true", detail: "Use inverse operations on both sides." },
      { title: "Check the result", detail: "Substitute the value back into the original equation." }
    ],
    misconception: "A variable is not always a mystery number. It can also represent a changing quantity or a general pattern.",
    example: "In 2x + 3 = 11, subtract 3 from both sides, then divide by 2, so x = 4.",
    practice: {
      prompt: "Solve 3x - 5 = 10. What operation should happen first?",
      hint: "Undo subtraction before undoing multiplication."
    }
  }
};

const subjectModels: Record<string, { visualTitle: string; parts: string[]; verbs: string[] }> = {
  Math: {
    visualTitle: "Quantity, rule, change",
    parts: ["Quantity", "Relationship", "Graph", "Pattern"],
    verbs: ["measure", "compare", "transform"]
  },
  Physics: {
    visualTitle: "Object, force, motion",
    parts: ["Object", "Force", "Field", "Motion"],
    verbs: ["push", "pull", "curve"]
  },
  History: {
    visualTitle: "Cause, conflict, consequence",
    parts: ["Pressure", "Actors", "Event", "Consequence"],
    verbs: ["pressure", "respond", "change"]
  },
  Biology: {
    visualTitle: "Structure, function, feedback",
    parts: ["Structure", "Process", "Signal", "Outcome"],
    verbs: ["copy", "regulate", "adapt"]
  },
  "Computer Science": {
    visualTitle: "Input, process, output",
    parts: ["Input", "State", "Rule", "Output"],
    verbs: ["encode", "compute", "update"]
  },
  Economics: {
    visualTitle: "Incentive, choice, equilibrium",
    parts: ["Incentive", "Demand", "Supply", "Tradeoff"],
    verbs: ["choose", "price", "adjust"]
  },
  Chemistry: {
    visualTitle: "Particles, bonds, energy",
    parts: ["Atom", "Bond", "Energy", "Reaction"],
    verbs: ["bond", "break", "rearrange"]
  },
  Astronomy: {
    visualTitle: "Scale, gravity, light",
    parts: ["Object", "Distance", "Gravity", "Light"],
    verbs: ["orbit", "shine", "expand"]
  },
  Philosophy: {
    visualTitle: "Claim, reason, objection",
    parts: ["Claim", "Reason", "Objection", "Implication"],
    verbs: ["define", "challenge", "infer"]
  },
  General: {
    visualTitle: "Term, parts, relationship",
    parts: ["Definition", "Parts", "Mechanism", "Use"],
    verbs: ["notice", "connect", "apply"]
  }
};

type SubjectGuide = {
  why: (topic: string, terms: string[]) => string;
  parts: (topic: string, terms: string[]) => { label: string; detail: string }[];
  steps: (topic: string, terms: string[], hasSource: boolean) => { title: string; detail: string }[];
  misconception: (topic: string) => string;
  example: (topic: string, terms: string[]) => string;
  practice: (topic: string) => { prompt: string; hint: string };
};

const subjectGuides: Record<string, SubjectGuide> = {
  Math: {
    why: (topic) => `A good math explanation of ${topic} should expose the variables, the rule, and what changes when an input changes.`,
    parts: (topic, terms) => [
      { label: "Variable", detail: `Name the quantity that can change in ${topic}. ${termDetail(terms)}` },
      { label: "Rule", detail: `Find the operation, relationship, or constraint that controls ${topic}.` },
      { label: "Representation", detail: `Connect the symbols to a graph, table, diagram, or numerical example.` },
      { label: "Invariant", detail: `Look for what stays true even when the numbers change.` }
    ],
    steps: (topic) => [
      { title: "Make one example", detail: `Choose simple numbers so ${topic} becomes visible instead of abstract.` },
      { title: "Generalize the pattern", detail: "Replace the example with variables only after the pattern is clear." },
      { title: "Test an edge case", detail: "Try zero, one, a negative value, or a very large value to see if the rule still behaves." }
    ],
    misconception: (topic) => `Do not memorize a symbol pattern for ${topic} before you know what each symbol is measuring.`,
    example: (topic, terms) => `Use one small numerical case of ${topic}, then explain how the same rule scales to a harder case. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `Pick one variable in ${topic}. What happens when that variable doubles?`,
      hint: "Track the output, not just the symbol."
    })
  },
  Physics: {
    why: (topic) => `${topic} becomes understandable when you track the system, the forces or energy transfers, and the boundary conditions.`,
    parts: (topic, terms) => [
      { label: "System", detail: `Decide what object, field, or region you are studying in ${topic}.` },
      { label: "Interaction", detail: `Identify the push, pull, exchange, wave, or constraint driving the behavior. ${termDetail(terms)}` },
      { label: "Conservation", detail: "Ask which quantity is conserved, transformed, or dissipated." },
      { label: "Limit", detail: "Check what happens at an extreme: very small, very fast, very massive, or very energetic." }
    ],
    steps: (topic) => [
      { title: "Draw the system", detail: `Sketch ${topic} as objects and arrows before reaching for equations.` },
      { title: "Follow energy", detail: "Ask where energy starts, where it goes, and what form it takes." },
      { title: "Change one condition", detail: "Predict how the behavior changes if a mass, distance, speed, or field strength changes." }
    ],
    misconception: (topic) => `Do not treat ${topic} as a label for a cool effect. Physics explanations need a system, an interaction, and a measurable change.`,
    example: (topic, terms) => `A useful example for ${topic} should name the object, the interaction, and the observed result. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `In ${topic}, what is the system and what is the main interaction acting on it?`,
      hint: "Draw boxes for objects and arrows for influences."
    })
  },
  History: {
    why: (topic) => `${topic} is clearer when it is treated as a chain of pressures, choices, conflicts, and consequences rather than a memorized date.`,
    parts: (topic, terms) => [
      { label: "Pressure", detail: `Find the economic, social, political, or cultural tension behind ${topic}. ${termDetail(terms)}` },
      { label: "Actors", detail: "Name who had power, who wanted change, and who resisted it." },
      { label: "Turning point", detail: "Identify the moment where choices narrowed and events accelerated." },
      { label: "Consequence", detail: "Separate immediate outcomes from long-term effects." }
    ],
    steps: (topic) => [
      { title: "Set the before", detail: `Describe what the world looked like right before ${topic}.` },
      { title: "Track the conflict", detail: "List who wanted what and why those goals collided." },
      { title: "Explain the after", detail: "Name one institution, border, belief, or daily-life pattern that changed." }
    ],
    misconception: (topic) => `${topic} was not inevitable. Historical outcomes usually come from pressures plus human decisions under constraints.`,
    example: (topic, terms) => `Explain one person or group in ${topic}, what they wanted, and what changed because of them. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `For ${topic}, name one cause, one actor, and one consequence.`,
      hint: "Keep those three roles separate."
    })
  },
  Biology: {
    why: (topic) => `${topic} makes more sense when structure and function are connected: what parts exist, what job they do, and how the system regulates itself.`,
    parts: (topic, terms) => [
      { label: "Structure", detail: `Name the cell part, molecule, organism, or body system involved in ${topic}. ${termDetail(terms)}` },
      { label: "Input", detail: "Identify what enters the process: energy, molecules, signals, or information." },
      { label: "Mechanism", detail: "Trace the main step that converts the input into a biological effect." },
      { label: "Output", detail: "Name the product, behavior, trait, or feedback signal that results." }
    ],
    steps: (topic) => [
      { title: "Locate it", detail: `Ask where ${topic} happens: inside a cell, across an organ, in an organism, or in an ecosystem.` },
      { title: "Trace matter", detail: "Follow molecules or information through the process." },
      { title: "Ask why regulation matters", detail: "Living systems usually need timing, feedback, and limits to stay functional." }
    ],
    misconception: (topic) => `Do not describe ${topic} as if living systems are machines with one fixed part. Biology is full of feedback, context, and tradeoffs.`,
    example: (topic, terms) => `For ${topic}, choose one input and one output, then explain the biological mechanism between them. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `What is one input and one output in ${topic}?`,
      hint: "Inputs can be molecules, energy, signals, or information."
    })
  },
  "Computer Science": {
    why: (topic) => `${topic} is best learned by separating representation, state, rule, and output.`,
    parts: (topic, terms) => [
      { label: "Input", detail: `What data enters the system in ${topic}? ${termDetail(terms)}` },
      { label: "State", detail: "What information must be remembered while the process runs?" },
      { label: "Rule", detail: "What operation repeats, branches, compares, or updates the state?" },
      { label: "Output", detail: "What result should be produced, and how do you verify it?" }
    ],
    steps: (topic) => [
      { title: "Run a tiny case", detail: `Use the smallest possible example of ${topic} and trace every step.` },
      { title: "Name the state", detail: "Write down the values that change during execution." },
      { title: "Check correctness", detail: "Ask what must always be true if the algorithm or system is working." }
    ],
    misconception: (topic) => `${topic} is not understood when code merely runs once. You understand it when you can predict its behavior on new inputs.`,
    example: (topic, terms) => `Walk through ${topic} with a three-item input and explain each state change. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `For ${topic}, what input would reveal whether your explanation is wrong?`,
      hint: "Choose a small edge case."
    })
  },
  Economics: {
    why: (topic) => `${topic} becomes useful when incentives, constraints, choices, and tradeoffs are visible.`,
    parts: (topic, terms) => [
      { label: "Decision maker", detail: `Name who chooses in ${topic}: buyers, sellers, workers, firms, governments, or households.` },
      { label: "Incentive", detail: `Identify what reward or cost changes behavior. ${termDetail(terms)}` },
      { label: "Constraint", detail: "Find the budget, scarcity, time, law, risk, or information limit." },
      { label: "Outcome", detail: "Track the price, quantity, welfare, growth, or distribution effect." }
    ],
    steps: (topic) => [
      { title: "Name the choice", detail: `Say exactly what choice ${topic} is about.` },
      { title: "Shift one incentive", detail: "Change one price, cost, rule, or expectation." },
      { title: "Predict adjustment", detail: "Follow how people respond and what new outcome emerges." }
    ],
    misconception: (topic) => `Do not explain ${topic} as if people only follow rules. Economics asks how behavior changes when incentives change.`,
    example: (topic, terms) => `For ${topic}, explain one choice before and after an incentive changes. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `In ${topic}, who is making a choice and what incentive changes that choice?`,
      hint: "Use one sentence with because."
    })
  },
  Chemistry: {
    why: (topic) => `${topic} is clearer when you follow particles, bonds, charge, and energy instead of only naming substances.`,
    parts: (topic, terms) => [
      { label: "Particles", detail: `Name the atoms, ions, molecules, or electrons involved in ${topic}. ${termDetail(terms)}` },
      { label: "Bonds", detail: "Ask which attractions form, break, or rearrange." },
      { label: "Energy", detail: "Track whether energy is absorbed, released, stored, or required." },
      { label: "Products", detail: "Name what exists after the reaction or interaction." }
    ],
    steps: (topic) => [
      { title: "List particles", detail: `Write the relevant particles in ${topic} before describing the reaction.` },
      { title: "Move electrons", detail: "Many chemistry stories become clearer by tracking electrons or charge." },
      { title: "Balance before explaining", detail: "Conservation of atoms and charge keeps the explanation honest." }
    ],
    misconception: (topic) => `${topic} is not just a formula. The formula is a compact record of particles and energy changing.`,
    example: (topic, terms) => `Pick one bond or charge change in ${topic} and explain what that change produces. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `For ${topic}, what particles are present before and after the change?`,
      hint: "Matter should be accounted for on both sides."
    })
  },
  Astronomy: {
    why: (topic) => `${topic} is easiest to reason about when scale, gravity, light, and time are kept separate.`,
    parts: (topic, terms) => [
      { label: "Object", detail: `Identify the planet, star, galaxy, region, or event in ${topic}. ${termDetail(terms)}` },
      { label: "Scale", detail: "Estimate whether the important scale is planetary, stellar, galactic, or cosmic." },
      { label: "Gravity and motion", detail: "Ask what is orbiting, collapsing, expanding, or being pulled." },
      { label: "Light signal", detail: "Notice what observations reveal: brightness, color, spectrum, or timing." }
    ],
    steps: (topic) => [
      { title: "Set the scale", detail: `Place ${topic} on a size and time scale first.` },
      { title: "Follow gravity", detail: "Ask how mass shapes motion or structure." },
      { title: "Use light as evidence", detail: "Astronomy often infers invisible causes from visible light." }
    ],
    misconception: (topic) => `Do not treat ${topic} as only a picture in space. The evidence usually comes from light measured over time.`,
    example: (topic, terms) => `Explain what an observer could measure about ${topic} and what that measurement implies. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `For ${topic}, what would light tell you that your eyes alone could not?`,
      hint: "Think brightness, color, spectrum, or timing."
    })
  },
  Philosophy: {
    why: (topic) => `${topic} is stronger when every claim is paired with a reason, an objection, and a consequence.`,
    parts: (topic, terms) => [
      { label: "Claim", detail: `State the main claim or question in ${topic}. ${termDetail(terms)}` },
      { label: "Reason", detail: "Give the argument that would make someone accept it." },
      { label: "Objection", detail: "Name the strongest reason someone might reject it." },
      { label: "Implication", detail: "Ask what would follow if the claim were true." }
    ],
    steps: (topic) => [
      { title: "Define terms", detail: `Make the central words in ${topic} precise.` },
      { title: "Rebuild the argument", detail: "Put the reasoning into premises and conclusion." },
      { title: "Pressure test it", detail: "Try a counterexample or objection." }
    ],
    misconception: (topic) => `${topic} is not just opinion. Philosophical understanding depends on reasons that can be challenged.`,
    example: (topic, terms) => `For ${topic}, write one claim, one supporting reason, and one objection. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `What is one objection to the main claim in ${topic}?`,
      hint: "Attack the reason, not the person."
    })
  },
  General: {
    why: (topic) => `A useful first explanation of ${topic} should define it, separate its parts, and show what changes when one part changes.`,
    parts: (topic, terms) => [
      { label: "Definition", detail: `Start with a one-sentence definition of ${topic}. ${termDetail(terms)}` },
      { label: "Parts", detail: "Break the idea into smaller pieces you can point to." },
      { label: "Relationship", detail: "Explain how the pieces affect one another." },
      { label: "Use", detail: "Name where the idea appears in the real world." }
    ],
    steps: (topic) => [
      { title: "Define it plainly", detail: `Say what ${topic} is without jargon.` },
      { title: "Find the mechanism", detail: "Ask what causes what." },
      { title: "Make it concrete", detail: "Use one example that a beginner can inspect." }
    ],
    misconception: (topic) => `Do not stop at the name "${topic}". A name is not understanding; understanding means you can explain what changes and why.`,
    example: (topic, terms) => `Explain ${topic} with one concrete example, one cause, and one result. ${termDetail(terms)}`,
    practice: (topic) => ({
      prompt: `What is one part of ${topic} that can change, and what changes because of it?`,
      hint: `Use this sentence: "When ___ changes, ___ changes because ___."`
    })
  }
};

export function inferSubject(topic: string) {
  const value = topic.toLowerCase();

  if (/(derivative|integral|matrix|vector|equation|graph|calculus|algebra|geometry|probability|statistics|slope|function)/.test(value)) return "Math";
  if (/(black hole|gravity|motion|wave|quantum|force|energy|relativity|electric|magnet|momentum|velocity)/.test(value)) return "Physics";
  if (/(revolution|empire|war|history|civilization|treaty|dynasty|colonial|ancient|medieval)/.test(value)) return "History";
  if (/(dna|cell|biology|organ|ecosystem|protein|evolution|gene|mitosis|photosynthesis|enzyme)/.test(value)) return "Biology";
  if (/(neural|algorithm|code|recursion|sorting|computer|programming|data|binary|network|database)/.test(value)) return "Computer Science";
  if (/(market|supply|demand|economics|inflation|trade|money|price|finance|interest)/.test(value)) return "Economics";
  if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base|electron|compound)/.test(value)) return "Chemistry";
  if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit|telescope|supernova)/.test(value)) return "Astronomy";
  if (/(philosophy|ethics|logic|argument|consciousness|meaning|truth|justice|knowledge)/.test(value)) return "Philosophy";

  return "General";
}

export async function fetchTopicSummary(topicInput: string): Promise<LessonSource> {
  const topic = topicInput.trim();
  if (!topic) return { found: false };

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "Visualearn local prototype"
        },
        next: { revalidate: 60 * 60 * 24 }
      }
    );

    if (!response.ok) return { found: false };

    const data = (await response.json()) as {
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      type?: string;
    };

    if (!data.extract || data.type === "disambiguation") return { found: false };

    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page,
      found: true
    };
  } catch {
    return { found: false };
  }
}

function normalizeTopic(topicInput: string) {
  return topicInput.trim().replace(/\s+/g, " ") || "Black holes";
}

function getCurated(topic: string) {
  const key = topic.toLowerCase();
  return curatedLessons[key] ?? curatedLessons[key.replace(/^the\s+/, "")];
}

function firstSentence(text: string) {
  const match = text.match(/^(.+?[.!?])(\s|$)/);
  return match?.[1] ?? text;
}

function getSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function termDetail(terms: string[]) {
  return terms.length ? `Anchor terms: ${terms.slice(0, 3).join(", ")}.` : "";
}

function extractKeyTerms(text: string, topic: string) {
  const stopwords = new Set([
    "about",
    "after",
    "also",
    "because",
    "before",
    "being",
    "between",
    "called",
    "could",
    "each",
    "from",
    "have",
    "into",
    "more",
    "most",
    "only",
    "other",
    "over",
    "such",
    "than",
    "that",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "through",
    "used",
    "were",
    "when",
    "where",
    "which",
    "while",
    "with",
    "would"
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
      if (stopwords.has(normalized)) return false;
      if (topicWords.has(normalized)) return false;
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, 5);
}

function buildInferredBlueprint(topic: string, source: LessonSource): LessonBlueprint {
  const subject = inferSubject(topic);
  const guide = subjectGuides[subject] ?? subjectGuides.General;
  const sourceSentences = source.extract ? getSentences(source.extract) : [];
  const sourceAnswer = sourceSentences.slice(0, 2).join(" ");
  const supportingDetail = sourceSentences.slice(2, 4).join(" ");
  const topicLower = topic.toLowerCase();
  const terms = extractKeyTerms(source.extract ? `${topic} ${source.extract}` : topic, topic);

  return {
    subject,
    answer:
      sourceAnswer ||
      `${topic} is not in the local curated lesson set yet, so this page focuses on how to break it down without pretending to know facts it does not have.`,
    whyItMatters:
      source.found && supportingDetail
        ? `${guide.why(topic, terms)} ${supportingDetail}`
        : guide.why(topic, terms),
    visualTitle: (subjectModels[subject] ?? subjectModels.General).visualTitle,
    parts: guide.parts(topic, terms),
    steps: guide.steps(topic, terms, source.found),
    misconception: guide.misconception(topic),
    example: guide.example(topicLower, terms),
    practice: guide.practice(topicLower)
  };
}

export async function composeCleanLesson(topicInput: string): Promise<CleanLesson> {
  const topic = normalizeTopic(topicInput);
  const source = await fetchTopicSummary(topic);
  const curated = getCurated(topic);
  const blueprint = curated ?? buildInferredBlueprint(topic, source);
  const confidence: CleanLesson["confidence"] = curated ? "curated" : source.found ? "source-backed" : "inferred";

  return {
    topic: source.title ?? topic,
    subject: blueprint.subject,
    source,
    confidence,
    answer: blueprint.answer,
    whyItMatters: blueprint.whyItMatters,
    visualModel: {
      title: blueprint.visualTitle,
      parts: blueprint.parts
    },
    steps: blueprint.steps,
    misconception: blueprint.misconception,
    example: blueprint.example,
    practice: blueprint.practice,
    nextQuestions: [
      `Show me ${topic} with a concrete example`,
      `Quiz me on ${topic}`,
      `What do beginners misunderstand about ${topic}?`
    ]
  };
}
