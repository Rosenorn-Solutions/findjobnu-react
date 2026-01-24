# FindJob.nu – Job Search Website

FindJob.nu is a modern job search web application built with **React**, **TypeScript**, and **Vite**. It allows users to search, filter, and browse job postings with a fast and responsive UI.

## Features

- 🔍 **Search** for jobs by keyword, location, and category  
- 📄 **Browse** paginated job listings with detailed descriptions  
- 🎨 **Modern UI** using [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)  
- ⚡ **Fast development** with [Vite](https://vitejs.dev/)  
- 🔗 **API integration** with [OpenAPI-generated client](https://findjob.nu/swagger/v1/swagger.json)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

To build for production:

```sh
npm run build
```

This generates pre-compressed assets and stable aliases under `dist/` so the production Node server can serve files without hard-coded hashes.

### Lint

To run ESLint:

```sh
npm run lint
```

### Production Preview

Run the same server that powers the live deployment:

```sh
npm run start
```

The app will be available at [http://localhost:4173](http://localhost:4173).

## Google Ads setup

- Use your chosen CMP (e.g., Google Funding Choices) for consent and ensure it integrates Google Consent Mode.
- Set environment variables before building:
  - `VITE_GOOGLE_ADS_CLIENT_ID` – AdSense/Google Ads client id (ca-pub-…).
  - `VITE_GOOGLE_ADS_JOBLIST_SLOT_ID` – slot id for inline job cards.
  - (Optional fallbacks) `VITE_GADS_CLIENT_ID` and `VITE_GADS_JOBLIST_SLOT_ID`.
- If IDs are missing, a placeholder ad card is shown instead of live ads.

## Project Structure

```
src/
  components/      # Reusable UI components (Navbar, Footer, JobList, SearchForm, etc.)
  views/           # Page components (Home, JobSearch, Profile, About, Contact, etc.)
  context/         # React context providers (User, Theme, Consent)
  findjobnu-api/   # OpenAPI-generated API client
  findjobnu-auth/  # OpenAPI-generated Auth client
  helpers/         # Utility functions and custom hooks
  locales/         # i18n translation files (da, en)
  assets/          # Static assets and illustrations
  __tests__/       # Unit and integration tests
  App.tsx          # Main app component
  main.tsx         # Entry point
  i18n.ts          # Internationalization setup
```

## Testing

Run all tests:

```sh
npm test
```

Run tests in watch mode:

```sh
npm run test:watch
```

Run tests with coverage:

```sh
npm run test:coverage
```

## Technologies

- [React](https://react.dev/) 19
- [Vite](https://vitejs.dev/) 6
- [TypeScript](https://www.typescriptlang.org/) 5.8
- [Tailwind CSS](https://tailwindcss.com/) 4
- [daisyUI](https://daisyui.com/) 5
- [React Router](https://reactrouter.com/) 7
- [i18next](https://www.i18next.com/) for internationalization
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Vitest](https://vitest.dev/) for testing
- [OpenAPI Generator](https://openapi-generator.tech/)

## License

MIT

---

© 2026 FindJob.nu. All rights reserved.
