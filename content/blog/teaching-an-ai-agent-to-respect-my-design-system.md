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

I've spent the last week folding AI-assisted development into my admittely
slow start to building a new personal website. The hardest problem
hasn't been getting an agent to write working code.  It's been getting
it to write code that looks like mine, respects token usage, follows
component conventions and making a coherent design.

## The problem with "just describe it"

Early on, I tried just prompting the agent with pretty plain English
statements such as "build a component that can display a blog article".
It produced the component but didn't use Tailwind or shadcn.  And of
course it looked nothing like what I though it should.

## What actually worked

The fix wasn't me writing a better prompt.  It was giving the agent
the same thing I would want when starting a new project.  What
component patterns should it imitate, what is my design aesthetic,
what is the purpose of this project, etc.  Once I created a skill
the agent could use, specifically defining the UI styling being
synthwave and what colors it should use for example, the component looked
like what I would have written.

## The takeaway

Agents are great when you can give them something to work off of.
It allows them to be consistent with your ideas and design system.
Context ultimately is what makes the agents great.  The next time
I prompted for a new component, it had the synthwave styling and
design I was looking for.
