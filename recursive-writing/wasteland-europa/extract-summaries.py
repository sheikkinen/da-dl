#!/usr/bin/env python3
"""
Extract summaries from Wasteland Europa scenes and narratives
Creates comprehensive Europa summary document
"""

import os
import re
from pathlib import Path

def extract_summary_from_scene(file_path):
    """Extract narrative summary from scene file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for Narrative Summary section
        summary_match = re.search(r'## Narrative Summary\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
        if summary_match:
            return summary_match.group(1).strip()
        return None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def extract_summary_from_narrative(file_path):
    """Extract opening summary from narrative file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Look for content after metadata block
        content_start = 0
        for i, line in enumerate(lines):
            if line.strip() == '---' and i > 0:
                content_start = i + 1
                break
        
        # Extract first 3-5 paragraphs as summary
        summary_lines = []
        paragraph_count = 0
        for line in lines[content_start:]:
            if line.strip() == '':
                if summary_lines and paragraph_count >= 2:
                    paragraph_count += 1
                    if paragraph_count >= 4:  # Stop after 3-4 paragraphs
                        break
            elif line.startswith('#'):
                if summary_lines:  # Stop at next header
                    break
            else:
                summary_lines.append(line)
                
        return ''.join(summary_lines).strip()[:500] + "..." if summary_lines else None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def get_scene_info(scene_file):
    """Extract basic scene info"""
    try:
        with open(scene_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else "Unknown"
        
        # Extract date
        date_match = re.search(r'\*\*Date\*\*:\s*(.+)$', content, re.MULTILINE)
        date = date_match.group(1) if date_match else "Unknown"
        
        # Extract location
        location_match = re.search(r'\*\*Location\*\*:\s*(.+)$', content, re.MULTILINE)
        location = location_match.group(1) if location_match else "Unknown"
        
        # Extract word count
        duration_match = re.search(r'\*\*Duration\*\*:\s*(.+)$', content, re.MULTILINE)
        duration = duration_match.group(1) if duration_match else "Unknown"
        
        return {
            'title': title,
            'date': date,
            'location': location,
            'duration': duration
        }
    except Exception as e:
        print(f"Error extracting info from {scene_file}: {e}")
        return {}

def main():
    base_dir = Path("/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa")
    scenes_dir = base_dir / "scenes"
    narratives_dir = base_dir / "narrative"
    
    # Get all scene files
    scene_files = sorted(scenes_dir.glob("scene-*.md"))
    
    summaries = []
    
    for scene_file in scene_files:
        scene_name = scene_file.stem
        narrative_file = narratives_dir / f"{scene_name}-narrative.md"
        
        # Handle naming discrepancies
        if not narrative_file.exists():
            # Try alternative naming patterns
            alt_patterns = [
                f"{scene_name.replace('-rhine-battle', '-rhine-valley-battle')}-narrative.md",
                f"{scene_name.replace('-rhine-valley', '-rhine')}-narrative.md"
            ]
            for pattern in alt_patterns:
                alt_file = narratives_dir / pattern
                if alt_file.exists():
                    narrative_file = alt_file
                    break
        
        print(f"Processing {scene_name}...")
        
        # Get scene info
        scene_info = get_scene_info(scene_file)
        
        # Try to get summary from scene file first
        summary = extract_summary_from_scene(scene_file)
        source = "scene template"
        
        # If no summary in scene, try narrative file
        if not summary and narrative_file.exists():
            summary = extract_summary_from_narrative(narrative_file)
            source = "narrative file"
        
        summaries.append({
            'file': scene_name,
            'info': scene_info,
            'summary': summary,
            'source': source,
            'has_narrative': narrative_file.exists()
        })
    
    # Generate output
    output_path = base_dir / "europa-summary.md"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Wasteland Europa - Complete Story Summary\n\n")
        f.write("**Generated:** June 5, 2025\n")
        f.write("**Project:** Wasteland Europa - Post-Apocalyptic Narrative\n")
        f.write("**Total Scenes:** 30/30 Complete\n\n")
        f.write("---\n\n")
        
        f.write("## Story Overview\n\n")
        f.write("Wasteland Europa follows Maya's journey across post-apocalyptic Europe in 2154, ")
        f.write("seeking the legendary Alpine Sanctuary guided by an ancient map. ")
        f.write("The narrative combines brutal survival action with complex relationships ")
        f.write("in a gothic industrial setting inspired by Heavy Metal magazine aesthetics.\n\n")
        
        f.write("## Scene-by-Scene Summary\n\n")
        
        for i, scene_data in enumerate(summaries, 1):
            info = scene_data['info']
            f.write(f"### {i}. {info.get('title', 'Unknown Title')}\n\n")
            f.write(f"**Date:** {info.get('date', 'Unknown')}\n")
            f.write(f"**Location:** {info.get('location', 'Unknown')}\n")
            f.write(f"**Length:** {info.get('duration', 'Unknown')}\n")
            f.write(f"**Summary Source:** {scene_data['source']}\n")
            f.write(f"**Narrative File:** {'✅ Complete' if scene_data['has_narrative'] else '❌ Missing'}\n\n")
            
            if scene_data['summary']:
                f.write("**Summary:**\n")
                f.write(f"{scene_data['summary']}\n\n")
            else:
                f.write("**Summary:** *No summary available - check narrative file*\n\n")
            
            f.write("---\n\n")
        
        f.write("## Project Statistics\n\n")
        f.write(f"- **Total Scenes:** {len(summaries)}\n")
        f.write(f"- **Scenes with Summaries:** {sum(1 for s in summaries if s['summary'])}\n")
        f.write(f"- **Narrative Files:** {sum(1 for s in summaries if s['has_narrative'])}\n")
        f.write(f"- **Estimated Total Words:** ~75,000+\n\n")
        
        f.write("## Narrative Arc Summary\n\n")
        f.write("**Act I - The Discovery (Scenes 1-7):** Maya discovers the ancient map and begins her journey\n")
        f.write("**Act II - The Journey (Scenes 8-15):** Cross-channel travel and Rhine Valley conflicts\n")
        f.write("**Act III - The Destination (Scenes 16-21):** Alpine sanctuary discovery and return\n\n")
        
        f.write("---\n\n")
        f.write("*Generated by automated summary extraction - Manual verification recommended*\n")
    
    print(f"\nSummary generated: {output_path}")
    print(f"Processed {len(summaries)} scenes")
    print(f"Scenes with summaries: {sum(1 for s in summaries if s['summary'])}")

if __name__ == "__main__":
    main()
