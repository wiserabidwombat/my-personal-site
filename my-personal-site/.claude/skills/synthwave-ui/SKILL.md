---
name: "synthwave-ui-developer"
description: "Builds and styles React UI components for a personal website using Tailwind CSS, shadcn/ui, and Vite, adhering strictly to a neon synthwave/retro-future aesthetic."
---

# Synthwave UI Developer Skill

## Trigger Phrases
- "Build a new UI component for my site"
- "Create a new page/route for my portfolio"
- "Apply the synthwave style to this section"
- "Add a shadcn component with retro-future colors"

## Tech Stack Context
- **Framework:** React 18+ (Vite SPA)
- **Routing:** Vite-based routing (ensure code integrates cleanly with existing router configs)
- **Styling:** Tailwind CSS + Radix UI primitives via shadcn/ui
- **Aesthetic:** Synthwave / Retro-future / Outrun (deep purples, neon pinks, glowing cyans, dark grids, and heavy contrast)

## Synthwave Design Token Guidelines
When creating or modifying components, utilize Tailwind classes that match these core visual rules:
- **Backgrounds:** Deep space purples, dark indigos, and near-blacks (`bg-slate-950`, `bg-indigo-950`, custom deep purple `#0d071a`)
- **Primary Accents (Neon Pink/Magenta):** For hero elements, key borders, and hot highlights (`text-pink-500`, `border-pink-500`, `shadow-pink-500/50`)
- **Secondary Accents (Cyan/Laser Blue):** For secondary links, interactive hover states, and active tabs (`text-cyan-400`, `hover:text-cyan-300`)
- **Glow Effects:** Use intentional box-shadows and text-shadows (`shadow-[0_0_15px_rgba(236,72,153,0.5)]`)
- **Grids & Lines:** Incorporate wireframe or perspective grid background patterns where appropriate (`bg-[linear-gradient(...)]` or perspective line overlays)

## Step-by-Step Instructions
1. **Locate and Align with Routing:** Check the structure under your Vite router setup to ensure new components or pages are scaffolded in the correct directory.
2. **Utilize shadcn/ui Primitives:** When building complex components (buttons, dialogs, cards, dropdowns), look for existing shadcn primitives in the repository first. If a new one is needed, instruct the user to add it via `npx shadcn@latest add <component>`.
3. **Inject Synthwave Styling:** Wrap components using Tailwind variables or strict inline utility classes to enforce the high-contrast neon palette, ensuring focus rings and hover transitions use glow/neon colors.
4. **Maintain Accessibility:** Ensure that despite the vibrant neon colors, text-to-background contrast ratios still meet a11y standards (e.g., avoid thin dark text on neon pink backgrounds; use bright white/cyan text on deep purple backgrounds instead).

## Expected Output Format
- Provide the exact React code using TypeScript/JS as configured in the project.
- Highlight any new Tailwind configurations or custom CSS variables needed for the theme.
- Provide instructions on where to place the file and how to update your Vite router to link the view.
