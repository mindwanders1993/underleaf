# Exploring Claude Code Alternatives: OpenCode & Aider

Due to the lack of a Claude Pro subscription, Anthropic's official `claude` (Claude Code) CLI will prompt you for authorization and refuse to work. Fortunately, your environment is already set up with powerful, production-ready alternatives: **OpenCode** and **Aider**, and you have access to other top-tier options in the industry.

This guide outlines your options, compares them, and provides a migration plan to update your shell configuration.

---

## 1. Comparing the Alternatives

| Tool | Style | Focus | Key Strength |
| :--- | :--- | :--- | :--- |
| **[OpenCode](file:///opt/homebrew/bin/opencode)** | Terminal Agent | Provider-agnostic agentic loop | Direct replacement for Claude Code; integrates with local Ollama, OpenRouter, and GitHub Models. |
| **[Aider](file:///Users/mrrobot/.local/bin/aider)** | Git-native Pair | Human-in-the-loop editing | Extremely precise edits, automatically generates Git commits, low token consumption. |
| **Cline** | Editor Agent | IDE integration | Autonomous file-system and terminal control from within your IDE. |
| **OpenHands** | Autonomous Platform | Multi-step software tasks | Designed for building or deploying autonomous workflows in a self-hosted environment. |
| **Antigravity / Gemini CLI** | Multi-Agent/API CLI | Google AI Ecosystem | Optimized for Google's Gemini models with advanced multi-agent support. |

### 🛠️ OpenCode
**OpenCode** is the closest match to Claude Code's terminal-centric, highly autonomous agent flow.
*   **Key Strengths:** Supports a full agentic execution loop, a Terminal User Interface (TUI), and integrates with multiple model providers (local Ollama, OpenRouter, and GitHub Models).
*   **Configured Providers:** Already configured in your environment with `OPENROUTER_API_KEY` and `GITHUB_TOKEN`.
*   **Best For:** When you want a "junior developer" agent that can autonomously execute shell commands, run tests, and iterate until a task is done.

### 👥 Aider
**Aider** is the industry-standard semi-autonomous pair programmer CLI.
*   **Key Strengths:** Highly precise code-editing, native Git integration (automatically commits changes with detailed messages), and extreme model-agnosticism.
*   **Installed Version:** `0.86.2` (located at `/Users/mrrobot/.local/bin/aider`).
*   **Best For:** Collaborative, step-by-step code modification where you maintain strict control over the changes.

---

## 2. Proposed `.zshrc` Configuration Update (Applied)

We have updated your [~/.zshrc](file:///Users/mrrobot/.zshrc) to redirect legacy `claude`-based aliases to use `opencode` instead. This preserves your muscle memory while bypassing the Claude Pro block.

Here is the update applied to your [~/.zshrc](file:///Users/mrrobot/.zshrc):

```zsh
# MiniMax M2.5 & M3 via different agentic tools (Free Cloud)
alias mm-claude='mm-opencode'
alias mm-opencode='ollama launch opencode --model minimax-m2.5:cloud'
alias mm-chat='ollama run minimax-m2.5:cloud'
alias mm2-claude='mm-claude'
alias mm2-opencode='mm-opencode'
alias mm2-chat='mm-chat'

alias mm3-claude='mm3-opencode'
alias mm3-opencode='ollama launch opencode --model minimax-m3:cloud'
alias mm3-chat='ollama run minimax-m3:cloud'

# Kimi K2.7 Code via different agentic tools (Free Cloud)
alias km-claude='km-opencode'
alias km-opencode='ollama launch opencode --model kimi-k2.7-code:cloud'
alias km-chat='ollama run kimi-k2.7-code:cloud'
alias kimi-claude='km-claude'
alias kimi-opencode='km-opencode'
alias kimi-chat='km-chat'

# ================================================
# Local Ollama Models via OpenCode (ollama launch)
# Note: Only models with >3B params support tools
# ================================================
alias oc-qwen='ollama launch opencode --model qwen2.5-coder:32b'
alias oc-qwen-7b='ollama launch opencode --model qwen2.5-coder:7b'
alias oc-deepseek-r1='ollama launch opencode --model deepseek-r1:32b'
alias oc-deepseek-coder='ollama launch opencode --model deepseek-coder-v2:latest'
alias oc-llama='ollama launch opencode --model llama3.1:8b'
alias oc-mistral='ollama launch opencode --model mistral:7b'
alias oc-gemma='ollama launch opencode --model gemma4:e2b'
alias oc-llama3.2='ollama launch opencode --model llama3.2:3b'

# Retain legacy cc-* aliases for backward compatibility (pointing to OpenCode)
alias cc-qwen='oc-qwen'
alias cc-qwen-7b='oc-qwen-7b'
alias cc-deepseek-r1='oc-deepseek-r1'
alias cc-deepseek-coder='oc-deepseek-coder'
alias cc-llama='oc-llama'
alias cc-mistral='oc-mistral'
alias cc-gemma='oc-gemma'
alias cc-llama3.2='oc-llama3.2'

# OpenRouter Qwen3 Coder 480B (Free OpenCode variant)
alias oc-qwen3-free='opencode -m openrouter/qwen/qwen3-coder:free'
alias cc-qwen3-free='oc-qwen3-free'
```

---

## 3. How to Launch and Use

### Launching OpenCode
To start OpenCode in the current directory with your preferred model, simply run:
*   **OpenRouter Free Model:** `oc-qwen3-free` (uses Qwen3 Coder 480B)
*   **Cloud MiniMax Model:** `mm-claude` or `mm-opencode`
*   **Local Ollama Model:** `oc-qwen` or `oc-deepseek-r1`

### Launching Aider
To start Aider with your local Ollama models:
*   `aider-lc-phi3.5` (uses Phi-3.5)
*   Or launch directly with other models: `aider --model openrouter/qwen/qwen3-coder:free`

---

## 4. Activating Changes

To load the updated aliases in your active terminal, run:
```bash
source ~/.zshrc
```
