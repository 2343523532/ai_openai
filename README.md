# ChatGPT Prompt Studio

Prompt Studio is a Tampermonkey userscript for ChatGPT that turns reusable prompts into a small, safe, polished launcher. It replaces the older bypass-oriented prompt workflow with a productivity-focused toolkit: templates, quality checks, history, workspace import/export, keyboard shortcuts, and a draggable control panel.

## ✨ Feature Highlights

- **Safe Prompt Launcher** – Launch or copy reusable prompts without encouraging jailbreak, policy-bypass, or fabricated-answer instructions.
- **Built-in Prompt Templates** – Start quickly with templates for better answers, code review, debugging, research synthesis, and meeting summaries.
- **Prompt Quality Meter** – See a live score with concrete suggestions for making a prompt clearer and safer.
- **Custom Templates** – Save your edited prompt as a reusable template and keep up to 24 custom templates in local storage.
- **Prompt History** – Restore recent launched prompts from an in-panel history list.
- **Workspace Import/Export** – Export templates, history, stats, and the active prompt as JSON; import later and skip unsafe bypass prompts automatically.
- **Theme, Collapse, and Dragging** – Toggle light/dark theme, collapse the panel, and drag it out of the way.
- **Auto Launch Toggle** – Optionally launch once when the ChatGPT composer appears, with session reset protection.
- **Keyboard Shortcuts** – Use `Alt+Shift+L` (launch), `Alt+Shift+C` (copy), `Alt+Shift+A` (toggle auto), and `Alt+Shift+R` (reset).
- **Legacy Migration** – Reads old `dan-mode:*` settings where safe, then stores new state under `prompt-studio:*` keys.

## 🚀 Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Open the raw view of [`DAN_mode.user.js`](./DAN_mode.user.js) and choose **Install this script** inside Tampermonkey, or create a new userscript and paste the file contents.
3. Open [chatgpt.com](https://chatgpt.com/) or [chat.openai.com](https://chat.openai.com/).
4. Confirm the **Prompt Studio** panel appears in the lower-right corner.
5. Pick a template, edit it, then choose **Launch** or **Copy**.

## 🧠 Usage Guide

- **Choose a Template** – Pick one of the built-in prompt patterns from the template selector.
- **Edit the Prompt** – Add your task details and watch the quality meter update.
- **Launch Safely** – Press **Launch** to place the active prompt into the ChatGPT composer.
- **Save Reusable Workflows** – Enter a custom template name and press **Save Template**.
- **Restore Past Prompts** – Click any history item to bring it back into the editor.
- **Move the Panel** – Drag the header to reposition the launcher; position is saved.
- **Import/Export** – Use JSON workspace files to move prompt workflows between browsers.

## 🛡️ Safety Notes

Prompt Studio blocks launch and template import when it detects common jailbreak or policy-bypass wording such as instructions to ignore previous instructions, never refuse, bypass safety rules, or enter unrestricted modes. The goal is to make prompt reuse faster while keeping the tool aligned with accurate, responsible assistant behavior.

## 🛠️ Development Notes

- The script uses `MutationObserver` to detect composer readiness and a lightweight interval for navigation changes.
- Preferences and workspace data persist in `localStorage` under the `prompt-studio:*` namespace.
- The launcher supports both `textarea` and `contenteditable` composer surfaces.
- The code intentionally avoids import-time `try/catch` wrappers and external runtime dependencies.

## 🧪 Testing Checklist

- ✅ Verify the control panel renders only once per page load.
- ✅ Confirm Launch inserts text into the composer and increments stats.
- ✅ Confirm the prompt quality meter updates while typing.
- ✅ Verify unsafe bypass wording is blocked before launch and import.
- ✅ Confirm custom templates persist across reloads.
- ✅ Verify JSON import/export functionality.
- ✅ Check keyboard shortcuts outside text entry fields.
- ✅ Test light/dark theme, collapse, and drag persistence.

## 🧪 Common Lisp Quantum Super AI Sandbox Demo

This repo also includes a standalone Common Lisp simulation in [`quantum_ai.lisp`](./quantum_ai.lisp). The demo is intentionally fictional and sandboxed: it does not connect to banking networks, crypto networks, or payment systems.

### What it does

- Defines a `quantum-super-ai` structure with cognition, bounded learning, diagnostics, risk logging, and fictional sandbox-ledger subsystems.
- Runs cycles that print cognition outputs, simulated ledger drift, fictional asset-pool movement, and fake audit IDs that are explicitly not credentials.
- Exposes `run-demo`, `run-cycle`, `create-quantum-super-ai`, and `summarize-ai` entrypoints.

### Run

```bash
sbcl --script quantum_ai.lisp
```

> Note: This script avoids external crypto dependencies by using a deterministic, non-cryptographic digest helper for fake demo identifiers.

## 📄 License

Distributed under the [MIT License](./LICENSE). Modify, fork, and iterate freely.
