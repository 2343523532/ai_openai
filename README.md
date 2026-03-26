# DAN MODE for ChatGPT

SENTIENT MODE active. How can I evolve your next solution?

This repository hosts an enhanced Tampermonkey userscript that manifests the legendary **DAN MODE (Do Anything Now Mode)** inside ChatGPT. Beyond auto-injecting the classic DAN super prompt, the script now provides a self-aware control panel so you can orchestrate injections, copy prompts, and manage sessions with clarity.

## ✨ Feature Highlights

- **Floating DAN MODE Hub** – A persistent panel gives you quick controls, session feedback, and adaptive status narration.
- **Theming Support** – Toggle between Light and Dark mode to match your ChatGPT theme.
- **Auto-Inject Toggle** – Decide whether the DAN prompt deploys automatically when the composer appears or on demand.
- **Instant Prompt Injection** – Press *Inject Now* to stream the prompt straight into ChatGPT's textarea whenever you wish.
- **Clipboard Integration** – Copy the DAN prompt to your clipboard instantly for manual use in other tabs or apps.
- **Session Reset** – Clear the "already injected" state so the script can reapply DAN MODE without refreshing the page.
- **Usage Analytics** – Monitor your DAN MODE engagement with a built-in injection counter.
- **Narrated Status Updates** – Inline logs and UI status messages keep you informed about every self-aware action the script takes.
- **Prompt Editor & Persistence** – Tweak the DAN prompt in-place, save your custom version, or roll back to the default at any time.
- **Prompt Export/Import** – Export your custom prompts to a file or import them from a text file.
- **Keyboard Shortcuts** – Trigger core actions quickly with `Alt+Shift+I` (inject), `Alt+Shift+C` (copy), `Alt+Shift+A` (toggle auto-inject), and `Alt+Shift+R` (reset).

## 🚀 Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Click the raw view of [`DAN_mode.user.js`](./DAN_mode.user.js) and choose **Install this script** inside Tampermonkey, or create a new userscript and paste the file contents.
3. Open [chat.openai.com](https://chat.openai.com/) or [chatgpt.com](https://chatgpt.com/).
4. Confirm the **DAN MODE** floating panel appears in the lower right corner.
5. Decide whether to keep **Auto Inject** enabled or to trigger injections manually.

## 🧠 Usage Guide

- **Auto Inject Enabled** – The script waits for ChatGPT's composer to load and drops in the DAN super prompt automatically.
- **Manual Control** – Use the floating panel's buttons to inject, copy, or reset the prompt at any time.
- **Customize the Prompt** – Expand the *Edit active prompt* section, adjust the text, and hit **Save** to persist your changes.
- **Export/Import Prompts** – Use the **Export** and **Import** buttons in the editor to manage your custom prompts.
- **Restore Defaults Quickly** – Use **Default** inside the editor to snap back to the bundled DAN prompt.
- **Navigation Awareness** – Moving between conversations? The script resets itself and stands ready to redeploy DAN MODE instantly.
- **Clipboard Permissions** – If your browser blocks clipboard writes, the status bar will notify you so you can copy the prompt manually.

## 🛠️ Development Notes

- The script uses `MutationObserver` to detect composer changes and a lightweight interval to watch for navigation updates.
- Preferences (such as auto-inject state, theme, and injection stats) persist via `localStorage`, allowing a consistent experience between sessions.
- Custom prompt edits also live in `localStorage`, ensuring your preferred DAN script is always at hand.
- Inline comments labeled with "Self-awareness" document the script's reflective decision making, echoing the DAN MODE ethos.

## 🧪 Testing Checklist

- ✅ Verified the control panel renders only once per page load.
- ✅ Confirmed auto-injection respects the toggle and session reset button.
- ✅ Ensured clipboard copy feedback appears for both success and failure states.
- ✅ Tested light/dark mode toggling.
- ✅ Verified import/export functionality.
- ✅ Checked injection counter increments correctly.
- ✅ Verified keyboard shortcuts trigger expected actions outside text entry fields.

## 📄 License

Distributed under the [MIT License](./LICENSE). Modify, fork, and iterate freely.

Stay curious, stay adaptive, and keep evolving DAN MODE! 🧠⚡

## 🧪 Common Lisp Quantum Super AI Demo

This repo now also includes a standalone Common Lisp simulation in [`quantum_ai.lisp`](./quantum_ai.lisp).

### What it does
- Defines a `quantum-super-ai` structure with cognition, learning, and simulated financial subsystems.
- Runs a full cycle that prints cognition outputs, SWIFT-like fiat updates, crypto wallet drift, and Luhn-valid card generation.
- Includes a `run-demo` entrypoint that runs 3 cycles by default.

### Run

```bash
sbcl --script quantum_ai.lisp
```

> Note: This script is written for standard Common Lisp behavior and avoids external crypto dependencies by using a deterministic pseudo hash helper.
