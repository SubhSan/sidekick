- [x] **1.1: Project Initialization**
  - Run `pnpm create wxt@latest sidekick --template react-ts` inside the workspace.
  - Install dependencies: `pnpm install fuse.js idb dayjs @mozilla/readability lucide-react`.
  - Install devDependencies: `pnpm install -D @types/chrome @tailwindcss/vite @vitejs/plugin-react @wxt-dev/module-react jsdom vitest @vitest/ui`.
- [x] **1.2: Extension Configuration**
  - Replace `wxt.config.ts` contents exactly with the config specified in PRD.
- [x] **1.3: Design System Base**
  - Create `assets/tailwind.css` with `@import "tailwindcss";` and theme variables.
- [x] **1.4: Single Source of Truth Storage**
  - Create `lib/storage.ts` with full storage schema.
- [x] **1.5: Extension Messaging Interface**
  - Create `lib/messages.ts` with `Msg` union, `sendMsg`, `registerHandler`, etc.
- [x] **1.6: Library File Stubs**
  - Create all `lib/` stubs: `greeting.ts`, `focus.ts`, `theme.ts`, `wallpaper.ts`, `weather-pure.ts`, `weather.ts`, `tasks-pure.ts`, `tasks.ts`, `tabs-pure.ts`, `tabs.ts`, `bookmarks-pure.ts`, `bookmarks.ts`, `readlater.ts`, `command.ts` (full logic), `groq-pure.ts`, `groq.ts`, `router.ts`, `prompts.ts`.
- [x] **1.7: Components & Entrypoints Stubs**
  - Create `components/ThemeProvider.tsx` and all component stubs.
  - Stub all entrypoint folders (`newtab`, `popup`, `options`, `reader`, `blocked`).
  - Create `entrypoints/background.ts` and `entrypoints/content.ts` stubs.
- [x] **1.8: Compilation and Installation Check**
  - Run `pnpm build` and verify that the command exits successfully.

## Phase 2: New Tab Shell + Theme
- [x] **2.1: Theme Engine Implementation**
  - Implement `lib/theme.ts` and `components/ThemeProvider.tsx`

## Phase 3: Wallpaper System
- [x] **3.1: Wallpaper Storage Interface**
  - Implement `lib/wallpaper.ts`
- [x] **3.2: Wallpaper Core UI**
  - Build `components/Wallpaper.tsx`
- [x] **3.3: Weather Scene State Matching**
  - In `components/Wallpaper.tsx`, add `getWeatherScene`
- [x] **3.4: Animated Weather Backgrounds**
  - Build `WeatherBackground` wrapper matching WMO codes to background canvas scripts
- [x] **3.5: Layout Alignment & Verification**
  - Verify that `body` and `#root` styles are strictly `background: transparent`.
  - Test by manually editing the `local:weatherCache` key in DevTools to various WMO codes

## Phase 4: Weather Card
- [x] **4.1: Pure Weather Functions**
  - Implement `lib/weather-pure.ts` (WMO_MAP, getWmoEntry, adviceFor, celsiusToFahrenheit, formatTemp)
- [x] **4.2: Weather API and Cache Client**
  - Implement `lib/weather.ts` (fetchWeather, getCachedWeather, forceRefreshWeather, geocodeCity)
- [x] **4.3: Weather Card UI State Machine**
  - Build `components/WeatherCard.tsx`
- [x] **4.4: Card Presentation**
  - Render the Weather card in bottom-right layout
- [x] **4.5: Verification**
  - Build and run the project. Toggle location, search for a city manually.

## Phase 5: Task Panel + Focus Mode
- [x] **5.1: Task Splitting and Pruning**
  - Implement `lib/tasks-pure.ts`
  - Implement `lib/tasks.ts`
- [x] **5.2: Task Panel Component**
  - Build `components/TaskList.tsx`
- [x] **5.3: Focus Mode Toggle UI**
  - Add Focus toggle button and update layout visibility.
- [x] **5.4: Background Site Block Router**
  - Implement `applyFocusRules` in `background.ts` using `chrome.declarativeNetRequest`.
- [x] **5.5: Last Visited URL Tracker**
  - Add `chrome.tabs.onUpdated` listener in `background.ts`
- [x] **5.6: Focus Pass Bypass Alarm**
  - Implement `FOCUS_PASS` handler and `chrome.alarms` in `background.ts`.
- [x] **5.7: Blocked Landing Page**
  - Build `entrypoints/blocked/App.tsx`.
- [x] **5.8: Pass Countdown Bar**
  - Implement countdown bar in `content.ts`.
- [x] **5.9: Verification**
  - Compile the build, block a site, request a pass, and test.

## Phase 6: Bookmarks Panel
- [x] **6.1: Bookmarks Panel Shell**
  - Create `components/BookmarksPanel.tsx`.
- [x] **6.2: Node Tree Mapping & Sorting**
  - Implement `getTree` parsing and customized ordering.
- [x] **6.3: Drag-and-Drop Reordering**
  - Attach HTML5 drag-and-drop to bookmarks and save order to `store.bookmarkOrder`.
- [x] **6.4: Search and Favicons**
  - Embed Fuse.js search query and fallback favicons.
- [x] **6.5: Live Bookmark Observers**
  - Attach `chrome.bookmarks` event listeners to trigger reload.
- [x] **6.6: Integration & Verification**
  - Mount `<BookmarksPanel />` in `entrypoints/newtab/App.tsx`.
  - Compile and test.
## Phase 7: Command Search + Popup
- [x] **7.1: Pure Tab Actions**
  - Implement `lib/tabs-pure.ts`
- [x] **7.2: Tab Operations**
  - Implement `lib/tabs.ts`
- [x] **7.3: Bookmark Tagging**
  - Implement `lib/bookmarks-pure.ts` and `lib/bookmarks.ts`
- [x] **7.4: Command Search Box**
  - Implement `components/CommandSearch.tsx`
- [x] **7.5: Popup Navigation Shell & Core Pages**
  - Build `entrypoints/popup/App.tsx` (Tabs, Bookmarks, Ask, Focus, Settings)
- [x] **7.6: Router Observers & Context Menus**
  - Wire message handlers and context menu hooks

## Phase 8: Content Script + Floating Assistant + Reader
- [x] **8.1: Read Later Storage Handler**
  - Implement `lib/readlater.ts`
- [x] **8.2: Content Script Shadow DOM Mount**
  - Implement `entrypoints/content.ts`
- [x] **8.3: Floating Panel Actions & Tooltips**
  - Build floating toolbar, Explain Selection, and Jargon tooltips
- [x] **8.4: Reader Mode Page**
  - Build `entrypoints/reader/App.tsx` and extraction logic

## Phase 9: AI Layer
- [x] **9.1: Groq API Client & Fallback Router**
  - Implement `lib/groq-pure.ts`, `lib/groq.ts`, `lib/router.ts`
- [x] **9.2: Prompt Repository**
  - Implement `lib/prompts.ts`
- [x] **9.3: AI Background Handlers**
  - Implement `AI_SPLIT`, `AI_GROUP`, `AI_TAG`, `AI_QUERY_EXPAND`, `AI_EXPLAIN`, `AI_JARGON`, `AI_SUMMARIZE`, `AI_ASK_TABS`

## Phase 10: Polish + Edge Cases
- [x] **10.1: Too-Many-Tabs Nudge**
  - Implement background nudge notifications
- [x] **10.2: Pomodoro & Session Management**
  - Wire timers and persistence
- [x] **10.3: Unit & Integration Verification**
  - Vitest test suite passing with Node.js v22.16.0
  - Extension build clean and unpacked ready

