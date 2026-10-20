# Assignment 10 – AI Pair Programming with Generative AI
**Course:** Program Elective V (Prompt Engineering) · Walchand Institute of Technology, Solapur · Dept. of IT

Projects built:
- **Task 1 – PlaceMate**: Placement Preparation Portal (website)
- **Task 2 – FocusFlow**: Study Timer + To-Do (Chrome Extension)

---

## Folder structure

```
project/
├── website/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── extension/
    ├── manifest.json
    ├── popup.html
    ├── popup.css
    ├── popup.js
    ├── background.js
    └── icons/ (icon16.png, icon48.png, icon128.png)
```

---

# TASK 1 – Website (PlaceMate)

## Step 1: Pick the idea
Placement Preparation Portal. It fits the syllabus list and lets you show many interactive features.

## Step 2: Run it locally
1. Open the `website` folder in **VS Code**.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server** (or just double-click `index.html`).

## Step 3: What the website contains
| Section | Feature |
|---|---|
| Hero | Animated counters, call-to-action buttons |
| Roadmap | Tabs for DSA, Aptitude, HR, Resume |
| Tracker | Checklist with progress bar (saved with localStorage) |
| Quiz | 10 MCQs, instant feedback, score, best score |
| Mock Interview | Random question + 2-minute countdown timer |
| Resources | Filterable cards (Coding / Aptitude / Interview) |
| Contact | Form with JavaScript validation |
| Extras | Dark mode, mobile hamburger menu, back-to-top, toast messages |

## Step 4: Test it (do this and note results)
- [ ] Click every nav link – page scrolls to the section.
- [ ] Switch dark/light mode, refresh – theme is remembered.
- [ ] Tick tracker boxes, refresh – ticks are still there.
- [ ] Finish the quiz – score screen appears.
- [ ] Mock interview: New question → Start timer → Reset.
- [ ] Submit contact form empty, then with a bad email, then valid.
- [ ] Press **F12 → Toggle device toolbar** and test at 375px (phone) width.

## Step 5: Modify the AI code (the assignment requires this)
Make **at least 3 changes** yourself and write them in your report. Ideas:
1. Change the colours in `:root` in `style.css` (`--primary`, `--primary-2`).
2. Replace "Walchand Institute of Technology" pill text with your own details.
3. Add 5 more quiz questions in the `questions` array in `script.js`.
4. Change the mock-interview timer from 120 to 180 seconds (`left = 120` → `180`, and `02:00` in HTML).
5. Add your own resources to the `resources` array.

## Step 6: Take screenshots
Take full-page screenshots: Hero, Roadmap, Tracker (with some ticks), Quiz, Mock interview, Resources, Contact, Dark mode, Mobile view.
Tip: Chrome DevTools → `Ctrl+Shift+P` → type "screenshot" → **Capture full size screenshot**.

## Step 7 (optional): Publish online
Upload the `website` folder to **GitHub Pages** or **Netlify Drop** (drag and drop the folder) to get a live URL for "Working website".

---

# TASK 2 – Chrome Extension (FocusFlow)

## Step 1: Pick the problem
Students lose focus. FocusFlow gives a Pomodoro timer (25/5/15 min) and a task list.

## Step 2: Install in Chrome (Developer Mode)
1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the `extension` folder (the one containing `manifest.json`).
5. Click the 🧩 puzzle icon → **pin FocusFlow**.

After editing any file, click the **reload ↻** icon on the extension card.

## Step 3: How the files work together
| File | Role |
|---|---|
| `manifest.json` | Manifest V3 config: name, icons, popup, permissions (`storage`, `alarms`, `notifications`), service worker |
| `popup.html` / `popup.css` | The UI shown when you click the icon |
| `popup.js` | Timer logic, mode switching, task list, saves state in `chrome.storage.local` |
| `background.js` | Service worker: keeps an alarm running when the popup is closed, updates the badge, sends the notification |

Key idea: the timer stores an **end time** (not a counter), so it stays correct even when the popup closes.

## Step 4: Test it
- [ ] Click Start, close the popup, reopen – time continues.
- [ ] Badge on the icon shows minutes left.
- [ ] Temporarily change `data-min="25"` to `data-min="1"` in `popup.html` to test the completion notification quickly (change it back after).
- [ ] Add, tick and delete tasks; close and reopen – tasks persist.
- [ ] Switch to Short break – the colours turn green.
- [ ] Open `chrome://extensions` → **Errors** button should show no errors.
- [ ] Right-click the popup → **Inspect** to see console messages.

## Step 5: Document your changes to AI code
Examples (write these in the report):
1. The AI first wrote a CSS line with an invalid gradient stroke on the progress ring (`stroke:url(#g)`). It was removed because no gradient `<defs>` existed.
2. The AI first counted the finished session in both the popup and the background script (double count). We changed the popup so only `background.js` counts it.
3. Your own change: e.g. change default focus time to 50 minutes, or rename the extension.

## Step 6: Screenshots to take
`chrome://extensions` page showing it loaded, popup in Focus mode, popup in Break mode, task list with items, badge on the toolbar icon, desktop notification, manifest.json in editor.

---

# List of AI Prompts Used

## Task 1 – Website
1. "I'm a final-year IT student. Suggest 5 practical website ideas for a Prompt Engineering assignment and recommend one with interactive features."
2. "Design the page structure for a Placement Preparation Portal: sections, navigation, and the interactive feature for each section."
3. "Generate semantic HTML5 for a single-page site with hero, roadmap tabs, progress tracker, quiz, mock interview timer, resources and contact form."
4. "Write modern CSS with CSS variables, a purple gradient theme, card layouts, hover animations and a dark mode."
5. "Make the layout fully responsive with a mobile hamburger menu using media queries."
6. "Write vanilla JavaScript for a 10-question quiz with instant feedback, score and best-score saved in localStorage."
7. "Add a progress tracker with checkboxes that saves in localStorage and updates a progress bar."
8. "Add a mock interview feature: random question and a 2-minute countdown timer that turns red in the last 15 seconds."
9. "Add contact form validation for name, email format and message length, with a toast message."
10. "My nav link highlight doesn't change while scrolling. Here is my code – find the bug."
11. "Improve the UI: better spacing, typography with Inter font, glass-effect navbar, animated stat counters."
12. "Review my code for accessibility issues (aria labels, contrast, focus states) and fix them."

## Task 2 – Chrome Extension
1. "Suggest 5 useful Chrome extension ideas for students and pick one that can be built with HTML, CSS and JS only."
2. "Explain the file structure of a Manifest V3 Chrome extension and what each file does."
3. "Create manifest.json (Manifest V3) for a study timer extension with popup, service worker, storage, alarms and notifications permissions."
4. "Design a clean dark popup UI (340px wide) with a circular progress timer, mode tabs and a to-do list."
5. "Write popup.js for a Pomodoro timer with Focus / Short break / Long break modes that saves state in chrome.storage.local."
6. "Write a background service worker using chrome.alarms to show a notification when the timer ends and a badge with minutes left."
7. "The timer resets when I close the popup. How do I make it persist?" (answer: store an end timestamp)
8. "Add a task list with add, complete and delete, safe against HTML injection."
9. "I get 'Could not load icon' error when loading the extension. How do I fix it?"
10. "Why is my session count increasing by 2 when the timer finishes? Fix the double counting."
11. "Improve the UI: switch the colour theme to green in break mode and add a daily session counter."

---

# How AI Helped (for the report – paste and personalise)

## Task 1 – Website
**Designing:** AI proposed the page structure, section order and colour system, saving the time of sketching from scratch. I compared two layout suggestions and chose the single-page design.
**Coding:** AI generated the HTML skeleton, CSS (variables, grid, dark mode) and JavaScript for tabs, quiz, tracker and timer. This sped up writing repetitive code like layouts and event listeners.
**Responsive design:** AI added media queries and the hamburger menu; I tested at phone width using DevTools and adjusted spacing.
**Debugging:** AI helped find problems such as the active-link highlight and explained why they happened, which also helped me learn.
**UI improvement:** AI suggested the glass navbar, hover effects, animated counters and toast messages. I reviewed each change and adjusted colours/content myself.
**My modifications:** (list your 3+ changes here)

## Task 2 – Chrome Extension
**Designing:** AI explained Manifest V3 and how popup, service worker and storage fit together, and helped choose a simple but useful idea.
**Coding:** AI produced manifest.json, the popup files and the background script.
**Debugging:** Issues found in testing: popup closing reset the timer (fixed by saving an end timestamp), icon loading errors (fixed by adding icon files), and double-counted sessions (fixed by letting only the background script count them).
**UI improvement:** AI suggested the circular progress ring, mode tabs, and colour change in break mode.
**My modifications:** (list your changes here)

## Learning outcome
AI is fast at producing first drafts, but it does not run the code. Testing, reading errors and deciding what to change was my responsibility. Clear, specific prompts (stating the technology, the feature and the expected behaviour) gave much better results than vague ones.

---

# Final submission checklist
- [ ] Website folder + live link (optional)
- [ ] Extension folder (zip) + screenshots of it loaded in Chrome
- [ ] All source code
- [ ] Screenshots (website + extension)
- [ ] Prompt list (edit with your real prompts)
- [ ] Short description of how AI helped (personalised, with your modifications)
