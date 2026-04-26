<p align="center">
  <img src="./public/images/Logo.jpeg" alt="TimeEx banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/genre-historical%20market%20sim-0f172a?style=for-the-badge" alt="Historical market sim" />
  <img src="https://img.shields.io/badge/status-playable%20prototype-f59e0b?style=for-the-badge" alt="Playable prototype" />
</p>

<p align="center">
  <strong>TimeEx</strong> is an interactive financial-history game where you step into different market eras, trade through uncertainty, and balance portfolio decisions with personal life events.
</p>

## Overview

TimeEx turns financial history into a playable experience. Each run begins by choosing a character and stepping into a historical market scenario, combining investing, narrative choices, and timed events in one game loop.

The current prototype follows **Kira Light** through the **dot-com bubble** with **$5,000** in starting capital, but the project is designed to expand with more playable characters and more historical scenarios over time.

The project mixes **historical market data**, **narrative scenario framing**, **portfolio management**, and **decision-based events** into one experience. Instead of only reading about market history, the player lives through it.


## Gameplay Flow

1. Land on the animated TimeEx intro screen.
2. Choose a character and review their background.
3. Select a historical scenario.
4. Read the preview page to understand the market context.
5. Enter the main simulation, trade assets, and react to timeline events.
6. Try to protect and grow your portfolio while the crash unfolds.

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/react-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwind%20css-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

- **Framework:** Next.js 16 with the App Router
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4 plus page-level styling where needed
- **State & persistence:** React state and `localStorage`
- **Data layer:** Local JSON market datasets mapped into timeline-aware asset views

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Check the codebase with ESLint |

## Project Structure

```text
app/
  page.tsx              # landing page
  character/page.tsx    # character selection
  scenario/page.tsx     # scenario selection
  preview/page.tsx      # scenario preview and historical framing
  main/
    components/         # trading UI, sidebar, timeline, notifications, event modals
    data/               # historical market datasets
    utils/              # market logic, wallet persistence, save state, timeline helpers
public/
  images/               # logos, background art, event art, UI assets
```

---

<p align="center">
  <img src="./public/images/Logo_sep.png" alt="TimeEx logo" width="84" />
</p>
