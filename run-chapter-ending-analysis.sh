#!/bin/bash
# AI Friendly Summary: Convenience script to run chapter ending analysis on discourses-with-ai chapters.

echo "🔍 Running Chapter Ending Analysis Tool..."
echo "📚 Analyzing discourses-with-ai chapters for verbose endings..."
echo

cd /Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl

# Run the analysis tool
node recursive-writing/shared-tools/check-chapter-endings.mjs

echo
echo "📊 Analysis complete! Check 'chapter-ending-analysis.md' for detailed results."
echo "💡 This tool supports Issue #2: identifying verbose chapter endings for condensation."
echo
echo "Cross-References:"
echo "- recursive-writing/discourses-with-ai/issues.md (Issue #2 tracking)"
echo "- recursive-writing/shared-tools/check-chapter-endings.mjs (analysis tool)"
echo "- chapter-ending-analysis.md (generated report)"
