# Visualearn

Visualearn is an AI visual learning site that turns a topic into a fresh interactive lesson with:

- a generated simulator
- Manim-style storyboard beats
- learn-by-doing prompts
- concept checks
- source links for deeper reading

The app intentionally avoids hardcoded lesson templates. If generation fails, it pauses instead of showing a neighboring or fake lesson.

## Free Hosted Mode

Visualearn works on Vercel without a paid API key by using Pollinations as a hosted free text generator:

```env
POLLINATIONS_MODEL=openai
```

No user setup is required on each computer. Visitors just open the website.

Free hosted AI can be slower or rate-limited. If the generator returns malformed output, refresh or try a shorter topic.

## Optional Quality Upgrades

For stronger output, add an OpenAI key in Vercel project environment variables:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o
```

For local development without paid APIs, install Ollama and run:

```powershell
ollama pull llama3.2
```

Then use:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Provider order:

1. OpenAI, if `OPENAI_API_KEY` is set
2. Pollinations hosted free generator
3. Ollama local fallback

## Development

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm.cmd run dev
```

Verify:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## Vercel

Deploy the repo to Vercel normally. For completely free hosted operation, no paid API key is required. Optionally add:

```env
POLLINATIONS_MODEL=openai
```

## License

MIT
