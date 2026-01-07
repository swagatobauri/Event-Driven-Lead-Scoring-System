#Thank you so much for giving me the opportunity to work on this assignment.
I really appreciate the chance to showcase my understanding of backend system design and event-driven architecture through this project. While building this, I focused on writing clean, understandable code and learning how real-world systems handle events, queues, and scalability.
I’ve genuinely enjoyed working on this assignment and learning from it, and I hope this project gives a clear idea of my thought process and approach as a developer.

// built with ❤️ and lots of console.log()


# Event-Driven Lead Scoring System

A real-time, scalable application to evaluate and rank sales leads based on interactions. Built with Node.js, React, Bull, and Redis.

## Overview
This system demonstrates an **event-driven architecture** where lead scores are continuously recalculated based on incoming events (e.g., page views, clicks). It ensures **idempotency** (no duplicate scores) and **ordering**, processed asynchronously via a worker queue.

## Features

### Backend (Node.js)
- **Event Ingestion**: `POST /api/events`, `POST /api/events/batch`.
- **Queue Processing**: Bull (Redis) ensures async, non-blocking execution.
- **Scoring Engine**: Configurable rules(Max 1000).
- **Socket.IO**: Pushes updates to frontend immediately.

### Frontend (React)
- **Unified Dashboard**: Single-page view for Stats, Leads, and Settings.
- **Real-time**: Charts and tables update live without refresh.
- **Simulation**: Built-in "Autopilot" to generate random traffic for testing.
- **Deep Insights**: Click any lead to see a timeline of every event and a score history graph.

## Prerequisites
- **Node.js**: v18+
- **MongoDB**: Local instance running on 27017.
- **Redis Server**: Required for the event queue.
    - **Mac**: `brew install redis` then `brew services start redis`
    - **Windows**: [Install WSL or Memurai](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)
    - **Linux**: `sudo apt-get install redis-server`

## Installation & Run

1.  **Clone the Repository**
2.  **Pre-flight Check** (Optional):
    Ensure ports 3000 and 5173 are free to avoid "Address in use" errors.
    ```bash
    # Kill any process running on these ports
    npx kill-port 3000 5173
    ```
3.  **Start Backend** (Installs Bull, Express, etc.):
    ```bash
    npm install
    npm start
    ```
    *Runs on Port 3000.*

3.  **Start Frontend**:
    ```bash
    cd frontEnd
    npm install
    npm run dev
    ```
    *Runs on Port 5173.*

4.  **Open Dashboard**: Go to `http://localhost:5173`.

## How to Verify (Simulation)

1.  **Auto Simulation**:
    - Click **"Start Simulation"** on the Dashboard top-right.
    - Watch "Total Events" count rise and Lead Scores update live.
2.  **Manual Test**:
    - Go to **Settings** section.
    - Upload a Batch JSON of events.
3.  **Lead Details**:
    - Click any row in the **Active Leads** table to view the full event history log.

## Resetting the System
If you want to clear all scores and events to start fresh:
1.  Stop the server (Ctrl+C).
2.  Run the reset script:
    ```bash
    node reset_scores.js
    ```
3.  Restart the server (`npm start`).

## Architecture Highlights
- **Decoupling**: The API accepts events instantly (202 Accepted) and offloads processing to a Worker.
- **Resilience**: Redis backs the queue; if the server crashes, jobs persist.
- **Auditability**: `ScoreHistory` collection tracks *every* point change and reason.
