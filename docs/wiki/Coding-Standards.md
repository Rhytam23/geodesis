# Coding Standards

## TypeScript
- Enable strict type checking (`tsconfig.json`).
- Avoid using `any`; define explicit interfaces in `src/types/`.

## React & Components
- Use functional components with hooks.
- Prefix custom hooks with `use` (e.g. `useGeodesisTwin`).
- Keep components small, modular, and single-responsibility.

## Styling
- Use Tailwind CSS classes with semantic design tokens defined in `src/styles/design-tokens.css`.
- Maintain accessible color contrast ratios.

## Git & Commits
- Use conventional commits format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
