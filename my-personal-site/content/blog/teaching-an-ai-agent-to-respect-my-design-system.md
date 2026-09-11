---
title: "Teaching an AI Agent to Respect My Design System"
slug: teaching-an-ai-agent-to-respect-my-design-system
image: /blog/ai-design-system.svg
blurb: "Notes from wiring prompt-driven workflows into a real component library without losing the plot."
date: "2026-08-14"
author: "Aaron Tilley"
tags: ["coding", "ai"]
---

I've spent the last few months folding AI-assisted development into my
day-to-day workflow, and the hardest problem hasn't been getting an
agent to write working code. It's been getting it to write code that
looks like *mine* — that respects the tokens, the component
conventions, and the fifty small decisions that make a design system
feel coherent instead of assembled.

## The problem with "just describe it"

Early on, I tried prompting an agent with plain-English descriptions
of the aesthetic: "neon, retro-future, dark backgrounds." It produced
technically correct Tailwind, but every component reinvented its own
shade of pink and its own idea of what a glow effect should look like.
The output worked. It just didn't belong.

## What actually worked

The fix wasn't a better prompt — it was giving the agent the same
thing I'd give a new engineer joining the project: the actual design
tokens, the existing component patterns to imitate, and explicit
permission to go read the code before writing any. Once the agent had
`--neon-pink`, `--laser-cyan`, and the `bg-synth-grid` utility in front
of it, along with a couple of real examples to pattern-match against,
the components it produced were indistinguishable from ones I'd
written by hand.

## The takeaway

Agents are excellent at consistency once you hand them something
consistent to be consistent *with*. The design system was never the
constraint — it was the missing context.
