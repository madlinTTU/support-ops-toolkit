# Support Ops Toolkit

A small, working simulation of a support-operations system: synthetic tickets flow in, get triaged, tracked against SLAs, and mined for patterns that reduce future ticket volume. Built as a self-contained learning project (originally sparked by a job application, mentioned once at the bottom — the project stands on its own). All data is synthetic — see disclaimer below.

## What it is

Most support teams run on the same loop: tickets come in, someone (or something) decides how urgent each one is, an agent works through them, and eventually someone steps back and asks "why do we keep getting the same questions?" This project builds a small version of each piece of that loop, with real SQL and real automation code behind it — not a mockup.

## The two flows

**1. Ticket lifecycle — the operational loop**

```
Ticket created → auto-triage (category + priority) → queued for an agent
→ in progress → closed
                 ↳ if SLA is at risk → escalated
```

A ticket is born the moment it's generated. Before any human touches it, a rules-based triage step reads its content and assigns a category and a priority — this is the automation standing in for a first-pass human judgment call. From there it sits in a queue, gets worked, and closes. Anywhere along the way, if it's getting close to breaching its SLA deadline, it's flagged for escalation instead of silently going overdue.

**2. Recurring-issue detection — the compounding loop**

```
Closed tickets accumulate → similarity scan finds repeats
→ flagged as knowledge-base candidates → surfaced in a daily report
→ a human decides: write the KB article?
```

This flow doesn't look at one ticket — it looks at *all* closed tickets over time and asks: which problems keep recurring? Those get flagged as candidates for a knowledge-base article. The toolkit doesn't write the article itself (that's a human call) — it just surfaces the pattern so the decision is easy to make. This is the slow-but-compounding way support volume actually goes down: not by answering faster, but by needing to answer less.

Together, the two flows cover both halves of running support: keep today's tickets inside their SLA, and make sure fewer of them show up next month.

## What's synthetic (read this before judging any numbers)

- All tickets, timestamps, and customer text are generated, not pulled from any real company or real customers.
- Any "time saved" or "volume reduced" figures in the reports/dashboard are **simulated outputs of this toolkit**, not real-world measurements.
- No claim is made that this reflects any real company's actual systems or processes.

## Tech stack

- **PostgreSQL** — single source of truth (`tickets` table), SQL analytics (SLA breaches, volume by category, top recurring issues, response-time stats)
- **TypeScript/Node.js** — ticket generator, auto-priority/tagging rules, recurring-issue detector, daily report
- **Grafana** — dashboard on top of the Postgres data
- **Small Express page** — plain-language summary view
- **Docker Compose** — one-command local run
- **Jest** — unit tests on the automation rules
- **GitHub Actions** — lint + typecheck + test on push

Skills *not* used here on purpose, to avoid overclaiming: Kubernetes, Selenium, any real CRM/ticketing integration.

## How to run

```bash
docker compose up
```
(Filled in once the compose file exists — see Status below.)

## Status

See the [v0.1 — MVP milestone](../../milestone/1) and open issues for current progress. Built in roughly one day end-to-end; quality over added scope.

## About

Built by [Mark Dlinnov](https://github.com/madlinTTU) — junior Java/Spring Boot developer, BSc CS student at TalTech, Tallinn. Started as portfolio work for an Application Support Engineer application, but written to stand as its own project.
