# Make App Responsive

## Information Gathered
- App uses React with Tailwind CSS
- HomePage has some responsive classes (md:flex-row, etc.)
- ChatPage: Container uses max-w-2xl, but floating phrases are absolutely positioned with fixed pixels
- ChatWindow: Fixed height h-96 for messages, input/button layout
- main.css: Fixed widths/heights (e.g., height: 400px, width: 70%)
- ChatPage.module.css: Fixed dimensions for floating phrases (260px x 110px)

## Plan
- Update ChatPage.jsx: Make container responsive with breakpoints, adjust floating phrases to scale or hide on mobile
- Update ChatWindow.jsx: Use responsive heights (vh units), improve mobile layout
- Update main.css: Replace fixed values with responsive units
- Update ChatPage.module.css: Make phrase bubbles responsive
- Minor tweaks to HomePage.jsx and CharacterSelector.jsx if needed

## Dependent Files
- [x] frontend/src/pages/ChatPage.jsx
- [x] frontend/src/components/ChatWindow.jsx
- [x] frontend/src/styles/main.css
- [x] frontend/src/styles/ChatPage.module.css
- [x] frontend/src/pages/HomePage.jsx (minor)
- [x] frontend/src/components/CharacterSelector.jsx (minor)

## Followup Steps
- Test responsiveness on different screen sizes
- Ensure touch-friendly on mobile
- Verify no layout breaks
