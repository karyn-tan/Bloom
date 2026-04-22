# Peer Evaluations

## Hemang Evaluating Feng Hua

Feng Hua carried a significant portion of this project and delivered consistently from start to finish. She was the one who set up the entire project foundation, including the CLAUDE.md configuration, the PRD document, the design token system, and the initial repository structure. From there, she moved straight into building the most technically demanding features in the codebase.

On the authentication side, she implemented the complete flow: email/password signup, Google OAuth with callback handling, password reset, and the middleware that protects all authenticated routes. Every piece followed strict TDD with RED, GREEN, and REFACTOR commits that were easy to trace in the git history. She then built the bouquet management system with full RLS policy enforcement and IDOR prevention, making sure every database query was scoped to the authenticated user and returning 404 instead of 403 to avoid leaking information about other users' resources.

Her most impressive work was on the health visualization and adaptive tips features. She implemented the hearts and droplets system as a pure function in lib/health.ts, built the care log analyzer that classifies user behavior over a 7 day window, and wired up the adaptive tip generation through Gemini with proper caching so the API is never called unnecessarily. She also wrote the Playwright E2E tests for the health visualization flow and handled the security review fixes that came out of those features.

Beyond the code, she configured the Claude Code sub-agents, custom skills, and hooks that streamlined our development workflow. She also set up the MCP integrations that we used throughout the project.

Communication was straightforward and efficient. We coordinated over WhatsApp daily, divided work based on what made sense, and helped each other when one of us hit a wall. Feng Hua is technically sharp, disciplined in her process, and dependable. She delivered what she said she would deliver, on time, every time. I would work with her again without hesitation.

## Feng Hua Evaluating Hemang

I honestly feel so lucky to have been paired with Hemang for this project. From day one, he brought such a positive energy to everything we worked on, and it made the whole experience feel less like a class assignment and more like something we were genuinely excited to build together.

Hemang took ownership of the login feature and built it with full TDD discipline. He started with the Zod validation schemas for email and password, wrote failing tests for the API route, implemented the Supabase auth integration, and then built out the LoginForm component with proper error handling and form validation. Each step had its own commit following the RED, GREEN, REFACTOR pattern, which made it really easy to review his work and understand exactly what changed and why.

After that, he tackled the entire email reminders feature end to end. He built the API routes for scheduling and canceling reminders, created the Supabase Edge Function that actually sends the emails through Resend, and then wired the opt-in toggle into the SaveBouquetForm so users could enable reminders right when they save a bouquet. That feature touched a lot of different parts of the codebase and he handled all of it cleanly.

But honestly, where Hemang really showed his character was during the CI/CD phase. Our pipeline was failing across multiple stages, and instead of getting frustrated or cutting corners, he methodically worked through every single issue. He fixed TypeScript errors in the test files, resolved ESLint configuration conflicts, added proper type casting to the route tests, and handled edge cases with integration tests that needed real infrastructure. Some of those fixes required touching dozens of files, and he stayed patient through all of it until the entire pipeline was green. That is not easy work, and most people would not have had the persistence to see it through the way he did.

On top of all the code work, Hemang also handled a huge chunk of the documentation. He wrote the sprint planning and retrospective documents, put together the GitHub Issues documentation, created the blog post, structured the README with the grading checklist, and made sure everything was organized in a way that would be clear for graders. That kind of work often goes unappreciated, but it is absolutely essential and Hemang did it without anyone having to ask.

We communicated over WhatsApp almost every day throughout the project. Whether it was figuring out how to split up a feature, debugging something weird at midnight, or just checking in on how things were going, Hemang was always there and always responsive. We genuinely took turns picking up tasks, and whenever one of us fell behind or got stuck on something tricky, the other person stepped in to help without making it a big deal. It never felt transactional or like we were just splitting a workload. It felt like a real partnership.

I came out of this project not just with a finished app, but with a friend I really value. Hemang is hardworking, thoughtful, and the kind of person who makes everyone around him want to do better work. I would be thrilled to work with him again on anything.
