---
title: "Introducing AI Agents Into My Design System"
slug: introducing-ai-agents-into-my-design-system
image: /blog/ai-design-system.svg
ogImage: /blog/ai-design-system.png
blurb: "Notes on introducing prompt-driven workflows into a real site."
date: "2026-08-14"
author: "Aaron Tilley"
tags: ["coding", "ai"]
---

I've spent the last week folding AI-assisted development into my admittedly slow start on a new personal website. The hardest problem hasn't been getting an agent to write working code. It's been getting it to write code that looks like mine, uses my design tokens, follows my component conventions, and adds up to a coherent design.

## The problem with "just describe it"

Early on, I tried prompting the agent with pretty plain English, like "build a component that can display a blog article." It built the component, but it didn't use Tailwind or shadcn. And of course it looked nothing like what I thought it should.

## What actually worked

The fix wasn't writing a better prompt. It was giving the agent the same things I'd want when starting a new project: which component patterns to follow, what my design looks like, and what the project is for. Once I wrote a skill that spelled out the synthwave styling and which colors to use, the components started looking like something I would have written. The next one I asked for came out in the synthwave style on the first try.

## The takeaway

Agents are good when you give them something to work from. It keeps them consistent with your ideas and your design system. In the end, context is what makes them great.
