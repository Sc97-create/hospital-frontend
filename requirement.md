# React App Requirements

## Prerequisites

- Install Node.js (recommended `18.x` or newer)
- npm is included with Node.js
- Ensure `git` is available if cloning the repository

## Required tools

- Node.js (recommended `18.x` or newer)
- npm (included with Node.js)
- Optional: `yarn` or `pnpm` if preferred, but the project uses npm scripts

## Setup steps

1. Open terminal in the project root.
2. Install dependencies:
   - `npm install`
3. Start the development server:
   - `npm run dev`
4. Build the project for production:
   - `npm run build`
5. Run lint checks:
   - `npm run lint`

## Runtime dependencies

- `react`
- `react-dom`
- `react-router-dom`
- `antd`
- `axios`
- `@tanstack/react-query`

## Development dependencies

- `vite`
- `typescript`
- `@vitejs/plugin-react`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `typescript-eslint`

## Project configuration files

- `package.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `eslint.config.js`
- `README.md`

## Notes

- This project is built with Vite and TypeScript.
- The app entry point is `src/main.tsx`.
- Routes and protected pages are configured in `src/App.tsx`.
- Keep dependency versions aligned with the `package.json` file.


# static changes to dynamic
1) check complete frontend and replace static organisation id from local storage organisationID
2) create fetchOrganisationID and fetchUserID function, which will fetch organisationID from local storage and replace wherever necessary
3) check fonts are same throughout application
4) check CTA button like "add patient" and other buttons color is same throughout the application
5) add ipad responsiveness to all the pages
6) we have added profile photo with random url, replace it with user account icon
7) *** seperate files with folder structure *** => ignore fyi
8) disable suppliers, bed arrangement button
