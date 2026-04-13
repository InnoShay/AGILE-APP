# Comprehensive Project Report: PRISMA Fest 2025

**Date:** April 2026
**Project Target:** SRM University Sonepat Fest Management Platform

---

## 1. Executive Summary
The **PRISMA Fest** project is an ambitious undertaking to entirely modernize the operational backbone of SRM University Sonepat's premier annual festival. Aiming far beyond a typical student project, the platform rivals production-grade infrastructure found in industry-leading SaaS and tech conference applications (drawing inspiration from platforms like Linear and Stripe). 

This document serves as a holistic deep-dive into the architectural decisions, operational flows, aesthetic principles, and backend topology that drive PRISMA.

---

## 2. Platform Architecture (HLD)

The system relies heavily strongly on decoupled monolithic structures to maintain rapid throughput without premature microservice overhead.

![High Level Architecture](/Users/demo/.gemini/antigravity/brain/2d79ce7d-b005-459e-b90d-8b27a892c6b0/high_level_arch_1776062027332.png)

### Key Infrastructural Details:
*   **The Client Application:** Built explicitly on Vite and React 18, strictly typing all schemas utilizing the Zod validation library. Instead of heavy state libraries, we employed Zustand for lightweight state management (specifically UI/Dashboard layout sidebars and Authentication Stores).
*   **API Service Layer:** The Node.js/Express monolith exposes 10 distinct robust REST routes. Security measures are rigid: Helmet.js sets appropriate HTTP headers, CORS isolates origin requests, and everything traverses through an Async Handler wrapper to catch backend panic states seamlessly.
*   **Data Models:** Using Prisma ORM, we defined 8 deeply connected models allowing complex cascading queries (e.g. querying an event pulls its nested schedule mappings, associated sponsorship tiers, and related organizer metadata natively). 

---

## 3. The Interactive Logic & User Journey

Understanding the distinct pathways different users take is critical to navigating the platform's utility. 

![User Flowchart Outline & Process](/Users/demo/.gemini/antigravity/brain/2d79ce7d-b005-459e-b90d-8b27a892c6b0/user_flowchart_1776061968548.png)

### 3.1 The Attendee Path
Attendees begin on the public Landing route—welcomed immediately by a showstopper hero screen with an active countdown. Through the Events Browser, they query over 10 distinct categories. Upon registration, instead of physical tokens, an exclusive QR code is strictly encoded representing their ticket type (General vs VIP) which lives dynamically under their `/tickets` dashboard. Real-time push notifications intercept their dashboard via Socket.io alerting them of timeline shifts.

### 3.2 The Organizer Operations
The friction of event planning is reduced drastically. A multi-step form handles event initiation. Behind the scenes, the Organizer dashboard visualizes their ticket capacity metrics mapping explicitly to individual event tables. At the physical venue, the Organizer leverages a digital scanner built into their dashboard pointing strictly at validating user QR payloads to instantly sync backend capacity.

### 3.3 The Guardian Level (Admin)
Admins have sweeping oversight. If an event violates guidelines, an immediate cancellation trigger cascades warnings down to all registered attendee accounts effortlessly. The admin's visual charts are macroscopic: observing traffic load, tracking daily active registration hits across the system timeline, and adjusting overall sponsor placements.

---

## 4. Visual Identity Principles
PRISMA's branding strays from sterile web templates. We adhered strictly to the "Neon Ink on Black Stone" constraint. 

*   **Color Scale:** Obsidian Black `#0A0A0F` base layer; accents powered by Electric Crimson `#FF2442` and Muted Gold `#C9A84C`.
*   **Typography Hierarchy:** Uncompromising use of `Bebas Neue` for dominating display headings interacting closely with geometric data structures printed in `DM Mono`. 
*   **Motion Framework:** The platform relies heavily on Framer Motion applying staggered list delays, heavy text clipping, marquee tickers, and spring-bounced layout drawers resulting in a tactile digital experience.

## 5. Conclusion
By fusing together modern runtime tech stacks (React+Node+Prisma), bulletproof automated validation schemas (Zod), and aggressive styling philosophies, PRISMA Fest stands as a world-class standard for university event orchestration architectures moving forward.
