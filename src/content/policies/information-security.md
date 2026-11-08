---
title: "Information Security"
shortTitle: "Information Security"
description: "An overview of how ONIXLabs protects its systems, its code and the information clients trust it with, and how to ask for more detail or report an issue."
group: trust
order: 1
path: /Legal/Information-Security
effective: 2026-11-08
updated: 2026-11-08
---

Our clients trust us with their code, their systems and sometimes their data. This page gives an overview of how we protect them. It deliberately doesn't describe our internal procedures in detail; we're happy to go into more depth with clients and prospective clients under confidentiality.

## Our approach

We keep security proportionate to the size of the company and the risks we handle, and we build it into how we work every day rather than adding it at the end. Our director, Matthew Layton, is responsible for information security.

## Access

- **Multi-factor authentication** is required on all our business accounts, including email, source control, cloud services and package registries.
- Access to systems and information is limited to the people who need it for their work.

## Secure development

- **Code is reviewed and tested** in continuous integration before it's released.
- **Dependencies are monitored** with automated alerts for known vulnerabilities, so we can update affected components promptly.
- **Secrets stay out of source code.** Credentials and keys are held in a secrets manager or the relevant platform's vault, never committed to repositories, with access limited to what each person and system needs.

## Client information

When we handle client code, systems or data, we do so only for the work we've been engaged for, and in line with our agreement with that client. Where we process personal data on a client's behalf, we do so under a data processing agreement that meets the requirements of Article 28 of the UK GDPR. Our [Privacy Policy](/Legal/Privacy) covers the personal data we handle for ourselves.

## Certifications

ONIXLabs doesn't currently hold a formal security certification such as ISO/IEC 27001 or Cyber Essentials. If your procurement process needs evidence of our practices, we'll gladly complete a reasonable security questionnaire.

## Reporting a vulnerability

If you believe you've found a security vulnerability in our website or software, please report it under our [Responsible Disclosure Policy](/Legal/Responsible-Disclosure).

## Questions

For security questions, or to ask for more detail about our practices, email [admin@onixlabs.io](mailto:admin@onixlabs.io).
