#!/bin/bash

# Character Renaming Script for The Crimson Veil
# This script renames character files and updates character names within the files

cd "/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/the-crimson-veil/characters"

# Define character mappings: old_file:new_file:old_name:new_name
declare -A character_mappings=(
    ["eleanor-inspired-matriarch.md"]="morwenna-verch-bran-matriarch.md:Lady Isadora Valentia de Aquilas:Lady Morwenna verch Bran"
    ["pope-urban-inspired-leader.md"]="aldric-magnus-hierophant.md:Urban Magnus Salvator:Aldric Magnus"
    ["saladin-inspired-commander.md"]="brennos-mac-cuinn-commander.md:Emir Salah al-Din ibn Farid:Brennos mac Cuinn"
    ["genghis-khan-inspired-conqueror.md"]="ragnar-bjornsson-conqueror.md:Khan Temujin Ironfist:Ragnar Bjornsson"
    ["sun-tzu-inspired-strategist.md"]="godwin-ælfredson-strategist.md:General Sun Bingfa:Godwin Ælfredson"
    ["confucius-inspired-philosopher.md"]="aldwin-ap-gruffydd-philosopher.md:Master Chen Weishan:Aldwin ap Gruffydd"
    ["zhuge-liang-inspired-advisor.md"]="caelestis-stellarum-advisor.md:Luo Mingzhi:Caelestis Stellarum"
    ["lao-tzu-inspired-sage.md"]="osric-nebelhart-sage.md:Master Dao Wuxian:Osric Nebelhart"
    ["qin-shi-huang-inspired-unifier.md"]="theodoricus-ferrum-emperor.md:Emperor Qin Shihuang:Theodoricus Ferrum"
    ["cao-cao-inspired-warlord.md"]="edric-umbrarum-warlord.md:Lord Cao Mengde:Edric Umbrarum"
    ["liu-bei-inspired-leader.md"]="gareth-aurelius-prince.md:Prince Liu Xuande:Gareth Aurelius"
    ["mencius-inspired-humanist.md"]="cedric-benignus-humanist.md:Master Meng Zishan:Cedric Benignus"
    ["machiavelli-inspired-strategist.md"]="valdric-thorasson-strategist.md:Niccolò Dominicus Ferrante:Valdric Thorasson"
    ["julius-caesar-inspired-leader.md"]="cassius-ferox-commander.md:Marcus Aurelius Valdris:Cassius Ferox"
)

echo "Starting character file renaming process..."

for old_file in "${!character_mappings[@]}"; do
    if [[ -f "$old_file" ]]; then
        # Parse the mapping
        mapping="${character_mappings[$old_file]}"
        IFS=':' read -r new_file old_name new_name <<< "$mapping"
        
        echo "Processing: $old_file -> $new_file"
        echo "  Renaming: $old_name -> $new_name"
        
        # Create new file with updated content
        sed "s/$old_name/$new_name/g" "$old_file" > "$new_file"
        
        # Remove historical inspiration references from title and notes
        sed -i '' 's/Julius Caesar-Inspired/Military Commander/g' "$new_file" 2>/dev/null
        sed -i '' 's/Machiavelli-Inspired/Master/g' "$new_file" 2>/dev/null
        sed -i '' 's/Eleanor-Inspired/Noble/g' "$new_file" 2>/dev/null
        sed -i '' 's/Pope Urban-Inspired/Religious/g' "$new_file" 2>/dev/null
        sed -i '' 's/Saladin-Inspired/Noble/g' "$new_file" 2>/dev/null
        sed -i '' 's/Genghis Khan-Inspired/Nomadic/g' "$new_file" 2>/dev/null
        sed -i '' 's/Sun Tzu-Inspired/Military/g' "$new_file" 2>/dev/null
        sed -i '' 's/Confucius-Inspired/Moral/g' "$new_file" 2>/dev/null
        sed -i '' 's/Zhuge Liang-Inspired/Strategic/g' "$new_file" 2>/dev/null
        sed -i '' 's/Lao Tzu-Inspired/Taoist/g' "$new_file" 2>/dev/null
        sed -i '' 's/Qin Shi Huang-Inspired/Imperial/g' "$new_file" 2>/dev/null
        sed -i '' 's/Cao Cao-Inspired/Pragmatic/g' "$new_file" 2>/dev/null
        sed -i '' 's/Liu Bei-Inspired/Benevolent/g' "$new_file" 2>/dev/null
        sed -i '' 's/Mencius-Inspired/Humanistic/g' "$new_file" 2>/dev/null
        sed -i '' 's/Xunzi-Inspired/Pragmatic/g' "$new_file" 2>/dev/null
        
        echo "  Created: $new_file"
    else
        echo "Warning: $old_file not found"
    fi
done

echo "Character file renaming complete!"
echo "Note: Original files are preserved. Review new files before deleting originals."
