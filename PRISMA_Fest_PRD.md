# PRISMA Fest 2025: Product Requirement Document (PRD)

## 1. Product Overview
**PRISMA Fest** is the official digital management platform for the annual cultural and technical fest of SRM University Sonepat. The application is designed to function as an end-to-end event management ecosystem spanning discovery, ticketing, administration, and real-time announcements. The design identity relies on an "editorial brutalism" aesthetic featuring an overarching "Neon Ink on Black Stone" theme.

## 2. Problem Statement
Managing large-scale university festivals generally relies on heavily fragmented systems: physical ticketing, unorganized social media blasts for scheduling, and chaotic spreadsheets for registration and check-ins. PRISMA Fest consolidates these functions into a single premium platform that gives administrators tight control, organizers powerful promotion tools, and attendees a seamless digital experience.

## 3. Target Audience
* **Students/Attendees:** Primary users browsing events, paying for tickets, receiving push notifications, and presenting QR codes for entry.
* **Organizers/Coordinators:** Faculty and student leads creating events, tracking registrations in real-time, scanning QR tickets at the door, and handling feedback.
* **Administrators:** System operators monitoring holistic fest analytics, distributing platform-wide emergency announcements, managing users/bans, and integrating sponsor branding.

## 4. Key Features & Requirements

### 4.1 Authentication & Profile
* **Requirement:** Secure multi-role authentication (Admin, Organizer, Student).
* **Details:** JWT-based access tokens with strict refresh-token rotation. Users can update their names, student IDs, avatars (via Cloudinary), and passwords safely.

### 4.2 Event Discovery & Registration
* **Requirement:** Public-facing dynamic event catalog.
* **Details:** Students can filter events by category (Technical, Cultural, Sports, etc.) and cost variables (Free/Paid). Paid ticketing must mock-integrate Stripe for checkout flow scenarios.

### 4.3 Digital Ticketing & Check-In
* **Requirement:** Cashless digital check-in procedure.
* **Details:** Upon registration, users receive an encoded QR code ticket pointing to a signed JWT payload. Organizers use a scanning interface on their phones to instantly validate tickets and increment event attendee counts.

### 4.4 Live Interaction
* **Requirement:** Instant status updates to prevent attendee confusion during sudden schedule updates.
* **Details:** Built-in Socket.io pushes out Urgent/Normal priority announcements globally across the platform.

### 4.5 Analytics & Dashboards
* **Requirement:** Clear tracking of performance metrics.
* **Details:** Chart-rich (Recharts) dashboards displaying category distributions, ticket sale revenues, individual event capacities, and daily registration telemetry.

## 5. Non-Functional Requirements
* **Design & Aesthetics:** Extremely specific UI parameters. Base `Obsidian Black` (#0A0A0F) heavily utilizing noise textures, layered glass-morphism, and accentuating borders with `Electric Crimson` (#FF2442) and `Muted Gold` (#C9A84C). Use of Google Fonts `Bebas Neue` and `DM Mono` strictly for display texts and data readouts.
* **Performance Setup:** Global Axios interceptors handling unauthorized token drops seamlessly.
* **Technology Stack:** React 18, Vite, Node.js, Express, strict mapped PostgreSQL/SQLite structures using Prisma ORM.

## 6. Future Scope
* Location-based map tracking for stage venues.
* Gamification mechanics (badges for attending events across different categories).
* Automated waitlists for heavily trafficked workshops.
