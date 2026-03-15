# STACK

## Goal
Technology stack fixed for MVP of the subscription manager app.
Do not change this stack without a separate architecture decision.

## Frontend
- React Native
- TypeScript

## Backend
- Node.js
- TypeScript

## Database
- PostgreSQL

## Auth / Data / Storage
- Single backend layer
- No extra services unless strictly required

## Charts
- One charting library across the whole project

## AI workflow
- GPT-5 — product, architecture, task specification, final review
- Cursor — implementation, editing, refactoring, day-to-day coding
- Claude — code review, debugging, second opinion, large refactors

## MVP principle
- Keep the stack simple
- Avoid unnecessary services
- Prefer typed, testable, maintainable solutions
- No stack changes without explicit decision recorded in docs/DECISIONS.md
