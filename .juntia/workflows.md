<!-- juntia:generated -->
# Workflows

Juntia's own recommended sequence for common kinds of work in a Juntia-governed project — the same
recommendation for every project, not derived from this one specifically.

## New feature

1. Analyze the impact — what existing components, decisions, or constraints does this touch?
2. Review the existing architecture (`.juntia/context.md`, `.juntia/ARCHITECTURE.md` if present) before
   proposing a new one.
3. Propose a solution, naming any tradeoff.
4. If the proposal affects or conflicts with an existing confirmed decision, wait for confirmation
   before implementing — do not proceed on an assumption.
5. Implement.
6. Validate — run the real tests/build, not just a visual read.

## Bug fix

1. Reproduce the bug for real before changing anything.
2. Investigate the real cause — do not guess at a fix for a symptom.
3. Modify.
4. Validate — confirm the original reproduction no longer fails, and nothing else regressed.
