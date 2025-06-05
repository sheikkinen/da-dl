#!/usr/bin/env python3
# File: generate-scene-summaries.py
# Purpose: Extract/generate summaries from narrative files

import os
import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = "/Users/sami.j.p.heikkinen/Documents/src/summer-2025/da-dl/recursive-writing/wasteland-europa"
NARRATIVE_DIR = f"{PROJECT_ROOT}/narrative"
SCENES_DIR = f"{PROJECT_ROOT}/scenes"
OUTPUT_FILE = f"{PROJECT_ROOT}/scene-summaries-extracted.md"

def extract_summary_from_narrative(narrative_file):
    """Extract key events and summary from narrative file."""
    try:
        with open(narrative_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for existing summary sections
        summary_patterns = [
            r'## Summary.*?\n(.*?)(?=\n##|\n---|\Z)',
            r'## Scene Summary.*?\n(.*?)(?=\n##|\n---|\Z)',
            r'## Key Events.*?\n(.*?)(?=\n##|\n---|\Z)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # If no summary found, extract first few paragraphs as summary
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip() and not p.startswith('#')]
        if paragraphs:
            # Take first 2-3 substantial paragraphs
            summary_parts = []
            word_count = 0
            for para in paragraphs[:5]:  # Check first 5 paragraphs
                if len(para) > 50:  # Substantial paragraph
                    summary_parts.append(para)
                    word_count += len(para.split())
                    if word_count > 100:  # Enough content for summary
                        break
            
            if summary_parts:
                return ' '.join(summary_parts)[:500] + "..."
        
        return "No summary available - narrative content incomplete"
        
    except Exception as e:
        return f"Error reading file: {str(e)}"

def check_scene_has_summary(scene_file):
    """Check if scene template file already has a summary."""
    try:
        with open(scene_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        summary_indicators = [
            '## Narrative Summary',
            '## Scene Summary',
            '## Summary',
            'Summary:**',
            'narrative complete'
        ]
        
        for indicator in summary_indicators:
            if indicator in content:
                return True
        return False
        
    except Exception as e:
        return False

def main():
    """Generate comprehensive scene summaries."""
    print("=== SCENE SUMMARY GENERATION ===")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    summaries = []
    scenes_with_summaries = 0
    scenes_needing_summaries = 0
    
    # Process all narrative files
    narrative_files = sorted([f for f in os.listdir(NARRATIVE_DIR) if f.endswith('-narrative.md')])
    
    for narrative_file in narrative_files:
        scene_name = narrative_file.replace('-narrative.md', '')
        narrative_path = os.path.join(NARRATIVE_DIR, narrative_file)
        scene_path = os.path.join(SCENES_DIR, f"{scene_name}.md")
        
        print(f"Processing: {scene_name}")
        
        # Check if scene already has summary
        has_summary = check_scene_has_summary(scene_path) if os.path.exists(scene_path) else False
        
        # Extract summary from narrative
        summary = extract_summary_from_narrative(narrative_path)
        
        if has_summary:
            print(f"  ✅ Scene already has summary")
            scenes_with_summaries += 1
        else:
            print(f"  📝 Generated summary from narrative")
            scenes_needing_summaries += 1
        
        summaries.append({
            'scene': scene_name,
            'has_existing_summary': has_summary,
            'extracted_summary': summary,
            'narrative_file': narrative_file,
            'scene_file': f"{scene_name}.md" if os.path.exists(scene_path) else "MISSING"
        })
    
    # Generate summary report
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Wasteland Europa - Scene Summaries Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Purpose:** Cross-reference summaries for timeline verification\n\n")
        
        f.write("## Summary Status Overview\n\n")
        f.write(f"- Scenes with existing summaries: {scenes_with_summaries}\n")
        f.write(f"- Scenes needing summaries: {scenes_needing_summaries}\n")
        f.write(f"- Total scenes processed: {len(summaries)}\n\n")
        
        f.write("## Scene Summaries\n\n")
        
        for summary_data in summaries:
            f.write(f"### {summary_data['scene']}\n\n")
            f.write(f"**Files:** {summary_data['scene_file']} | {summary_data['narrative_file']}\n")
            f.write(f"**Has Summary:** {'✅ Yes' if summary_data['has_existing_summary'] else '❌ No'}\n\n")
            f.write(f"**Extracted Summary:**\n{summary_data['extracted_summary']}\n\n")
            f.write("---\n\n")
    
    print()
    print("SUMMARY GENERATION COMPLETE:")
    print("============================")
    print(f"Scenes with summaries: {scenes_with_summaries}")
    print(f"Scenes needing summaries: {scenes_needing_summaries}")
    print(f"Report saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
