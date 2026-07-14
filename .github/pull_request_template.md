<!--
This template auto-fills the description when someone opens a pull request.
Fill in each section. Delete any that genuinely don't apply.
-->

## What does this PR do?

<!-- One or two sentences. What changes, and why. -->

## Related ticket

<!-- e.g. Closes AI-204, or Relates to BE.8 #40 -->

## Type of change

- [ ] New feature (endpoint, service, component)
- [ ] Bug fix
- [ ] Refactor / cleanup (no behavior change)
- [ ] Docs / config / CI
- [ ] Other:

## How was this tested?

<!-- Be specific. "Ran pytest, 10 passed" / "Tested GET /api/v1/patients in
Swagger against seeded data" / "Verified login returns the full shape via curl".
If it touches an endpoint, say which and what you saw. -->

## API contract changes

<!-- Does this change any request/response shape, route path, or status code
that the frontend or another service depends on? If yes, describe the new shape
so consumers can align. If no, write "none". -->

## Checklist

- [ ] Tests pass locally (`pytest`)
- [ ] App imports cleanly (`python -c "import app.main"`)
- [ ] No secrets committed (no real keys, passwords, or `.env` values)
- [ ] New/changed endpoints match the agreed contract with the frontend
- [ ] Ran locally and verified the change actually works (not just "it compiles")
- [ ] Branch is up to date with the base branch

## Anything reviewers should know?

<!-- Gotchas, follow-ups, things you're unsure about, or areas you'd like a
closer look at. If something's a known-incomplete follow-up, say so here. -->
