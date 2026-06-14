# Underleaf — Open Source Overleaf Alternative

Welcome to the **Underleaf** project! This is a design-first project folder containing the complete visual mockups and architectural design for an open-source, $0/month self-hosted Overleaf alternative.

## Project Structure

This directory contains the following design documents and assets:

- [underleaf_design_summary.md](underleaf_design_summary.md) — High-level summary of the visual identity, hosting strategy, features, and embedded mockups.
- [implementation_plan.md](implementation_plan.md) — Comprehensive technical design document including architecture overview, user flows, database/state structure, component maps, and deployment details.
- [images/](images/) — Directory containing high-fidelity UI design mockups for desktop, tablet, and mobile views.

## Core Architecture Highlights

- **$0/Month Cost**: Compiles LaTeX documents in the user's browser using a WebAssembly (WASM) port of pdfTeX/XeTeX (via SwiftLaTeX).
- **Privacy First**: Documents never leave the client's machine unless optional cloud backup is configured.
- **Responsive Layout**: Designed for seamless transition from desktop (3-panel split view) to mobile (tabbed navigation).
