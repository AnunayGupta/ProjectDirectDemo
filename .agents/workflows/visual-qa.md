---
description: How to perform strict Visual QA before declaring a UI phase complete
---
# Strict Visual QA Process
When performing visual QA using a browser subagent, you must enforce stringent aesthetic evaluation, not just functional testing.

1. **Explicit Prompting for Anomalies**: When using the `browser_subagent` tool, you must append strict "Pixel QA" guidelines to your `Task` string: 
   - *"Before clicking elements or verifying data, visually scan the entire viewport specifically for CSS bleeding, overlapping DOM nodes, unrendered/raw material icon text (e.g., words like 'expand_more' leaking into the UI), and layout alignment issues."*
2. **Prioritize Aesthetics Alongside Function**: A successful interaction (e.g., clicking a button) does NOT equate to a successful test if the button or its container is visually compromised. You must report any visual issues back to the user to fix immediately.
3. **Human-in-the-Loop Pause**: Do not mark a frontend Phase as "100% Complete" purely on functional logic passes. Stop, provide the subagent recording, and explicitly ask the user for an **aesthetic sign-off** before closing out the phase.
