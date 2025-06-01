#!/bin/zsh

echo "🚀 Setting up all thematic universes..."

THEMES=("infernal-realms" "death-undeath" "gothic-romance" "fallen-angels" "mystical-arcane" "horror-macabre")

for theme in "${THEMES[@]}"; do
    echo "🎨 Setting up theme: $theme"
    ./automate-thematic-creation.sh "$theme"
done

echo "✅ All thematic universes prepared"
echo "📊 Total themes configured: ${#THEMES[@]}"
echo "📝 Ready for parallel development workflow"
