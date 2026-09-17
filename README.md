# BuilderCanvas


> A visual workspace that connects software architecture to the actual work required to build it.

## The problem

Architecture diagrams go stale the moment you draw them. Task boards, meanwhile, have no idea what system they're actually describing — a card that says "Add Stripe webhook" carries no connection back to the service it belongs to.

**BuilderCanvas connects the two.** Every piece of your architecture is a live node — click it, and you see exactly what work it represents, how far along it is, and what it depends on.

## How it works

A project in BuilderCanvas is one connected graph:

```
Architecture  ──→  Tasks  ──→  Progress
```

- **Architecture** — a canvas of nodes (frontend, API, database, service, external) connected by dependency edges
- **Tasks** — each node owns a task list; check items off as you build
- **Progress** — every node's completion percentage is *derived live* from its tasks, never stored or stale

Select any node and its full dependency chain highlights on the canvas, while everything unrelated fades — so the graph always reads as a real system, not just a diagram.

### AI-powered breakdown

Instead of a generic chat assistant, AI has one job: select a node, hit **Break down with AI**, and it generates a structured task list scoped to that exact piece of your architecture — inserted directly into your task list, not pasted as text you have to copy over yourself.

## Features

- Custom-built SVG canvas engine — pan, zoom, and drag, with no graph library (React Flow, Konva, D3) involved
- Click-to-select dependency-chain highlighting
- Manual connect mode — draw new dependency edges between any two nodes
- Node ↔ task linking with live-derived progress, no stored/stale percentages
- AI-generated task breakdown via structured output (not freeform chat)
- Multiple independent projects — create, rename, switch, and delete
- Fully dark-themed, built to feel like a real developer tool

## Tech stack

React · TypeScript · SVG (custom-built canvas engine, no graph library) · Tailwind CSS · Vite · OpenAI (structured task generation)

## Running locally

```bash
git clone https://github.com/<your-username>/buildercanvas.git
cd buildercanvas
npm install
```

Create a `.env.local` file in the project root and add your OpenAI API key:

```
VITE_OPENAI_API_KEY=your_api_key_here
```

> The app runs fully without this — every feature works with the exception of **Break down with AI**, which requires a valid OpenAI API key.

```bash
npm run dev
```

## Roadmap

BuilderCanvas v1 is deliberately scoped — everything below was cut on purpose, not missed:

- [ ] Persistence — save/load projects across sessions (currently in-memory only)
- [ ] Authentication and user accounts
- [ ] Real-time collaboration
- [ ] Elaborate roadmap/release-tracking layer
- [ ] GitHub / deployment integrations

## About

Built solo, end to end — architecture, product, and code — as a public portfolio project. If you find a bug or have an idea, issues and PRs are welcome.
