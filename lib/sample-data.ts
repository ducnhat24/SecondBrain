export interface Note {
  id: string
  title: string
  content: string
  coverImage?: string
  tags: string[]
  category: string
  createdAt: string
  updatedAt: string
}

export const sampleNotes: Note[] = [
  {
    id: "1",
    title: "Building Mental Models",
    content: `Mental models are **frameworks for thinking**. They simplify complex situations so you can reason through them easily.

## Key Models

The best mental models are the ones that are most useful across domains:

- **First principles thinking** -- break problems down to their fundamental truths
- **Inversion** -- think about what you want to *avoid* instead of what you want to achieve
- **Second-order thinking** -- consider the consequences of consequences

> "The map is not the territory." -- Alfred Korzybski

### Applying Models

Start with a small set of models and practice applying them daily. Over time, pattern recognition becomes automatic.`,
    coverImage: "/images/cover-1.jpg",
    tags: ["thinking", "frameworks", "cognition"],
    category: "Learning",
    createdAt: "2026-02-28",
    updatedAt: "2026-03-01",
  },
  {
    id: "2",
    title: "React Server Components",
    content: `Server Components let you write UI that can be **rendered and optionally cached** on the server.

## Benefits

1. **Reduced JavaScript** -- Less JS sent to the client
2. **Faster page loads** -- Server-side rendering with streaming
3. **Direct backend access** -- Query databases without API routes

## Example

\`\`\`tsx
// This component runs on the server
async function UserProfile({ id }: { id: string }) {
  const user = await db.user.findUnique({ where: { id } })
  return <div>{user.name}</div>
}
\`\`\`

Use them for **data fetching** and **static content**. Pair with Client Components for interactivity.`,
    coverImage: "/images/cover-2.jpg",
    tags: ["react", "nextjs", "performance"],
    category: "Engineering",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-02",
  },
  {
    id: "3",
    title: "The Art of Asking Good Questions",
    content: `Good questions **unlock insights**. They clarify assumptions, reveal gaps in understanding, and guide exploration.

## The Socratic Method

The Socratic method teaches us that the quality of your thinking is determined by the quality of your questions.

### Types of Powerful Questions

- **Clarifying**: "What do you mean by...?"
- **Probing**: "Why do you think that is the case?"
- **Hypothetical**: "What would happen if...?"
- **Reflective**: "How does this connect to...?"

> The important thing is not to stop questioning. Curiosity has its own reason for existing.

Practice asking **one great question** per conversation and watch how it changes the depth of your discussions.`,
    tags: ["communication", "learning", "socratic"],
    category: "Learning",
    createdAt: "2026-02-20",
    updatedAt: "2026-02-25",
  },
  {
    id: "4",
    title: "Design Systems at Scale",
    content: `A design system is a collection of **reusable components**, guided by clear standards, that can be assembled to build any number of applications.

## Core Pillars

1. **Consistency** -- Uniform visual language across products
2. **Accessibility** -- WCAG compliance baked in
3. **Maintainability** -- Single source of truth

## Component Architecture

\`\`\`
Button/
  ├── Button.tsx
  ├── Button.stories.tsx
  ├── Button.test.tsx
  └── index.ts
\`\`\`

### Token System

Use design tokens for colors, spacing, and typography to ensure **theme-ability** and **cross-platform** consistency.`,
    coverImage: "/images/cover-3.jpg",
    tags: ["design", "systems", "ui"],
    category: "Design",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-18",
  },
  {
    id: "5",
    title: "Spaced Repetition Systems",
    content: `SRS leverages the **spacing effect** to help you remember information long-term.

## How It Works

By reviewing material at increasing intervals, you can efficiently commit large amounts of knowledge to memory:

- **Day 1**: First review
- **Day 3**: Second review
- **Day 7**: Third review
- **Day 21**: Fourth review

### Tools

**Anki** is the most popular tool for this. Key tips:

1. Keep cards *atomic* -- one idea per card
2. Use **cloze deletions** for flexible recall
3. Add images when possible -- visual memory is strong

> Memory is the residue of thought. -- Daniel Willingham`,
    tags: ["memory", "learning", "productivity"],
    category: "Learning",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-12",
  },
  {
    id: "6",
    title: "API Design Best Practices",
    content: `Good API design is crucial for **developer experience**.

## REST Principles

- Use **consistent naming** (\`/users\`, \`/users/:id\`)
- Proper HTTP methods: \`GET\`, \`POST\`, \`PUT\`, \`DELETE\`
- Meaningful status codes: \`200\`, \`201\`, \`404\`, \`422\`

## Error Handling

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
\`\`\`

### REST vs GraphQL

| Feature | REST | GraphQL |
|---------|------|---------|
| Fetching | Multiple endpoints | Single endpoint |
| Caching | HTTP caching | Client-side |
| Learning curve | Lower | Higher |

Choose based on your **use case** and team expertise.`,
    coverImage: "/images/cover-4.jpg",
    tags: ["api", "architecture", "backend"],
    category: "Engineering",
    createdAt: "2026-02-08",
    updatedAt: "2026-02-10",
  },
  {
    id: "7",
    title: "Journaling for Clarity",
    content: `Writing daily reflections helps **process thoughts and emotions**.

## Three Frameworks

### 1. Morning Pages
Write three pages of stream-of-consciousness first thing in the morning. No editing, no filtering.

### 2. Gratitude Log
List **3 things** you're grateful for each day. Simple but transformative over time.

### 3. Evening Review
Answer these questions before bed:

- What went *well* today?
- What could I *improve*?
- What am I looking forward to *tomorrow*?

> The key is **consistency over perfection**. A single sentence beats a skipped day every time.`,
    tags: ["journaling", "mindfulness", "habits"],
    category: "Personal",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-06",
  },
  {
    id: "8",
    title: "Understanding Edge Computing",
    content: `Edge computing processes data **closer to where it is generated**, reducing latency and bandwidth usage.

## Key Components

1. **CDNs** -- Content Delivery Networks cache static assets
2. **Edge Functions** -- Serverless compute at the edge
3. **Distributed Databases** -- Data replicated across regions

## Providers

- **Vercel** -- Edge Functions + Edge Config
- **Cloudflare** -- Workers + D1 + R2
- **Deno Deploy** -- Global V8 isolates

### When to Use Edge

\`\`\`
if (latency_sensitive && globally_distributed) {
  use_edge()
} else {
  use_serverless()
}
\`\`\`

Edge is ideal for **personalization**, **A/B testing**, and **geo-routing**.`,
    coverImage: "/images/cover-5.jpg",
    tags: ["infrastructure", "performance", "distributed"],
    category: "Engineering",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-03",
  },
  {
    id: "9",
    title: "Color Theory Fundamentals",
    content: `Understanding how colors interact is **essential for visual design**.

## Color Relationships

- **Complementary** -- Opposite on the wheel, creates *contrast*
- **Analogous** -- Adjacent colors, creates *harmony*
- **Triadic** -- Three equidistant colors, creates *balance*

## Accessibility

Always consider **contrast ratios**:

| Level | Ratio | Use Case |
|-------|-------|----------|
| AA | 4.5:1 | Body text |
| AA Large | 3:1 | Headings 18px+ |
| AAA | 7:1 | Enhanced |

> Good color choices are invisible. Bad ones are immediately obvious.

### Tools
Use tools like **Coolors**, **Realtime Colors**, or **ColorBox** to generate accessible palettes.`,
    tags: ["color", "design", "visual"],
    category: "Design",
    createdAt: "2026-01-28",
    updatedAt: "2026-01-30",
  },
  {
    id: "10",
    title: "The Zettelkasten Method",
    content: `Zettelkasten is a knowledge management system that emphasizes **connecting ideas**.

## Core Principles

1. Each note is **atomic** -- one idea per note
2. Notes are **linked** to related notes
3. Structure is **emergent**, not imposed

### The Process

- **Capture** fleeting thoughts quickly
- **Develop** them into permanent notes
- **Connect** each note to at least one existing note
- **Review** connections to discover new insights

## Why It Works

The web of connections creates a *compound interest effect* for knowledge:

> "A Zettelkasten is like a conversation partner that forces you to think."

This **emergent structure** leads to creative insights that a hierarchical system simply cannot produce.`,
    tags: ["pkm", "zettelkasten", "knowledge"],
    category: "Learning",
    createdAt: "2026-01-25",
    updatedAt: "2026-01-27",
  },
]

export const categories = [
  "All Notes",
  "Learning",
  "Engineering",
  "Design",
  "Personal",
]
