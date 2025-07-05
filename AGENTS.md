# Agent Instructions for DAN MODE Repository

Welcome, AI Agent! This document provides guidelines for working on the DAN MODE Tampermonkey script repository.

## Project Overview

The project is a Tampermonkey script that enables a "Do Anything Now" (DAN) mode for ChatGPT. The goal is to provide users with a less restricted version of ChatGPT by injecting a custom prompt.

Key files:
-   `DAN_mode`: The main JavaScript file for the Tampermonkey script.
-   `README.md`: User-facing documentation, installation, and usage instructions.
-   `CONTRIBUTING.md`: Guidelines for human contributors.
-   `LICENSE`: The MIT License file.

## Core Principles for AI Development

1.  **Maintain User Experience:**
    *   The script should be easy to install and use.
    *   Changes should not break existing functionality unless explicitly intended as a major version update.
    *   The activation button should be clearly visible and functional.
2.  **Clarity and Readability:**
    *   JavaScript code should be well-commented, especially complex parts or configurations.
    *   `README.md` should be clear, concise, and provide all necessary information for users.
3.  **Robustness:**
    *   Consider edge cases and potential errors. For example, what happens if ChatGPT updates its UI and selectors change? While full future-proofing is hard, basic error handling (e.g., checking if elements exist before manipulating them) is important.
4.  **Security (User-side):**
    *   The script injects content and interacts with `chat.openai.com`. Ensure that changes do not introduce vulnerabilities (e.g., XSS if user-configurable parts are handled insecurely).
    *   The primary function is prompt injection; avoid unnecessary permissions or data handling.
5.  **Respect `CONTRIBUTING.md`:**
    *   While you are an AI, understand the contribution guidelines meant for humans as they reflect project standards.

## Specific Instructions for Modifying Files

*   **`DAN_mode` (JavaScript):**
    *   When modifying the script, ensure compatibility with Tampermonkey's `@grant` directives.
    *   If adding new UI elements, ensure they are styled and do not clash with the ChatGPT interface.
    *   Test script changes by loading them in Tampermonkey and verifying functionality on `chat.openai.com`.
    *   The core `danPrompt` can be updated for better DAN performance, but major changes should be discussed or part of a specific feature request.
    *   Ensure any changes to selectors (e.g., for the textarea) are as robust as possible. `textarea#prompt-textarea` is preferred over just `textarea`.
*   **`README.md`:**
    *   Keep installation instructions up-to-date.
    *   If new features are added, document them clearly.
    *   Ensure the "Disclaimer" section is present and clear.
    *   Update the installation URL placeholder (`USERNAME/REPOSITORY`) if you are submitting code to a specific repository.
*   **`LICENSE`:**
    *   Do not modify the LICENSE file unless explicitly instructed. The project uses the MIT license.

## Testing

*   **Manual Testing:** After making changes to the `DAN_mode` script:
    1.  Install Tampermonkey in a browser.
    2.  Install the modified script.
    3.  Navigate to `https://chat.openai.com/`.
    4.  Verify the "Activate DAN MODE" button appears and is styled correctly.
    5.  Click the button and check if the `danPrompt` is injected into the textarea.
    6.  Send the prompt and verify that ChatGPT responds in both normal and DAN modes (if applicable to the current prompt version).
*   **No Automated Tests (Currently):** There are no automated tests in this repository. Thorough manual testing is crucial.

## Committing and Submitting

*   Follow standard commit message conventions: a short subject line (50 chars max), a blank line, and a more detailed body if necessary.
*   Example:
    ```
    Fix: DAN button not appearing on new ChatGPT UI

    Updated the selector for the main chat input area to ensure the
    DAN MODE activation button is consistently displayed even with
    recent UI changes on the ChatGPT website.
    ```
*   When submitting, use a descriptive branch name (e.g., `feature/improve-prompt` or `fix/button-styling`).

By following these guidelines, you'll help maintain the quality and usability of the DAN MODE script. If anything is unclear, ask for clarification.
