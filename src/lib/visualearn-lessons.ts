export type CleanLesson = {
  topic: string;
  subject: string;
  summary: string;
  plainAnswer: string;
  keyIdea: string;
  visualModel: string;
  steps: string[];
  tryThis: string;
  nextQuestions: string[];
};

export function inferSubject(topic: string) {
  const value = topic.toLowerCase();

  if (/(derivative|integral|matrix|vector|equation|graph|calculus|algebra)/.test(value)) return "Math";
  if (/(black hole|gravity|motion|wave|quantum|force|energy|relativity)/.test(value)) return "Physics";
  if (/(revolution|empire|war|history|civilization|treaty|dynasty)/.test(value)) return "History";
  if (/(dna|cell|biology|organ|ecosystem|protein|evolution)/.test(value)) return "Biology";
  if (/(neural|algorithm|code|recursion|sorting|computer|programming)/.test(value)) return "Computer Science";
  if (/(market|supply|demand|economics|inflation|trade|money)/.test(value)) return "Economics";
  if (/(chemistry|reaction|molecule|bond|orbital|atom|acid|base)/.test(value)) return "Chemistry";
  if (/(astronomy|planet|star|galaxy|cosmic|space|nebula|orbit)/.test(value)) return "Astronomy";
  if (/(philosophy|ethics|logic|argument|consciousness|meaning|truth)/.test(value)) return "Philosophy";

  return "General";
}

export function composeCleanLesson(topicInput: string): CleanLesson {
  const topic = topicInput.trim() || "Black holes";
  const subject = inferSubject(topic);

  return {
    topic,
    subject,
    summary: `${topic} is easiest to learn by watching one visible relationship change, then naming the idea after the model makes sense.`,
    plainAnswer: `Start with the main thing that moves in ${topic}. When that movement is clear, the definition becomes a label instead of something to memorize.`,
    keyIdea: `One input creates a visible response. The learner's job is to notice what responds first and why.`,
    visualModel: `${subject} model: input, constraint, response, and transfer.`,
    steps: [
      `Look for the visible change in ${topic}.`,
      "Identify the hidden constraint that shapes that change.",
      "Change one assumption and predict the first response."
    ],
    tryThis: `Explain ${topic} in one sentence using the words: when, then, because.`,
    nextQuestions: [
      `Show me ${topic} with a simpler example`,
      `Give me a practice problem for ${topic}`,
      `What is the biggest misconception about ${topic}?`
    ]
  };
}
