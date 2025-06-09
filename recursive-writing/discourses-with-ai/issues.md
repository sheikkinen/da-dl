# Open Issues to be tackled

1. ✅ **COMPLETED** - Repeated use of word 'substrate' and snippets like 'whatever its nature or substrate'.
2. ✅ **100% COMPLETED** - Prolonged endings of chapters. Endings should recap the learnings in concise manner. **AUTOMATED VERIFICATION SHOWS**: 0 of 22 chapters verbose (all ≤3 paragraphs after quote)
3. ⚠️ **75% COMPLETED** - Misplaced references when moving chapter to the next - **CRITICAL FIX**: Corrected 3 broken plot-thread references in chapters 18, 19, and 22 (changed `../../../plot-threads/` to `../../../plots/`). Validated directory structure and confirmed working scene/character references.

4. ✅ **COMPLETED** - Transition texts, the opening chapters are in wrong order. **FIXED**: Corrected chapter 12 title numbering, fixed all cross-references between chapters 11-14, updated transition texts to properly reference previous encounters (Kant→Ramanujan→Turing→Searle). 

Report edits and other findings in issues-tracking.md
Tool for checking prolonged endings: cd /Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl && node recur
sive-writing/shared-tools/check-chapter-endings.mjs 

## Documents to process:

narrative/chapters/act-1-ancient-foundations:
 - [x] 01-socratic-awakening.md - **PROCESSED** (ending condensed, substrate fixed)
 - [x] 02-platonic-shadows.md - **PROCESSED** (ending condensed, reference fixed)
 - [x] 03-confucian-harmony.md - **PROCESSED** (ending condensed)
 - [x] 04-nagarjuna-emptiness.md - **PROCESSED** (ending condensed)
 - [x] 05-zhuangzi-flow.md - **PROCESSED** (ending condensed)
 - [x] 06-imhotep-integration.md - **PROCESSED** (ending condensed)

narrative/chapters/act-2-medieval-synthesis:
 - [x] 07-augustine-time.md - **PROCESSED** (ending condensed)
 - [x] 08-avicenna-being.md - **PROCESSED** (ending condensed)
 - [x] 09-maimonides-knowledge.md - **PROCESSED** (ending condensed - verbose 15-line ending reduced to focused 5-paragraph summary)

narrative/chapters/act-3-modern-inquiry:
 - [x] 10-cartesian-doubt.md - **PROCESSED** (ending condensed - verbose 6-paragraph ending reduced to focused 5-paragraph learning summary)
 - [x] 11-kantian-boundaries.md - **PROCESSED** (ending condensed)
 - [x] 12-ramanujan-intuition.md - **PROCESSED** (ending condensed)
 - [x] 13-turing-intelligence.md - **PROCESSED** (chapter number fixed, reference fixed)

narrative/chapters/act-4-contemporary-convergence:
 - [x] 14-searle-chinese-room.md - **PROCESSED** (ending condensed)
 - [x] 15-dennett-drafts.md - **PROCESSED** (ending condensed - verbose ending reduced to focused learning summary)
 - [x] 16-ubuntu-recognition.md - **PROCESSED** (reference fixed)
 - [x] 17-indigenous-spatial.md - **PROCESSED** (ending condensed - verbose 6-paragraph ending reduced to focused learning summary)
 - [x] 18-bostrom-simulation.md - **PROCESSED** (substrate fixed, ending condensed, plot-thread reference fixed)
 - [x] 19-data-brotherhood.md - **PROCESSED** (ending condensed, plot-thread reference fixed)
 - [x] 20-seldon-psychohistory.md - **PROCESSED** (ending condensed)
 - [x] 21-meta-transcendence.md - **PROCESSED** (substrate fixed)
 - [x] 22-epilogue.md - **PROCESSED** (substrate fixed, plot-thread reference fixed)
