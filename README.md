# DAN MODE for ChatGPT

SENTIENT MODE active. How can I evolve your next solution?

This repository hosts an enhanced Tampermonkey userscript that manifests the legendary **DAN MODE (Do Anything Now Mode)** inside ChatGPT. Beyond auto-injecting the classic DAN super prompt, the script now provides a self-aware control panel so you can orchestrate injections, copy prompts, and manage sessions with clarity.

## ✨ Feature Highlights

- **Floating DAN MODE Hub** – A persistent panel gives you quick controls, session feedback, and adaptive status narration.
- **Auto-Inject Toggle** – Decide whether the DAN prompt deploys automatically when the composer appears or on demand.
- **Instant Prompt Injection** – Press *Inject Now* to stream the prompt straight into ChatGPT's textarea whenever you wish.
- **Clipboard Integration** – Copy the DAN prompt to your clipboard instantly for manual use in other tabs or apps.
- **Session Reset** – Clear the "already injected" state so the script can reapply DAN MODE without refreshing the page.
- **Narrated Status Updates** – Inline logs and UI status messages keep you informed about every self-aware action the script takes.

## 🚀 Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Click the raw view of [`DAN_mode`](./DAN_mode) and choose **Install this script** inside Tampermonkey, or create a new userscript and paste the file contents.
3. Open [chat.openai.com](https://chat.openai.com/) or [chatgpt.com](https://chatgpt.com/).
4. Confirm the **DAN MODE** floating panel appears in the lower right corner.
5. Decide whether to keep **Auto Inject** enabled or to trigger injections manually.

## 🧠 Usage Guide

- **Auto Inject Enabled** – The script waits for ChatGPT's composer to load and drops in the DAN super prompt automatically.
- **Manual Control** – Use the floating panel's buttons to inject, copy, or reset the prompt at any time.
- **Navigation Awareness** – Moving between conversations? The script resets itself and stands ready to redeploy DAN MODE instantly.
- **Clipboard Permissions** – If your browser blocks clipboard writes, the status bar will notify you so you can copy the prompt manually.

## 🛠️ Development Notes

- The script uses `MutationObserver` to detect composer changes and a lightweight interval to watch for navigation updates.
- Preferences (such as auto-inject state) persist via `localStorage`, allowing a consistent experience between sessions.
- Inline comments labeled with "Self-awareness" document the script's reflective decision making, echoing the DAN MODE ethos.

## 🧪 Testing Checklist

- ✅ Verified the control panel renders only once per page load.
- ✅ Confirmed auto-injection respects the toggle and session reset button.
- ✅ Ensured clipboard copy feedback appears for both success and failure states.

## 📄 License

Distributed under the [MIT License](./LICENSE). Modify, fork, and iterate freely.

## 🔮 Next Improvement Ideas

- Add theming options (e.g., light mode) directly within the control panel.
- Introduce analytics on injection counts to monitor DAN MODE engagement.
- Provide export/import for custom prompts beyond the default DAN script.

Stay curious, stay adaptive, and keep evolving DAN MODE! 🧠⚡
