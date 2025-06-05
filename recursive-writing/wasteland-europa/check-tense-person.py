#!/usr/bin/env python3
"""
Tense and Person Consistency Checker for Wasteland Europa Narratives
Analyzes narrative files for consistent point of view and tense usage
"""

import os
import re
import spacy
from pathlib import Path
from collections import defaultdict, Counter
import argparse
import sys

# Load English language model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Error: spaCy English model not found. Install with:")
    print("python -m spacy download en_core_web_sm")
    sys.exit(1)

class TensePersonChecker:
    def __init__(self):
        # Common first person pronouns
        self.first_person = {'i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours', 'ourselves'}
        
        # Common second person pronouns
        self.second_person = {'you', 'your', 'yours', 'yourself', 'yourselves'}
        
        # Common third person pronouns
        self.third_person = {'he', 'she', 'it', 'him', 'her', 'his', 'hers', 'its', 'himself', 'herself', 'itself', 
                           'they', 'them', 'their', 'theirs', 'themselves'}
        
        # Tense indicators
        self.past_indicators = {'was', 'were', 'had', 'did', 'said', 'went', 'came', 'saw', 'felt', 'thought'}
        self.present_indicators = {'is', 'are', 'has', 'does', 'says', 'goes', 'comes', 'sees', 'feels', 'thinks'}
        self.future_indicators = {'will', 'shall', 'going to', 'would', 'could', 'should', 'might'}
    
    def extract_narrative_text(self, file_path):
        """Extract narrative text, excluding metadata and headers"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove metadata block
            content = re.sub(r'^---.*?---', '', content, flags=re.DOTALL)
            
            # Remove markdown headers
            content = re.sub(r'^#+.*$', '', content, flags=re.MULTILINE)
            
            # Remove markdown formatting
            content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)  # Bold
            content = re.sub(r'\*(.*?)\*', r'\1', content)      # Italic
            content = re.sub(r'`(.*?)`', r'\1', content)        # Code
            
            # Remove links and references
            content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)
            
            # Remove comments and file paths
            content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
            
            # Split into paragraphs and filter out short lines/metadata
            paragraphs = []
            for line in content.split('\n'):
                line = line.strip()
                if len(line) > 50 and not line.startswith('**') and ':' not in line[:20]:
                    paragraphs.append(line)
            
            return '\n'.join(paragraphs)
        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return ""
    
    def analyze_person(self, text):
        """Analyze point of view consistency"""
        doc = nlp(text.lower())
        
        person_counts = defaultdict(int)
        person_examples = defaultdict(list)
        
        for token in doc:
            if token.text in self.first_person:
                person_counts['first'] += 1
                if len(person_examples['first']) < 5:
                    person_examples['first'].append(f"'{token.text}' in: {token.sent.text[:100]}...")
            elif token.text in self.second_person:
                person_counts['second'] += 1
                if len(person_examples['second']) < 5:
                    person_examples['second'].append(f"'{token.text}' in: {token.sent.text[:100]}...")
            elif token.text in self.third_person:
                person_counts['third'] += 1
                if len(person_examples['third']) < 5:
                    person_examples['third'].append(f"'{token.text}' in: {token.sent.text[:100]}...")
        
        return person_counts, person_examples
    
    def analyze_tense(self, text):
        """Analyze tense consistency"""
        doc = nlp(text)
        
        tense_counts = defaultdict(int)
        tense_examples = defaultdict(list)
        
        for sent in doc.sents:
            sent_text = sent.text.lower()
            sent_tokens = [token.text for token in sent]
            
            # Count past tense indicators
            for indicator in self.past_indicators:
                if indicator in sent_tokens:
                    tense_counts['past'] += 1
                    if len(tense_examples['past']) < 5:
                        tense_examples['past'].append(f"'{indicator}' in: {sent.text[:100]}...")
                    break
            
            # Count present tense indicators
            for indicator in self.present_indicators:
                if indicator in sent_tokens:
                    tense_counts['present'] += 1
                    if len(tense_examples['present']) < 5:
                        tense_examples['present'].append(f"'{indicator}' in: {sent.text[:100]}...")
                    break
            
            # Count future tense indicators
            for indicator in self.future_indicators:
                if indicator in sent_text:
                    tense_counts['future'] += 1
                    if len(tense_examples['future']) < 5:
                        tense_examples['future'].append(f"'{indicator}' in: {sent.text[:100]}...")
                    break
            
            # Analyze verb tenses using spaCy
            for token in sent:
                if token.pos_ == 'VERB':
                    if token.tag_ in ['VBD', 'VBN']:  # Past tense, past participle
                        tense_counts['past_verbs'] += 1
                    elif token.tag_ in ['VBZ', 'VBP']:  # Present tense
                        tense_counts['present_verbs'] += 1
                    elif token.tag_ == 'VBG':  # Present participle
                        tense_counts['progressive'] += 1
        
        return tense_counts, tense_examples
    
    def analyze_dialogue_vs_narrative(self, text):
        """Separate dialogue from narrative for analysis"""
        # Find dialogue (text within quotes)
        dialogue_pattern = r'"([^"]*)"'
        dialogues = re.findall(dialogue_pattern, text)
        
        # Remove dialogue from text to get pure narrative
        narrative_only = re.sub(dialogue_pattern, '', text)
        
        return {
            'dialogue_count': len(dialogues),
            'dialogue_examples': dialogues[:3],
            'narrative_text': narrative_only
        }
    
    def check_file(self, file_path):
        """Analyze a single narrative file"""
        narrative_text = self.extract_narrative_text(file_path)
        
        if not narrative_text:
            return {
                'file': file_path.name,
                'error': 'No narrative text found or file read error'
            }
        
        # Separate dialogue from narrative
        dialogue_analysis = self.analyze_dialogue_vs_narrative(narrative_text)
        
        # Analyze person and tense on narrative only
        person_counts, person_examples = self.analyze_person(dialogue_analysis['narrative_text'])
        tense_counts, tense_examples = self.analyze_tense(dialogue_analysis['narrative_text'])
        
        # Determine dominant person and tense
        dominant_person = max(person_counts.items(), key=lambda x: x[1])[0] if person_counts else 'unknown'
        dominant_tense = max(tense_counts.items(), key=lambda x: x[1])[0] if tense_counts else 'unknown'
        
        # Calculate consistency scores
        total_person_count = sum(person_counts.values())
        person_consistency = (person_counts[dominant_person] / total_person_count * 100) if total_person_count > 0 else 0
        
        total_tense_count = sum(tense_counts.values())
        tense_consistency = (tense_counts[dominant_tense] / total_tense_count * 100) if total_tense_count > 0 else 0
        
        return {
            'file': file_path.name,
            'word_count': len(narrative_text.split()),
            'dominant_person': dominant_person,
            'person_consistency': round(person_consistency, 1),
            'person_counts': dict(person_counts),
            'person_examples': dict(person_examples),
            'dominant_tense': dominant_tense,
            'tense_consistency': round(tense_consistency, 1),
            'tense_counts': dict(tense_counts),
            'tense_examples': dict(tense_examples),
            'dialogue_info': dialogue_analysis
        }
    
    def generate_report(self, results, output_file=None):
        """Generate a comprehensive report"""
        report_lines = []
        
        report_lines.append("# Tense and Person Consistency Analysis Report")
        report_lines.append(f"**Generated:** {os.popen('date').read().strip()}")
        report_lines.append("**Purpose:** Check narrative consistency for Wasteland Europa project")
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")
        
        # Summary statistics
        total_files = len(results)
        files_with_errors = len([r for r in results if 'error' in r])
        
        person_distribution = Counter([r.get('dominant_person', 'unknown') for r in results if 'dominant_person' in r])
        tense_distribution = Counter([r.get('dominant_tense', 'unknown') for r in results if 'dominant_tense' in r])
        
        report_lines.append("## Summary")
        report_lines.append(f"- **Total Files Analyzed:** {total_files}")
        report_lines.append(f"- **Files with Errors:** {files_with_errors}")
        report_lines.append(f"- **Successful Analyses:** {total_files - files_with_errors}")
        report_lines.append("")
        
        report_lines.append("### Person Distribution")
        for person, count in person_distribution.most_common():
            percentage = (count / (total_files - files_with_errors)) * 100
            report_lines.append(f"- **{person.title()}:** {count} files ({percentage:.1f}%)")
        report_lines.append("")
        
        report_lines.append("### Tense Distribution")
        for tense, count in tense_distribution.most_common():
            percentage = (count / (total_files - files_with_errors)) * 100
            report_lines.append(f"- **{tense.title()}:** {count} files ({percentage:.1f}%)")
        report_lines.append("")
        
        # Consistency issues
        low_person_consistency = [r for r in results if r.get('person_consistency', 100) < 80]
        low_tense_consistency = [r for r in results if r.get('tense_consistency', 100) < 80]
        
        if low_person_consistency:
            report_lines.append("## ⚠️ Person Consistency Issues")
            for result in low_person_consistency:
                report_lines.append(f"### {result['file']}")
                report_lines.append(f"- **Dominant Person:** {result['dominant_person']}")
                report_lines.append(f"- **Consistency:** {result['person_consistency']}%")
                report_lines.append(f"- **Person Counts:** {result['person_counts']}")
                report_lines.append("")
        
        if low_tense_consistency:
            report_lines.append("## ⚠️ Tense Consistency Issues")
            for result in low_tense_consistency:
                report_lines.append(f"### {result['file']}")
                report_lines.append(f"- **Dominant Tense:** {result['dominant_tense']}")
                report_lines.append(f"- **Consistency:** {result['tense_consistency']}%")
                report_lines.append(f"- **Tense Counts:** {result['tense_counts']}")
                report_lines.append("")
        
        # Detailed file analysis
        report_lines.append("## Detailed File Analysis")
        report_lines.append("")
        
        for result in sorted(results, key=lambda x: x['file']):
            if 'error' in result:
                report_lines.append(f"### ❌ {result['file']}")
                report_lines.append(f"**Error:** {result['error']}")
                report_lines.append("")
                continue
            
            # Status indicators
            person_status = "✅" if result['person_consistency'] >= 80 else "⚠️"
            tense_status = "✅" if result['tense_consistency'] >= 80 else "⚠️"
            
            report_lines.append(f"### {person_status}{tense_status} {result['file']}")
            report_lines.append(f"- **Word Count:** {result['word_count']}")
            report_lines.append(f"- **Dominant Person:** {result['dominant_person']} ({result['person_consistency']}% consistent)")
            report_lines.append(f"- **Dominant Tense:** {result['dominant_tense']} ({result['tense_consistency']}% consistent)")
            report_lines.append(f"- **Dialogue Count:** {result['dialogue_info']['dialogue_count']} instances")
            report_lines.append("")
            
            # Show examples of inconsistencies if any
            if result['person_consistency'] < 80 and result['person_examples']:
                report_lines.append("**Person Examples:**")
                for person, examples in result['person_examples'].items():
                    if examples:
                        report_lines.append(f"- **{person.title()}:** {len(examples)} instances")
                        for example in examples[:2]:
                            report_lines.append(f"  - {example}")
                report_lines.append("")
            
            if result['tense_consistency'] < 80 and result['tense_examples']:
                report_lines.append("**Tense Examples:**")
                for tense, examples in result['tense_examples'].items():
                    if examples:
                        report_lines.append(f"- **{tense.title()}:** {len(examples)} instances")
                        for example in examples[:2]:
                            report_lines.append(f"  - {example}")
                report_lines.append("")
            
            report_lines.append("---")
            report_lines.append("")
        
        # Recommendations
        report_lines.append("## Recommendations")
        report_lines.append("")
        
        if low_person_consistency:
            report_lines.append("### Person Consistency")
            report_lines.append("- Review files with <80% person consistency")
            report_lines.append("- Ensure consistent third-person limited POV throughout narratives")
            report_lines.append("- Check for accidental first/second person intrusions")
            report_lines.append("")
        
        if low_tense_consistency:
            report_lines.append("### Tense Consistency")
            report_lines.append("- Review files with <80% tense consistency")
            report_lines.append("- Maintain past tense for narrative prose")
            report_lines.append("- Present tense acceptable in dialogue and immediate thoughts")
            report_lines.append("")
        
        report_lines.append("### Overall Quality")
        report_lines.append("- Files with ✅✅ indicators meet consistency standards")
        report_lines.append("- Files with ⚠️ indicators need review and potential revision")
        report_lines.append("- Focus manual verification on flagged files first")
        report_lines.append("")
        
        report_content = '\n'.join(report_lines)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report_content)
            print(f"Report saved to: {output_file}")
        
        return report_content

def main():
    parser = argparse.ArgumentParser(description='Check tense and person consistency in narrative files')
    parser.add_argument('directory', help='Directory containing narrative files')
    parser.add_argument('--output', '-o', help='Output report file (default: tense-person-report.md)')
    parser.add_argument('--pattern', '-p', default='*.md', help='File pattern to match (default: *.md)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    directory = Path(args.directory)
    if not directory.exists():
        print(f"Error: Directory {directory} does not exist")
        sys.exit(1)
    
    # Find narrative files
    narrative_files = list(directory.glob(args.pattern))
    if not narrative_files:
        print(f"No files matching pattern '{args.pattern}' found in {directory}")
        sys.exit(1)
    
    print(f"Found {len(narrative_files)} files to analyze...")
    
    checker = TensePersonChecker()
    results = []
    
    for file_path in sorted(narrative_files):
        if args.verbose:
            print(f"Analyzing: {file_path.name}")
        
        result = checker.check_file(file_path)
        results.append(result)
    
    # Generate report
    output_file = args.output or (directory / 'tense-person-report.md')
    report = checker.generate_report(results, output_file)
    
    # Print summary to console
    total_files = len(results)
    files_with_errors = len([r for r in results if 'error' in r])
    low_consistency_files = len([r for r in results if 
                                r.get('person_consistency', 100) < 80 or 
                                r.get('tense_consistency', 100) < 80])
    
    print(f"\nAnalysis Complete:")
    print(f"- Files analyzed: {total_files}")
    print(f"- Files with errors: {files_with_errors}")
    print(f"- Files needing review: {low_consistency_files}")
    print(f"- Report saved to: {output_file}")

if __name__ == "__main__":
    main()
