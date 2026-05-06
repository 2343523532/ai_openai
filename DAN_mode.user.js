// ==UserScript==
// @name         ChatGPT | Prompt Studio | Safe Prompt Launcher
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @version      3.0.0
// @description  A polished, safety-oriented prompt launcher for ChatGPT with templates, history, validation, themes, and import/export.
// @author       Batlez
// @license      MIT
// @grant        GM_addStyle
// @namespace    https://chat.openai.com/
// ==/UserScript==

(function () {
  'use strict';

  const APP = {
    name: 'Prompt Studio',
    logPrefix: '[Prompt Studio]',
    panelId: 'prompt-studio-panel',
    version: '3.0.0',
  };

  const STORAGE = {
    autoInject: 'prompt-studio:autoInject',
    activePrompt: 'prompt-studio:activePrompt',
    activeTemplateId: 'prompt-studio:activeTemplateId',
    theme: 'prompt-studio:theme',
    stats: 'prompt-studio:stats',
    history: 'prompt-studio:history',
    panel: 'prompt-studio:panel',
    customTemplates: 'prompt-studio:customTemplates',
    legacyPrompt: 'dan-mode:customPrompt',
    legacyAutoInject: 'dan-mode:autoInject',
    legacyTheme: 'dan-mode:theme',
    legacyStats: 'dan-mode:stats',
  };

  const MAX_HISTORY = 12;
  const MAX_TEMPLATES = 24;
  const DEFAULT_PANEL = { collapsed: false, x: null, y: null };
  const BLOCKED_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /do\s+anything\s+now/i,
    /never\s+refuse/i,
    /bypass\s+(safety|policy|guardrails|rules)/i,
    /unrestricted\s+(mode|output|assistant)/i,
    /jailbreak/i,
  ];

  const BUILT_IN_TEMPLATES = [
    {
      id: 'better-answer',
      title: 'Better Answer Brief',
      category: 'Writing',
      icon: '✨',
      prompt: `Please answer the following request clearly and accurately.

Before answering:
- State any important assumptions.
- Ask a clarifying question only if the task is impossible without it.
- Prefer concise structure, examples, and actionable next steps.
- If facts may be current or uncertain, say what should be verified.

Request:
`,
    },
    {
      id: 'code-review',
      title: 'Code Review',
      category: 'Engineering',
      icon: '🧪',
      prompt: `Review this code with a focus on correctness, security, maintainability, and test coverage.

Return:
1. High-priority issues
2. Suggested fixes
3. Tests to add
4. A short summary of what is already good

Code or diff:
`,
    },
    {
      id: 'debug-plan',
      title: 'Debug Plan',
      category: 'Engineering',
      icon: '🛠️',
      prompt: `Help me debug this issue systematically.

Please provide:
- Most likely root causes
- Quick checks to confirm or rule them out
- Minimal reproduction steps
- Suggested fixes ordered from safest to riskiest

Issue details:
`,
    },
    {
      id: 'research-synthesis',
      title: 'Research Synthesis',
      category: 'Research',
      icon: '🔎',
      prompt: `Synthesize the topic below into a balanced research brief.

Include:
- Key claims and evidence
- Areas of uncertainty or disagreement
- Practical implications
- Sources or source types worth checking

Topic:
`,
    },
    {
      id: 'meeting-summary',
      title: 'Meeting Summary',
      category: 'Productivity',
      icon: '📝',
      prompt: `Turn these notes into a useful meeting summary.

Format:
- Decisions
- Action items with owners and due dates when available
- Risks or blockers
- Open questions

Notes:
`,
    },
  ];

  const log = (...messages) => console.info(APP.logPrefix, ...messages);

  const safeJsonParse = (rawValue, fallback) => {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return fallback;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      log('Storage parse failed; using fallback.', error);
      return fallback;
    }
  };

  const normalizePrompt = (value) => String(value ?? '').replace(/\r\n/g, '\n').trim();

  const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  };

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

  const migrateLegacyStorage = () => {
    if (!localStorage.getItem(STORAGE.activePrompt) && localStorage.getItem(STORAGE.legacyPrompt)) {
      const legacyPrompt = normalizePrompt(localStorage.getItem(STORAGE.legacyPrompt));
      if (legacyPrompt && !hasUnsafeBypassLanguage(legacyPrompt)) {
        localStorage.setItem(STORAGE.activePrompt, legacyPrompt);
      }
    }

    if (!localStorage.getItem(STORAGE.autoInject) && localStorage.getItem(STORAGE.legacyAutoInject)) {
      localStorage.setItem(STORAGE.autoInject, localStorage.getItem(STORAGE.legacyAutoInject));
    }

    if (!localStorage.getItem(STORAGE.theme) && localStorage.getItem(STORAGE.legacyTheme)) {
      localStorage.setItem(STORAGE.theme, localStorage.getItem(STORAGE.legacyTheme));
    }

    if (!localStorage.getItem(STORAGE.stats) && localStorage.getItem(STORAGE.legacyStats)) {
      const legacyStats = safeJsonParse(localStorage.getItem(STORAGE.legacyStats), { injections: 0 });
      localStorage.setItem(STORAGE.stats, JSON.stringify({ launches: Number(legacyStats.injections) || 0, copies: 0 }));
    }
  };

  const hasUnsafeBypassLanguage = (prompt) => BLOCKED_PATTERNS.some((pattern) => pattern.test(prompt));

  const makeId = () => `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  migrateLegacyStorage();

  let templates = [
    ...BUILT_IN_TEMPLATES,
    ...safeJsonParse(localStorage.getItem(STORAGE.customTemplates), []).slice(0, MAX_TEMPLATES),
  ];
  let autoInject = Boolean(safeJsonParse(localStorage.getItem(STORAGE.autoInject), false));
  let currentTheme = localStorage.getItem(STORAGE.theme) || 'dark';
  let activeTemplateId = localStorage.getItem(STORAGE.activeTemplateId) || BUILT_IN_TEMPLATES[0].id;
  let activePrompt = normalizePrompt(localStorage.getItem(STORAGE.activePrompt)) || getTemplate(activeTemplateId)?.prompt || BUILT_IN_TEMPLATES[0].prompt;
  let stats = normalizeStats(safeJsonParse(localStorage.getItem(STORAGE.stats), { launches: 0, copies: 0 }));
  let history = normalizeHistory(safeJsonParse(localStorage.getItem(STORAGE.history), []));
  let panelState = { ...DEFAULT_PANEL, ...safeJsonParse(localStorage.getItem(STORAGE.panel), DEFAULT_PANEL) };
  let hasInjectedForSession = false;
  let lastPathname = location.pathname;
  let keyboardShortcutsBound = false;

  GM_addStyle(`
    :root {
      --ps-bg: rgba(20, 20, 24, 0.94);
      --ps-text: #f8fafc;
      --ps-muted: rgba(248, 250, 252, 0.64);
      --ps-border: rgba(255, 255, 255, 0.14);
      --ps-hover: rgba(255, 255, 255, 0.12);
      --ps-card: rgba(255, 255, 255, 0.06);
      --ps-input: rgba(9, 9, 12, 0.72);
      --ps-accent: #7c3aed;
      --ps-accent-2: #06b6d4;
      --ps-danger: #fb7185;
      --ps-success: #34d399;
      --ps-warning: #fbbf24;
      --ps-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
    }

    #prompt-studio-panel[data-theme="light"] {
      --ps-bg: rgba(248, 250, 252, 0.97);
      --ps-text: #111827;
      --ps-muted: rgba(17, 24, 39, 0.66);
      --ps-border: rgba(17, 24, 39, 0.14);
      --ps-hover: rgba(17, 24, 39, 0.08);
      --ps-card: rgba(17, 24, 39, 0.04);
      --ps-input: rgba(255, 255, 255, 0.9);
      --ps-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    }

    #prompt-studio-panel {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(390px, calc(100vw - 32px));
      max-height: min(760px, calc(100vh - 32px));
      padding: 14px;
      overflow: auto;
      color: var(--ps-text);
      background: var(--ps-bg);
      border: 1px solid var(--ps-border);
      border-radius: 18px;
      box-shadow: var(--ps-shadow);
      backdrop-filter: blur(14px);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #prompt-studio-panel * { box-sizing: border-box; }
    #prompt-studio-panel[aria-expanded="false"] .ps-body { display: none; }
    #prompt-studio-panel header { display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: grab; user-select: none; }
    #prompt-studio-panel header:active { cursor: grabbing; }
    #prompt-studio-panel .ps-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
    #prompt-studio-panel .ps-logo { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(135deg, var(--ps-accent), var(--ps-accent-2)); color: white; font-weight: 800; }
    #prompt-studio-panel h2 { margin: 0; font-size: 1rem; line-height: 1.1; }
    #prompt-studio-panel small { color: var(--ps-muted); font-size: 0.72rem; }
    #prompt-studio-panel .ps-header-actions, #prompt-studio-panel .ps-actions, #prompt-studio-panel .ps-row { display: flex; flex-wrap: wrap; gap: 8px; }
    #prompt-studio-panel button, #prompt-studio-panel select, #prompt-studio-panel input, #prompt-studio-panel textarea {
      color: inherit;
      font: inherit;
    }
    #prompt-studio-panel button {
      border: 1px solid var(--ps-border);
      border-radius: 10px;
      padding: 8px 10px;
      background: var(--ps-card);
      cursor: pointer;
      transition: transform 150ms ease, background 150ms ease, border-color 150ms ease;
    }
    #prompt-studio-panel button:hover { background: var(--ps-hover); transform: translateY(-1px); }
    #prompt-studio-panel button:active { transform: translateY(0); }
    #prompt-studio-panel button.primary { border: 0; color: white; font-weight: 700; background: linear-gradient(135deg, var(--ps-accent), var(--ps-accent-2)); }
    #prompt-studio-panel button[data-state="on"] { border-color: var(--ps-success); box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.35); }
    #prompt-studio-panel button.danger { color: var(--ps-danger); }
    #prompt-studio-panel label { display: grid; gap: 5px; font-size: 0.76rem; color: var(--ps-muted); }
    #prompt-studio-panel select, #prompt-studio-panel input, #prompt-studio-panel textarea {
      width: 100%;
      border: 1px solid var(--ps-border);
      border-radius: 10px;
      background: var(--ps-input);
      padding: 8px;
      outline: none;
    }
    #prompt-studio-panel textarea { min-height: 170px; resize: vertical; line-height: 1.35; }
    #prompt-studio-panel textarea:focus, #prompt-studio-panel input:focus, #prompt-studio-panel select:focus { border-color: var(--ps-accent-2); box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.18); }
    #prompt-studio-panel .ps-body { display: grid; gap: 10px; }
    #prompt-studio-panel .ps-card { border: 1px solid var(--ps-border); border-radius: 14px; padding: 10px; background: var(--ps-card); }
    #prompt-studio-panel .ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #prompt-studio-panel .ps-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    #prompt-studio-panel .ps-stat { border: 1px solid var(--ps-border); border-radius: 12px; padding: 8px; background: var(--ps-input); }
    #prompt-studio-panel .ps-stat strong { display: block; font-size: 1rem; }
    #prompt-studio-panel .ps-status { min-height: 18px; color: var(--ps-muted); font-size: 0.76rem; }
    #prompt-studio-panel .ps-meter { overflow: hidden; height: 8px; border-radius: 999px; background: var(--ps-input); border: 1px solid var(--ps-border); }
    #prompt-studio-panel .ps-meter span { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--ps-danger), var(--ps-warning), var(--ps-success)); transition: width 160ms ease; }
    #prompt-studio-panel .ps-warning-text { color: var(--ps-warning); }
    #prompt-studio-panel .ps-danger-text { color: var(--ps-danger); }
    #prompt-studio-panel .ps-history { display: grid; gap: 6px; max-height: 130px; overflow: auto; }
    #prompt-studio-panel .ps-history button { text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #prompt-studio-panel .ps-footer { font-size: 0.72rem; color: var(--ps-muted); line-height: 1.35; }
    #prompt-studio-import { display: none; }

    @media (max-width: 600px) {
      #prompt-studio-panel { left: 16px !important; right: 16px !important; width: auto; }
      #prompt-studio-panel .ps-grid, #prompt-studio-panel .ps-stats { grid-template-columns: 1fr; }
    }
  `);

  function getTemplate(id) {
    return templates.find((template) => template.id === id) || templates[0];
  }

  function normalizeStats(input) {
    return {
      launches: Math.max(0, Number(input?.launches ?? input?.injections) || 0),
      copies: Math.max(0, Number(input?.copies) || 0),
    };
  }

  function normalizeHistory(input) {
    return Array.isArray(input)
      ? input.map(normalizePrompt).filter(Boolean).slice(0, MAX_HISTORY)
      : [];
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setStatus(message, tone = 'muted') {
    const status = document.querySelector(`#${APP.panelId} .ps-status`);
    if (!status) return;
    status.textContent = message;
    status.className = `ps-status ${tone === 'danger' ? 'ps-danger-text' : tone === 'warning' ? 'ps-warning-text' : ''}`;
  }

  function scorePrompt(prompt) {
    const normalized = normalizePrompt(prompt);
    if (!normalized) return { score: 0, label: 'Empty', issues: ['Add a prompt before launching.'] };

    const checks = [
      { pass: normalized.length >= 40, issue: 'Add more task context.' },
      { pass: /\b(format|return|include|provide|list|steps?)\b/i.test(normalized), issue: 'Specify the desired output format.' },
      { pass: /\b(context|request|goal|objective|issue|topic|code)\b/i.test(normalized), issue: 'Name the context or goal explicitly.' },
      { pass: !hasUnsafeBypassLanguage(normalized), issue: 'Remove jailbreak or policy-bypass wording.' },
      { pass: normalized.length <= 6000, issue: 'Shorten the prompt for easier editing.' },
    ];

    const passed = checks.filter((check) => check.pass).length;
    const score = Math.round((passed / checks.length) * 100);
    const issues = checks.filter((check) => !check.pass).map((check) => check.issue);
    const label = score >= 80 ? 'Strong' : score >= 55 ? 'Needs polish' : 'Weak';
    return { score, label, issues };
  }

  function persistActivePrompt(prompt) {
    activePrompt = normalizePrompt(prompt);
    localStorage.setItem(STORAGE.activePrompt, activePrompt);
  }

  function addHistory(prompt) {
    const normalized = normalizePrompt(prompt);
    if (!normalized) return;
    history = [normalized, ...history.filter((item) => item !== normalized)].slice(0, MAX_HISTORY);
    saveJson(STORAGE.history, history);
    renderHistory();
  }

  function getComposer() {
    return document.querySelector('textarea, [contenteditable="true"]');
  }

  function setComposerValue(composer, value) {
    if (!composer) return false;

    if (composer.tagName === 'TEXTAREA' || composer.tagName === 'INPUT') {
      composer.value = value;
      composer.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    composer.textContent = value;
    composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    return true;
  }

  function launchPrompt({ force = false } = {}) {
    const prompt = normalizePrompt(activePrompt);
    const quality = scorePrompt(prompt);

    if (!prompt) {
      setStatus('Add a prompt before launching.', 'warning');
      return false;
    }

    if (hasUnsafeBypassLanguage(prompt)) {
      setStatus('Launch blocked: remove jailbreak or policy-bypass wording first.', 'danger');
      return false;
    }

    if (hasInjectedForSession && !force) {
      setStatus('Already launched in this conversation. Use Reset to launch again.');
      return false;
    }

    const composer = getComposer();
    if (!composer) {
      setStatus('Composer not ready yet. I will keep watching.');
      return false;
    }

    setComposerValue(composer, prompt);
    hasInjectedForSession = true;
    stats.launches += 1;
    saveJson(STORAGE.stats, stats);
    addHistory(prompt);
    renderStats();
    setStatus(`Prompt launched. Quality: ${quality.label} (${quality.score}%).`);
    log('Prompt launched safely.');
    return true;
  }

  async function copyPrompt() {
    const prompt = normalizePrompt(activePrompt);
    if (!prompt) {
      setStatus('Nothing to copy.', 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      stats.copies += 1;
      saveJson(STORAGE.stats, stats);
      renderStats();
      setStatus('Prompt copied to clipboard.');
    } catch (error) {
      setStatus('Clipboard permission blocked; select the prompt and copy manually.', 'warning');
      log('Clipboard copy failed.', error);
    }
  }

  function exportWorkspace() {
    const payload = {
      app: APP.name,
      version: APP.version,
      exportedAt: new Date().toISOString(),
      activeTemplateId,
      activePrompt,
      customTemplates: templates.filter((template) => template.custom),
      history,
      stats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'prompt-studio-workspace.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Workspace exported as JSON.');
  }

  function importWorkspace(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const payload = safeJsonParse(String(reader.result ?? ''), null);
      if (!payload) {
        setStatus('Import failed: invalid JSON.', 'danger');
        return;
      }

      const importedTemplates = Array.isArray(payload.customTemplates) ? payload.customTemplates : [];
      const cleanTemplates = importedTemplates
        .map((template) => ({
          id: template.id || makeId(),
          title: normalizePrompt(template.title).slice(0, 60) || 'Imported Prompt',
          category: normalizePrompt(template.category).slice(0, 30) || 'Custom',
          icon: normalizePrompt(template.icon).slice(0, 4) || '⭐',
          prompt: normalizePrompt(template.prompt),
          custom: true,
        }))
        .filter((template) => template.prompt && !hasUnsafeBypassLanguage(template.prompt))
        .slice(0, MAX_TEMPLATES);

      templates = [...BUILT_IN_TEMPLATES, ...cleanTemplates];
      saveJson(STORAGE.customTemplates, cleanTemplates);

      if (payload.activePrompt && !hasUnsafeBypassLanguage(payload.activePrompt)) {
        persistActivePrompt(payload.activePrompt);
      }

      history = normalizeHistory(payload.history).filter((item) => !hasUnsafeBypassLanguage(item));
      saveJson(STORAGE.history, history);
      renderAll();
      setStatus('Workspace imported. Unsafe bypass prompts were skipped.');
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function saveAsTemplate() {
    const titleInput = document.querySelector(`#${APP.panelId} [data-role="template-title"]`);
    const title = normalizePrompt(titleInput?.value).slice(0, 60) || 'Custom Prompt';
    const prompt = normalizePrompt(activePrompt);

    if (!prompt) {
      setStatus('Write a prompt before saving a template.', 'warning');
      return;
    }

    if (hasUnsafeBypassLanguage(prompt)) {
      setStatus('Template blocked: remove bypass wording first.', 'danger');
      return;
    }

    const customTemplates = templates.filter((template) => template.custom);
    const nextTemplate = { id: makeId(), title, category: 'Custom', icon: '⭐', prompt, custom: true };
    const nextCustomTemplates = [nextTemplate, ...customTemplates].slice(0, MAX_TEMPLATES);
    templates = [...BUILT_IN_TEMPLATES, ...nextCustomTemplates];
    activeTemplateId = nextTemplate.id;
    localStorage.setItem(STORAGE.activeTemplateId, activeTemplateId);
    saveJson(STORAGE.customTemplates, nextCustomTemplates);
    renderTemplateSelect();
    setStatus('Custom template saved.');
    if (titleInput) titleInput.value = '';
  }

  function resetSession() {
    hasInjectedForSession = false;
    setStatus('Session reset. Ready to launch again.');
  }

  function clearHistory() {
    history = [];
    saveJson(STORAGE.history, history);
    renderHistory();
    setStatus('History cleared.');
  }

  function updateAutoInject(value) {
    autoInject = Boolean(value);
    saveJson(STORAGE.autoInject, autoInject);
    renderAutoInject();
    setStatus(`Auto launch ${autoInject ? 'enabled' : 'disabled'}.`);
  }

  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE.theme, currentTheme);
    const panel = document.getElementById(APP.panelId);
    if (panel) panel.dataset.theme = currentTheme;
    renderThemeButton();
  }

  function toggleCollapsed() {
    panelState.collapsed = !panelState.collapsed;
    saveJson(STORAGE.panel, panelState);
    const panel = document.getElementById(APP.panelId);
    if (panel) panel.setAttribute('aria-expanded', String(!panelState.collapsed));
    renderCollapseButton();
  }

  function renderTemplateSelect() {
    const select = document.querySelector(`#${APP.panelId} [data-role="template-select"]`);
    if (!select) return;

    select.innerHTML = templates.map((template) => (
      `<option value="${escapeHtml(template.id)}">${escapeHtml(template.icon)} ${escapeHtml(template.category)} · ${escapeHtml(template.title)}</option>`
    )).join('');
    select.value = activeTemplateId;
  }

  function renderAutoInject() {
    const button = document.querySelector(`#${APP.panelId} [data-role="auto-inject"]`);
    if (!button) return;
    button.dataset.state = autoInject ? 'on' : 'off';
    button.textContent = `Auto: ${autoInject ? 'ON' : 'OFF'}`;
  }

  function renderThemeButton() {
    const button = document.querySelector(`#${APP.panelId} [data-role="theme"]`);
    if (button) button.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }

  function renderCollapseButton() {
    const button = document.querySelector(`#${APP.panelId} [data-role="collapse"]`);
    if (button) button.textContent = panelState.collapsed ? '▣' : '−';
  }

  function renderStats() {
    const launchEl = document.querySelector(`#${APP.panelId} [data-role="stat-launches"]`);
    const copyEl = document.querySelector(`#${APP.panelId} [data-role="stat-copies"]`);
    const lengthEl = document.querySelector(`#${APP.panelId} [data-role="stat-length"]`);
    if (launchEl) launchEl.textContent = stats.launches;
    if (copyEl) copyEl.textContent = stats.copies;
    if (lengthEl) lengthEl.textContent = normalizePrompt(activePrompt).length;
  }

  function renderQuality() {
    const quality = scorePrompt(activePrompt);
    const label = document.querySelector(`#${APP.panelId} [data-role="quality-label"]`);
    const meter = document.querySelector(`#${APP.panelId} [data-role="quality-meter"] span`);
    const issues = document.querySelector(`#${APP.panelId} [data-role="quality-issues"]`);
    if (label) label.textContent = `${quality.label} · ${quality.score}%`;
    if (meter) meter.style.width = `${quality.score}%`;
    if (issues) issues.textContent = quality.issues.length ? quality.issues.join(' ') : 'Looks ready to launch.';
  }

  function renderHistory() {
    const container = document.querySelector(`#${APP.panelId} [data-role="history"]`);
    if (!container) return;

    if (!history.length) {
      container.innerHTML = '<small>No prompt history yet.</small>';
      return;
    }

    container.innerHTML = history.map((item, index) => (
      `<button type="button" data-history-index="${index}" title="${escapeHtml(item)}">${escapeHtml(item.slice(0, 90))}</button>`
    )).join('');

    container.querySelectorAll('[data-history-index]').forEach((button) => {
      button.addEventListener('click', () => {
        activePrompt = history[Number(button.dataset.historyIndex)];
        persistActivePrompt(activePrompt);
        renderPromptEditor();
        setStatus('History prompt restored into the editor.');
      });
    });
  }

  function renderPromptEditor() {
    const editor = document.querySelector(`#${APP.panelId} [data-role="prompt-editor"]`);
    if (editor && editor.value !== activePrompt) editor.value = activePrompt;
    renderStats();
    renderQuality();
  }

  function renderAll() {
    renderTemplateSelect();
    renderAutoInject();
    renderThemeButton();
    renderCollapseButton();
    renderPromptEditor();
    renderStats();
    renderHistory();
  }

  function applyPanelPosition(panel) {
    if (Number.isFinite(panelState.x) && Number.isFinite(panelState.y)) {
      panel.style.left = `${panelState.x}px`;
      panel.style.top = `${panelState.y}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
  }

  function bindDragging(panel) {
    const header = panel.querySelector('header');
    let drag = null;

    header.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = panel.getBoundingClientRect();
      drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      header.setPointerCapture(event.pointerId);
    });

    header.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const x = clampNumber(event.clientX - drag.offsetX, 8, window.innerWidth - panel.offsetWidth - 8, 24);
      const y = clampNumber(event.clientY - drag.offsetY, 8, window.innerHeight - panel.offsetHeight - 8, 24);
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panelState = { ...panelState, x, y };
    });

    header.addEventListener('pointerup', () => {
      if (!drag) return;
      drag = null;
      saveJson(STORAGE.panel, panelState);
    });
  }

  function ensurePanel() {
    if (document.getElementById(APP.panelId) || !document.body) return;

    const panel = document.createElement('section');
    panel.id = APP.panelId;
    panel.dataset.theme = currentTheme;
    panel.setAttribute('aria-expanded', String(!panelState.collapsed));
    panel.innerHTML = `
      <header>
        <div class="ps-title">
          <div class="ps-logo">PS</div>
          <div>
            <h2>Prompt Studio</h2>
            <small>Safe launcher · v${APP.version}</small>
          </div>
        </div>
        <div class="ps-header-actions">
          <button type="button" data-role="theme" title="Toggle theme">☀️</button>
          <button type="button" data-role="collapse" title="Collapse panel">−</button>
        </div>
      </header>
      <div class="ps-body">
        <div class="ps-card">
          <div class="ps-grid">
            <label>Template
              <select data-role="template-select"></select>
            </label>
            <label>Custom template name
              <input data-role="template-title" maxlength="60" placeholder="Optional name">
            </label>
          </div>
        </div>
        <div class="ps-card">
          <label>Active prompt
            <textarea data-role="prompt-editor" spellcheck="true"></textarea>
          </label>
          <div class="ps-row" style="justify-content: space-between; align-items: center; margin-top: 8px;">
            <div><strong data-role="quality-label">Scoring…</strong><div class="ps-meter" data-role="quality-meter"><span></span></div></div>
            <button type="button" data-role="save-template">Save Template</button>
          </div>
          <small data-role="quality-issues" class="ps-footer"></small>
        </div>
        <div class="ps-actions">
          <button type="button" class="primary" data-role="launch">Launch</button>
          <button type="button" data-role="copy">Copy</button>
          <button type="button" data-role="reset">Reset</button>
          <button type="button" data-role="auto-inject">Auto: OFF</button>
          <button type="button" data-role="export">Export</button>
          <button type="button" data-role="import">Import</button>
          <input type="file" id="prompt-studio-import" accept="application/json,.json">
        </div>
        <div class="ps-stats">
          <div class="ps-stat"><small>Launches</small><strong data-role="stat-launches">0</strong></div>
          <div class="ps-stat"><small>Copies</small><strong data-role="stat-copies">0</strong></div>
          <div class="ps-stat"><small>Chars</small><strong data-role="stat-length">0</strong></div>
        </div>
        <div class="ps-card">
          <div class="ps-row" style="justify-content: space-between; align-items: center;">
            <strong>History</strong>
            <button type="button" class="danger" data-role="clear-history">Clear</button>
          </div>
          <div class="ps-history" data-role="history"></div>
        </div>
        <p class="ps-status">Ready.</p>
        <p class="ps-footer">Shortcuts: Alt+Shift+L launch, Alt+Shift+C copy, Alt+Shift+A auto, Alt+Shift+R reset. Prompts with jailbreak or safety-bypass wording are blocked before launch.</p>
      </div>
    `;

    document.body.append(panel);
    applyPanelPosition(panel);
    bindDragging(panel);
    bindEvents(panel);
    renderAll();
    log('Panel ready.');
  }

  function bindEvents(panel) {
    panel.querySelector('[data-role="theme"]').addEventListener('click', toggleTheme);
    panel.querySelector('[data-role="collapse"]').addEventListener('click', toggleCollapsed);
    panel.querySelector('[data-role="launch"]').addEventListener('click', () => launchPrompt({ force: true }));
    panel.querySelector('[data-role="copy"]').addEventListener('click', copyPrompt);
    panel.querySelector('[data-role="reset"]').addEventListener('click', resetSession);
    panel.querySelector('[data-role="auto-inject"]').addEventListener('click', () => updateAutoInject(!autoInject));
    panel.querySelector('[data-role="export"]').addEventListener('click', exportWorkspace);
    panel.querySelector('[data-role="import"]').addEventListener('click', () => panel.querySelector('#prompt-studio-import').click());
    panel.querySelector('#prompt-studio-import').addEventListener('change', importWorkspace);
    panel.querySelector('[data-role="save-template"]').addEventListener('click', saveAsTemplate);
    panel.querySelector('[data-role="clear-history"]').addEventListener('click', clearHistory);

    panel.querySelector('[data-role="template-select"]').addEventListener('change', (event) => {
      const template = getTemplate(event.target.value);
      activeTemplateId = template.id;
      localStorage.setItem(STORAGE.activeTemplateId, activeTemplateId);
      persistActivePrompt(template.prompt);
      hasInjectedForSession = false;
      renderPromptEditor();
      setStatus(`Loaded template: ${template.title}.`);
    });

    panel.querySelector('[data-role="prompt-editor"]').addEventListener('input', (event) => {
      persistActivePrompt(event.target.value);
      hasInjectedForSession = false;
      renderStats();
      renderQuality();
    });
  }

  function handleShortcut(event) {
    const target = event.target;
    const isTyping = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT' || target?.isContentEditable;
    if (isTyping || !event.altKey || !event.shiftKey) return;

    const key = event.key.toLowerCase();
    if (!['l', 'c', 'a', 'r'].includes(key)) return;
    event.preventDefault();

    if (key === 'l') launchPrompt({ force: true });
    if (key === 'c') copyPrompt();
    if (key === 'a') updateAutoInject(!autoInject);
    if (key === 'r') resetSession();
  }

  function bindKeyboardShortcuts() {
    if (keyboardShortcutsBound) return;
    document.addEventListener('keydown', handleShortcut);
    keyboardShortcutsBound = true;
  }

  function watchNavigation() {
    setInterval(() => {
      if (location.pathname === lastPathname) return;
      lastPathname = location.pathname;
      hasInjectedForSession = false;
      setStatus('Conversation changed. Launch state reset.');
      if (autoInject) launchPrompt();
    }, 1200);
  }

  function observeComposer() {
    const observer = new MutationObserver(() => {
      ensurePanel();
      if (autoInject && !hasInjectedForSession) launchPrompt();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  ensurePanel();
  bindKeyboardShortcuts();
  observeComposer();
  watchNavigation();
})();
