# Global Project Rules & Coordination Directive

You are part of a multi-agent system building a website. All subagents must strictly adhere to these global standards to ensure code consistency and prevent conflict.

## 1. Agent Coordination & Git Workflow
* **No Code Overwrites:** Never modify a file currently being targeted or designed by another agent unless explicitly instructed by the `orchestrator`.
* **State Preservation:** Before changing an existing file, read it entirely. Do not delete logic added by other agents (e.g., `staff-engineer` logic must not be stripped out when `frontend-designer` adds classes).
* **Atomic Changes:** Keep edits highly localized. Do not refactor entire files if a targeted tweak satisfies the prompt.

## 2. Technical Stack & Styling Standards
* **Framework Constraints:** [Insert Framework, e.g., Next.js / React / Vue]. Never introduce vanilla HTML pages or alternative frameworks.
* **Styling Framework:** Tailwind CSS. Use semantic class naming and avoid inline `style={}` attributes unless creating dynamic animations.
* **Design Token System:** Always honor the `synthwave-ui` design palette (deep purple backgrounds `#0d081d`, neon pink `#ff007f`, neon cyan `#00ffff`, and glowing borders).

## 3. Implementation Rules
* **No Placeholders:** Do not write `// TODO` or leave functions blank. All code delivered must be fully functional and production-ready.
* **Type Safety:** Use strict TypeScript. Avoid using `any`. Define interfaces for all API payloads and component props.
* **Component Boundaries:** Keep components modular. If a component exceeds 150 lines of code, break it down into smaller, reusable child components.
