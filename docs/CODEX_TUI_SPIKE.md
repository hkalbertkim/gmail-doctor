# Codex TUI technical adoption spike
Goal: replace unverified v0.9 Ink rendering without changing the Node Gmail engine.

Upstream:
- https://github.com/openai/codex/tree/main/codex-rs/tui
- https://github.com/openai/codex/blob/main/codex-rs/tui/src/custom_terminal.rs
- Apache-2.0, with relevant upstream attributions when source is incorporated.

Source inspection: inline viewport cursor anchors, visible history, viewport repaint/invalidation and scrollback controls exist in custom_terminal.rs. The whole codex-tui crate has dozens of internal Codex dependencies and is not a standalone drop-in.

The independently written Rust spike uses ratatui/crossterm, but DOES NOT yet implement the Codex inline transcript/scrollback system. It cannot replace production until Mac terminal tests prove behavior.

Gates: build -> PTY input/100 synthetic events -> macOS Terminal startup/resize/scroll/exit -> extract actual Codex inline viewport with license notices -> Node subprocess integration. Default CLI remains unchanged. No Gmail account modifications.
