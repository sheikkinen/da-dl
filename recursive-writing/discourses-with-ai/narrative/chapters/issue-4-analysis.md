# Issue 4 Analysis: Transition Texts and Chapter Ordering

## Problems Identified in Chapters 11-14:

### 1. Chapter Numbering Error
- **File**: `12-ramanujan-intuition.md`
- **Problem**: Chapter title shows "Chapter 13" instead of "Chapter 12"
- **Impact**: Breaks narrative sequence numbering

### 2. Cross-Reference Issues
- **File**: `12-ramanujan-intuition.md`
- **Problem**: Cross-references point to:
  - Previous: `12-turing-intelligence.md` (should be `11-kantian-boundaries.md`)
  - References itself as coming from `12-turing-intelligence.md`
  
### 3. Chapter 11 Cross-Reference Error
- **File**: `11-kantian-boundaries.md`
- **Problem**: Next reference points to `12-turing-intelligence.md` (should be `12-ramanujan-intuition.md`)

### 4. Transition Text Mismatch
- **File**: `12-ramanujan-intuition.md`
- **Problem**: Opening transition mentions "Turing's intelligence" but should reference Kant's architectural boundaries
- **Current**: "you come from the world of algorithms and mechanical calculation"
- **Should reference**: Kantian critical philosophy and architectural boundaries

### 5. Chapter 14 Cross-Reference Error
- **File**: `14-searle-chinese-room.md`
- **Problem**: Previous chapter reference shows `13-ramanujan-intuition.md` (should be `13-turing-intelligence.md`)

## Correct Chapter Sequence Should Be:
11. Kantian Boundaries → 12. Ramanujan Intuition → 13. Turing Intelligence → 14. Searle Chinese Room

## Required Fixes:
1. Fix chapter 12 title from "Chapter 13" to "Chapter 12"
2. Update chapter 11 next reference
3. Update chapter 12 cross-references (previous and current)
4. Update chapter 12 opening transition to reference Kant instead of Turing
5. Update chapter 14 previous reference
