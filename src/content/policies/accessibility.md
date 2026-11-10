---
title: "Accessibility Statement"
shortTitle: "Accessibility"
description: "How the ONIXLabs website is built to be accessible, the WCAG 2.2 AA target, known issues we're working on, and how to report a problem or ask for help."
group: legal
order: 6
path: /Legal/Accessibility
effective: 2026-11-08
updated: 2026-11-10
---

We want everyone to be able to use this website, including people who use assistive technology, navigate by keyboard, or need higher contrast or less motion.

## Our standard

We aim to meet the **Web Content Accessibility Guidelines (WCAG) 2.2 at level AA**. The website **partially meets** this standard: most of it does, with the exceptions listed under known issues below.

## How the website is built

- **Content that doesn't depend on JavaScript.** Every page is plain HTML. JavaScript only adds conveniences, such as the light and dark mode switch, so content is always there.
- **Semantic structure.** Each page has a single main heading, a logical heading order and landmark regions, and there's a link to skip straight to the main content.
- **Keyboard access.** Links, buttons, menus and forms can all be used with a keyboard, with a visible focus indicator.
- **Reduced motion.** Animations and scroll effects are switched off if you've asked your device to reduce motion, and content stays fully visible without them.
- **Light and dark modes.** The website follows your device's setting, and you can switch at any time.
- **Text alternatives.** Meaningful images have descriptions, and decorative ones are hidden from screen readers. Links that open a new tab say so.
- **Automated testing.** Every page is checked with automated accessibility testing, in both light and dark mode, on desktop and mobile layouts, as part of our build.

## Known issues

These parts of the website don't yet meet WCAG 2.2 AA:

- **Team role labels** on the home and About pages use brand colours whose contrast against the card background falls below 4.5:1, the minimum for text that size (success criterion 1.4.3).
- **Library family tiles** on the Products page show white text on brand-colour gradients, some of which fall below the required contrast (1.4.3).
- **The ONIXLabs Studio showcases** at the top of the home and Products pages cycle through screenshots automatically, and there's no control to pause them, other than reducing motion in your device's settings (2.2.2).

We're working on fixes for each of these.

Automated testing can't check everything, such as text over gradients and images, so there may be other issues we haven't found. If you come across one, please let us know.

## Reporting a problem or asking for help

If you find something on the website that you can't use, or you need information from it in a different format, email [admin@onixlabs.io](mailto:admin@onixlabs.io). Tell us the page address and what went wrong. We'll aim to reply within five working days, and to provide what you need in a format that works for you.

## Software we publish

This statement covers this website. Our software products and libraries have their own accessibility characteristics; if you have feedback about one of them, we'd be glad to hear it at the same address.

## About this statement

This statement was prepared on 8 November 2026, based on our own testing of the website. We'll review it whenever the website changes significantly, and at least once a year.
