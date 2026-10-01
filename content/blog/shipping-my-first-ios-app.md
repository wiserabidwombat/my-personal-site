---
title: "Shipping My First iOS App"
slug: shipping-my-first-ios-app
image: /blog/first-ios-app.svg
ogImage: /blog/first-ios-app.png
blurb: "pomodoro-simple started as a basic timer for my own focus sessions. Keeping the app, its widgets and the Lock Screen in sync was the real lesson."
date: "2026-10-01"
author: "Aaron Tilley"
tags: ["coding", "ai", "ios"]
---

I shipped my first iOS app. Well, shipped to TestFlight, which counts. It's called [pomodoro-simple](/projects/pomodoro-simple), and it's a Pomodoro timer I built for my own focus sessions.

## Why a timer?

I wanted a timer for my own focus sessions that did exactly what I needed and nothing else. So I built one.

The catch: I had never built an iOS app. I didn't know Swift, I didn't know the process, and I didn't really know anything about it.

![The pomodoro-simple timer screen in the middle of a Focus session](/blog/pomodoro/timer-screen.webp)

## Starting small with Claude

I built it with Claude, and we started small. My requirements were short:

- Run a timer.
- Switch between focus and breaks (so, Pomodoro).
- Work on the Lock Screen and in StandBy.

We got a basic timer working first, then added Lock Screen controls and StandBy support. Those are the features I use the most. I can pause or skip a session without unlocking my phone, and when my phone is on its side charging, the timer shows up in StandBy.

![The Lock Screen showing a Focus session with Pause and Skip buttons](/blog/pomodoro/lock-screen-live-activity.webp)

![StandBy mode with the timer on the left and a calendar on the right](/blog/pomodoro/standby-mode.webp)

## The hard part: three things, one timer

The biggest challenge by far was keeping three things in sync: the app, the widgets, and the Lock Screen Live Activity.

They all show the same timer, but each one runs separately and follows its own rules. Learning their quirks taught me more about how iOS works than the rest of the app combined.

One example: when you skip a session in the app, it can ask whether you want to count it. A widget can't show a prompt like that. So we added a setting that decides ahead of time what a skip from a widget does.

## Getting it out the door

Shipping turned out to be its own small project.

- **A crash on the Stats screen.** The database behind it got corrupted, and Stats crashed trying to read it. I had to fix that before anyone else could use the app.
- **TestFlight review.** External testers need Apple's approval before they can install a build, so there was some waiting.
- **"No Builds Available."** Even as an internal tester, my builds wouldn't show up. Creating a new test group fixed it.

Now there's a public TestFlight link, and the app has a home on my new [Projects page](/projects).

## What's next

- **An Apple Watch version.** It's in progress on its own branch, and it will sync between phone and watch directly, with no cloud involved.
- **Automatic builds.** I want Xcode Cloud to build and push a new TestFlight build every time I push to main.

## Try it

If you want to give it a spin, the [pomodoro-simple page](/projects/pomodoro-simple) has the TestFlight link. Everything it saves stays on your phone: no account, no analytics, nothing synced to a server.

If you try it, I'd love to hear what you think.
