# Canhina Statement Submission

[Visit the published website](https://canhina.netlify.app)

Canhina is an interactive React experience presented as a fictional immigration statement-submission portal. Visitors watch a personal statement take shape, correct highlighted language, review AI-generated revisions, and submit the finished statement through a deliberately bureaucratic interface.

The project explores how an apparently helpful application process can standardize personal stories. Its interface combines animated typing, inline corrections, terminal logs, and a submission receipt.

## Features

- Animated statement composition with intentional pauses, corrections, and deletions
- Interactive standardization suggestions for formal language
- AI-generated continuation suggestions that can be accepted or dismissed
- Submission receipt with a generated timestamp
- Terminal-style audit sequence after starting over
- Shared submission count through a Netlify Function and Netlify Blobs
- Local storage fallback when the shared endpoint is unavailable

## Tech Stack

- React 19
- TypeScript
- Vite
- `react-type-animation`
- Netlify Functions
- Netlify Blobs

## Getting Started

### Requirements

- Node.js and npm
- A Netlify environment for shared submission-count persistence (optional for local UI development)

### Install and run locally

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal, usually `http://localhost:5173`.

For the Netlify Function to be available during local development, run the site through the Netlify CLI instead:

```bash
npx netlify dev
```

Without the function, submissions still work locally using the browser's `localStorage` value.

## Available Scripts

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite development server               |
| `npm run build`   | Type-check and create a production build        |
| `npm run lint`    | Run ESLint                                      |
| `npm run preview` | Preview the production build locally            |
| `npx netlify dev` | Run the Vite app with Netlify Functions enabled |

## Deployment

The project is configured for Netlify through [`netlify.toml`](netlify.toml). Deploy the repository as a Netlify site with the following settings:

- Build command: `npm run build`
- Publish directory: `dist`

The rewrite in [`netlify.toml`](netlify.toml) maps `/api/submission-count` to the `submission-count` Netlify Function. The function stores the shared count in a Netlify Blobs store named `canina`.

After deployment, verify that the site can read and update `/api/submission-count`. Netlify Blobs must be available to the deployed function for the shared count to persist between visitors.

## Project Structure

```text
src/
├── App.tsx                         Application state and submission flow
├── App.css                         Page-level styles
├── Components/
│   ├── Header/                     Portal header
│   ├── MainPanel/                  Statement workflow
│   ├── TextBox/                    Animated statement and suggestions
│   ├── SubmissionComplete/         Submission receipt
│   ├── TerminalLog/                Audit log after submission
│   ├── TextEffect/                 Visual progress effects
│   └── FlickerScreen/              Transition effect
└── index.css                       Global styles

netlify/
└── functions/submission-count.ts   Shared submission counter
```

## Development Notes

The statement content and animation timing live in [`src/Components/TextBox/TypingContent.ts`](src/Components/TextBox/TypingContent.ts). Component-specific styles sit beside their components, making the visual experience easy to tune without changing the application flow.

The submission counter uses three API operations:

- `GET /api/submission-count` reads the shared count
- `POST /api/submission-count` increments the count
- `PUT /api/submission-count` synchronizes a locally stored count

If the API cannot be reached, the app keeps the count in `localStorage` under `canina.totalSubmissions`.
