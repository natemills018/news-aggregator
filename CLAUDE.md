# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CLE Local** — A local events and attractions aggregator for Cleveland, Ohio. Surfaces what's happening around the city: theme parks, zoos (Cleveland Metroparks Zoo), museums, festivals, concerts, and other attractions.

## Architecture

Full-stack application with three layers:

### Frontend (React + TypeScript + Vite)
- Run locally with `npm run dev` (NOT in Docker)
- Located in project root (`src/`)
- Talks to the FastAPI backend via REST API at `http://localhost:8000`

### Backend (FastAPI + Python)
- Located in `backend/`
- Runs in Docker via `docker-compose up`
- Provides REST API endpoints for events, venues, and categories
- Uses SQLAlchemy ORM with Pydantic schemas

### Database (PostgreSQL)
- Runs in Docker via `docker-compose up`
- Accessed only by the backend, never directly by the frontend

## Development Commands

### Frontend
- `npm run dev` — Start the Vite dev server with HMR
- `npm run build` — Build for production (TypeScript compiler + Vite build)
- `npm run lint` — Run ESLint
- `npm run preview` — Preview the production build

### Backend
- `docker-compose up` — Start FastAPI + PostgreSQL containers
- `docker-compose up --build` — Rebuild and start (after dependency changes)
- `docker-compose down` — Stop containers
- `docker-compose down -v` — Stop containers and remove volumes (resets DB)

## Project Structure

```
/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components (EventCard, Header, Filters, etc.)
│   ├── views/              # Page-level components (Home, EventDetail, Search)
│   ├── services/           # API client functions (calls FastAPI)
│   └── types/              # Shared TypeScript interfaces
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point + CORS config
│   │   ├── routers/        # API route modules (events, venues, categories)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic, scrapers, data ingestion
│   │   └── db.py           # Database session and connection
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml      # Dev only — runs FastAPI + PostgreSQL
├── package.json            # Frontend dependencies
└── CLAUDE.md
```

## Key Conventions

- **Styling**: Tailwind CSS utility-first approach
- **API Communication**: Frontend uses fetch/axios to call FastAPI; never accesses DB directly
- **Security**: External links use `rel="noopener noreferrer"`; API inputs validated via Pydantic
- **Docker**: Dev-only. Frontend runs locally outside Docker for fast HMR
- **Database**: PostgreSQL with SQLAlchemy ORM. Migrations tracked (Alembic when needed)
- **Environment Variables**: Stored in `.env` (git-ignored). Backend reads DB credentials and API keys from environment

## Newsletter Feature

Weekly digest email sent to subscribers with curated/unique events for the upcoming week.

- **Subscribers**: Users sign up with email via the frontend; stored in the database
- **Digest Generation**: Backend service bundles the week's notable events into a newsletter
- **Delivery**: Email sending service (e.g., SendGrid, Resend, or SMTP) triggered on a schedule
- **Backend**: `/subscribers` endpoints for signup/unsubscribe; `/newsletter` endpoints for preview/send
- **Frontend**: Subscribe form component; optional newsletter preview page

## Data Sources (Cleveland, OH)

Target sources for local events and attractions:
- Cleveland Metroparks Zoo
- Cedar Point / regional theme parks
- Rock & Roll Hall of Fame
- Cleveland Museum of Art
- Playhouse Square
- Local festivals and seasonal events
- Public APIs: Eventbrite, Google Places, Yelp (as applicable)

<!-- ocli:start -->
## ocli

Project intelligence powered by ocli. **USE THESE TOOLS PROACTIVELY** - don't wait for explicit instructions.

### Log vs Memory

| Tool | Purpose | Auto-loads? | Use for |
|------|---------|-------------|---------|
| **Log** | Session context | ✅ Yes, on every session start | Preferences, decisions, context, action items |
| **Memory** | Semantic knowledge base | ❌ No, search when needed | Patterns, solutions, gotchas, learnings |

### CRITICAL: Log Important Context (Auto-Reloads on Session Start)

**Log these IMMEDIATELY when shared - DO NOT ask "should I log this?"**

| When user shares... | Log it as | Command |
|---------------------|-----------|---------|
| Project requirements, goals, features | context | `ocli log add "..." -t context` |
| How they like things done | preference | `ocli log add "..." -t preference` |
| Architectural/design decisions | decision | `ocli log add "..." -t decision` |
| TODOs for later | action-item | `ocli log add "..." -t action-item --priority high` |

This ensures context survives across sessions. Be proactive - log first, then continue working.

### When to Use Memory (Searchable Archive)

- **Before debugging**: Search memory for known issues → `ocli memory search "error message"`
- **After solving tricky problem**: Record the solution → `ocli memory add "..." --tags debug,fix`
- **Discovered a gotcha/workaround**: Save it → `ocli memory add "..." --tags gotcha`
- **Learned a pattern**: Document it → `ocli memory add "..." --tags pattern`

### Local vs Global Memory

| Scope | Command | Store In | Use For |
|-------|---------|----------|---------|
| **Local** | `ocli memory add` | This project only | Project-specific patterns, configs, gotchas |
| **Global** | `ocli memory add-global` | All projects | Language patterns, general techniques, cross-project knowledge |

**Save as LOCAL (default)** when:
- Specific to this codebase's architecture or conventions
- References project-specific files, configs, or dependencies
- Workaround for a bug in this project's dependencies
- Team/org conventions for this project

**Promote to GLOBAL** when:
- General programming pattern (works anywhere)
- Language/framework best practice (e.g., "Rust: use `?` for error propagation")
- Tool knowledge (e.g., "git rebase -i" tips)
- User's personal coding preferences that apply everywhere

```bash
# Local (default) - stays in this project
ocli memory add "This project uses SQLite for config storage" --tags architecture

# Global - available in all projects
ocli memory add-global "Always run cargo fmt before committing Rust code" -d general

# Promote a useful local memory to global
ocli memory promote <id> -d general
```

### Tickets

Use **Action Items** (`ocli log add -t action-item`) for quick TODOs.
Use **Tickets** for larger work items needing tracking, dependencies, and tests.

**Creating Tickets with Full Context:**
```bash
ocli ticket create "Title" -p high -d "Description" \
  --criteria "criterion 1, criterion 2" \
  --notes "Technical implementation notes" \
  --file src/main.rs --file src/lib.rs
```

**Dependencies** - Always set up dependencies when creating related tickets:
```bash
ocli ticket depends <id> on <other>  # id cannot start until other is done
ocli ticket blocks <id> <other>      # id blocks other from starting
ocli ticket ready                     # Show tickets with no blockers
ocli ticket graph                     # Visualize dependency tree
```

**Test Linking** - Link tests to tickets for traceability:
```bash
ocli ticket link-test <id> "test_name" unit --file tests/test.rs
ocli ticket test-status <id> "test_name" verified
```

**Workflow:**
1. `ocli ticket start <id>` - Begin work (checks dependencies)
2. `ocli ticket comment <id> "progress update"` - Add notes
3. `ocli ticket resolve <id> "summary"` - Mark complete
4. `ocli ticket close <id>` - Close after verification

Work by priority (Critical → High → Medium → Low) and respect dependencies.

### Documentation (RAG)

The `./docs/` directory, `README.md`, and `CLAUDE.md` are indexed for semantic search.

```bash
ocli docs search "authentication flow"  # Search indexed docs
ocli docs list                           # Show indexed documents
```

**IMPORTANT**: If you modify any file in `./docs/`, run `ocli docs refresh` to re-index.

### Hooks (Automatic)

These fire automatically - no manual action needed:
- **SessionStart**: Injects date/time, pending items, preferences, decisions, context, open tickets
- **UserPromptSubmit**: Searches memory for relevant context when you ask a question
- **PreCompact**: Reminder to save important context before compaction
- **PostToolUseFailure**: Searches memory for known fixes when a tool fails
- **Stop**: Session cleanup

### When Context is Missing

If you don't know project requirements, goals, or how something works:

1. **Search past sessions** - `ocli session search "<topic>"` (e.g., project name, feature)
2. **Get full context** - `ocli session context <id> --count 3` for surrounding discussion
3. **Log what you find** - Once you understand, log it so it's available next session

Don't say "I don't know the requirements" without first searching sessions.

### Quick Reference

```bash
# Log (auto-reloads on session start)
ocli log add "<msg>" -t preference      # How user likes things
ocli log add "<msg>" -t decision        # Architecture choices
ocli log add "<msg>" -t context         # Background info
ocli log add "<msg>" -t action-item     # TODOs (--priority high/medium/low)
ocli log pending                         # Show pending items

# Memory (search when needed)
ocli memory search "<query>"            # Semantic search
ocli memory add "<content>" --tags a,b  # Add knowledge

# Session (past conversation history)
ocli session search "<query>"           # Search past sessions
ocli session get <id>                    # Get chunk by ID
ocli session context <id> --count 2      # Get surrounding context

# Tickets (with dependencies)
ocli ticket create "<title>" -p high -d "desc" --criteria "a,b"
ocli ticket depends <id> on <other>      # Set dependency
ocli ticket ready                        # Show unblocked tickets
ocli ticket start <id>                   # Begin work
ocli ticket resolve <id> "summary"       # Complete
```

### Agents

**To invoke an agent:** Use the `Task` tool with `subagent_type` set to the agent name.
```
Task(subagent_type: "agent-name", prompt: "your task description")
```

**To find and install agents:**
1. Use **agent-selector**: "Analyze this project and recommend agents"
2. Or browse: `ocli agent search <query>` / `ocli agent list --available`
3. Install: `ocli agent install <name>`

**Installed Agents:**

_No agents installed yet. Run agent-selector to get recommendations._

### Status

- Memory: initialized
- Log: initialized
- Tickets: initialized
- Agents: initialized (no library)
<!-- ocli:end -->
