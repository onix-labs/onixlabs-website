---
title: "Responsible Disclosure Policy"
shortTitle: "Responsible Disclosure"
description: "How to report a suspected security vulnerability in the ONIXLabs website or software, what to include, what's in scope, and what you can expect from us."
group: trust
order: 2
path: /Legal/Responsible-Disclosure
effective: 2026-11-08
updated: 2026-11-10
---

We welcome reports from security researchers and users who believe they've found a vulnerability in our website or software. This policy explains how to report one, and what you can expect from us in return.

## How to report

Email [admin@onixlabs.io](mailto:admin@onixlabs.io) with "Security" in the subject line. Please include:

- the product, library or web address affected, and the version if you know it
- a description of the vulnerability and its potential impact
- step-by-step instructions to reproduce it, with any proof-of-concept code, screenshots or logs
- how you'd like to be credited, if at all

Please don't report vulnerabilities in public, such as in a GitHub issue, until we've had a chance to fix them.

## What's in scope

- the website at onixlabs.io and its subdomains
- software published by ONIXLabs, including ONIXLabs Studio, ONIXPlayer and our open-source libraries in the [onix-labs](https://github.com/onix-labs) organisation on GitHub

## What's out of scope

- the third-party services we use, such as GitHub, Formspree, Calendly and our email provider. Please report issues in those directly to the provider.
- denial-of-service testing, spam, or social engineering of ONIXLabs or anyone else
- findings with no realistic security impact, such as missing security headers that can't be exploited, or reports from automated scanners that haven't been verified

## Testing responsibly

When investigating a vulnerability, please:

- only test systems and software within scope, and use test accounts and your own data wherever possible
- not access, change, delete or keep data that isn't yours. If you come across personal or confidential data, stop, and tell us what you found without keeping a copy.
- not degrade the service for anyone else
- give us a reasonable time to fix the issue before telling anyone else about it. We'll agree a disclosure date with you, normally within 90 days of your report.

## What you can expect from us

- We'll acknowledge your report within **five working days**.
- We'll investigate, keep you informed of our progress, and tell you when the issue is fixed.
- With your permission, we'll credit you when we publish the fix.

We don't run a paid bug bounty programme.

## Legal safe harbour

If you act in good faith and follow this policy, we won't take legal action against you or ask law enforcement to investigate you for your research. This applies only to our own systems and software; we can't authorise testing of third-party systems. If you're unsure whether something you plan to do is covered, ask us first.

## security.txt

This policy is also referenced by our `security.txt` file, at `/.well-known/security.txt`, so automated tools can find how to reach us.
