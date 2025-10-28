#!/usr/bin/env python3
import re
import sys

def extract_component_files(ts_file):
    with open(ts_file, 'r') as f:
        content = f.read()
    
    # Extract template
    template_match = re.search(r'template:\s*`\n(.*?)\n\s+`,', content, re.DOTALL)
    if template_match:
        template = template_match.group(1)
        # Remove leading spaces (4 spaces indentation)
        template_lines = template.split('\n')
        template_lines = [line[4:] if len(line) >= 4 and line[:4] == '    ' else line for line in template_lines]
        template = '\n'.join(template_lines)
        
        html_file = ts_file.replace('.ts', '.html')
        with open(html_file, 'w') as f:
            f.write(template)
        print(f"Created {html_file}")
    
    # Extract styles
    styles_match = re.search(r'styles:\s*\[`\n(.*?)\n\s+`\]', content, re.DOTALL)
    if styles_match:
        styles = styles_match.group(1)
        # Remove leading spaces (4 spaces indentation)
        styles_lines = styles.split('\n')
        styles_lines = [line[4:] if len(line) >= 4 and line[:4] == '    ' else line for line in styles_lines]
        styles = '\n'.join(styles_lines)
        
        scss_file = ts_file.replace('.ts', '.scss')
        with open(scss_file, 'w') as f:
            f.write(styles)
        print(f"Created {scss_file}")
    
    # Update TS file
    content = re.sub(r'template:\s*`\n.*?\n\s+`,', "templateUrl: './{}',".format(ts_file.split('/')[-1].replace('.ts', '.html')), content, flags=re.DOTALL)
    content = re.sub(r'styles:\s*\[`\n.*?\n\s+`\]', "styleUrls: ['./{}']".format(ts_file.split('/')[-1].replace('.ts', '.scss')), content, flags=re.DOTALL)
    
    with open(ts_file, 'w') as f:
        f.write(content)
    print(f"Updated {ts_file}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python extract-template.py <component.ts>")
        sys.exit(1)
    
    extract_component_files(sys.argv[1])
