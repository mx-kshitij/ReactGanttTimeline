## Quick context

This repository is a Mendix "pluggable widget" written in TypeScript + React. The widget entry points and Mendix-specific wiring live under `src/` and typed interfaces are generated into `typings/` from the widget XML (`src/ApacheGanttTimelineChart.xml`). Node >=16 is required (see `package.json`).

## What I need to know to be productive

- Build & dev scripts (copyable):
  - Install deps: `npm install` (if using npm v7, use `npm install --legacy-peer-deps`).
  - Start studio/server watch: `npm start` (runs `pluggable-widgets-tools start:server`).
  - Start web dev (local web bundle): `npm run dev` (runs `pluggable-widgets-tools start:web`).
  - Build production bundle: `npm run build` (runs `pluggable-widgets-tools build:web`).
  - Release: `npm run release` (runs `pluggable-widgets-tools release:web`).
  - Lint: `npm run lint` (`pluggable-widgets-tools lint`) and `npm run lint:fix`.

- Key files & responsibilities:
  - `src/ApacheGanttTimelineChart.tsx` — runtime component exported to Mendix. Uses props from `typings/ApacheGanttTimelineChartProps.d.ts` and imports `./ui/ApacheGanttTimelineChart.css`.
  - `src/ApacheGanttTimelineChart.editorPreview.tsx` — Studio preview renderer and `getPreviewCss()` which uses `require(...)` to include CSS in the Mendix preview.
  - `src/ApacheGanttTimelineChart.editorConfig.ts` — property visibility, `getProperties(...)`, and optional `check(...)` / `getPreview(...)` helpers for Studio.
  - `src/ApacheGanttTimelineChart.xml` — widget metadata and property definitions (source of truth for generated typings).
  - `typings/ApacheGanttTimelineChartProps.d.ts` — auto-generated types from the XML; do NOT edit manually (warning at top).
  - `src/components/*` — small presentational pieces (e.g. `HelloWorldSample.tsx`).

## Patterns and conventions to follow

- Generated typings: `typings/*.d.ts` come from the `.xml` and will be overwritten. If you need to change props, edit the XML and regenerate via the Mendix tooling.
- Preview CSS inclusion: Editor preview uses `require("./ui/ApacheGanttTimelineChart.css")` in `getPreviewCss()` — follow this pattern when adding preview styles.
- Use the `ApacheGanttTimelineChartContainerProps` / `PreviewProps` shapes from `typings/` when changing function signatures. Keep exported names and prop keys stable to avoid mismatch with Mendix runtime.
- tsconfig extends `@mendix/pluggable-widgets-tools/configs/tsconfig.base` — avoid changing base compilation targets unless necessary.
- React/resolution pins: `package.json` contains resolutions/overrides for React 18.2.0 — respect these to avoid dependency conflicts in the Mendix toolchain.

## Common tasks & examples

- To make a conditional studio property: edit `getProperties` in `src/ApacheGanttTimelineChart.editorConfig.ts`.
  Example: delete or mutate `defaultProperties` based on `_values` before returning.
- To adjust preview appearance: edit `preview()` in `src/ApacheGanttTimelineChart.editorPreview.tsx` or implement `getPreview(...)` in `editorConfig.ts`.
- To expose a new widget property:
  1. Add the property to `src/ApacheGanttTimelineChart.xml` under `<properties>`.
  2. Regenerate typings (tooling does this during build/watch); verify `typings/*.d.ts` changed.
  3. Consume the prop in `src/ApacheGanttTimelineChart.tsx` and preview files.

## Errors & pitfalls

- Node version: ensure Node >=16 (package.json engines). Wrong Node version commonly causes pluggable-widgets-tools errors.
- Typings overwritten: never hand-edit `typings/*.d.ts`. Any manual change will be lost.
- CSS for preview must be required (not imported) in preview helper to be picked up by Mendix preview bundling.

## Where to look for more context

- `package.json` — scripts, devDependencies, and `config` keys (`projectPath`, `mendixHost`, `developmentPort`).
- `src/*.tsx` and `src/components/` — component structure and example patterns.
- `src/ApacheGanttTimelineChart.xml` — widget metadata, id, and property definitions (source for generated typings).
- https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/ contains details on all supported property types and their corresponding TypeScript types. This is useful when adding new properties to the widget or understanding how existing properties are typed.
- https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/ contains details on the client APIs available to pluggable widgets.
- https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/ contains details on working with list and grid values in pluggable widgets.
- https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-studio-apis/ contains details on the Studio APIs available to pluggable widgets for preview in Studio Pro.
- https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-config-api/ contains details on the configuration API for pluggable widgets. A pluggable widget's configuration module allows for several modeler experience improvements. For example, you can hide widget properties based on conditions, add consistency checks to validate the widget's configuration, and customize your widget's appearance in Structure mode.

If anything above is unclear or you want me to expand an area (build flow, adding a prop, or preview authoring), tell me which part and I will iterate.
