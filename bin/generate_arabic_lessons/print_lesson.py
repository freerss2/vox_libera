#! /usr/bin/env python
"""
Print tables of words from JSON file in HTML and PDF (optional)

Usage:
print_lesson.py INPUT_FILE.JSON [--output=fname] [--pdf]
"""

import json
import os
import subprocess
from pathlib import Path
import argparse


def parse_args():
    parser = argparse.ArgumentParser(description="Print lesson")
    parser.add_argument("input_file", help="Input JSON file")
    parser.add_argument("--output", help="Output HTML file")
    parser.add_argument("--pdf", action="store_true", help="Create PDF too")
    args = parser.parse_args()
    return args


# Try Arabic reshaping libraries
try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    reshaper_available = True
except Exception as e:
    reshaper_available = False
    error_message = str(e)

def ar(text):
    """Reshape Arabic text if libraries available."""
    if reshaper_available:
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)
    return text  # fallback (will look broken if reshaper missing)

def gen_table(t):
    """
    Create HTML code for list of lists
    @param t: table with title line first
    @return: HTML text of table
    """
    html_output = ["<table>"]
    columns = []

    for i, row in enumerate(t):
        if i == 0:
            tag = "th"
            columns = row
        else:
            tag = "td"
        html_output.append("      <tr>")
        
        for j, cell in enumerate(row):
            # Check if the cell contains Arabic to apply RTL styling
            is_arabic = columns[j] == 'Arabic'
            css_class = ' class="arabic"' if is_arabic else ''
            
            html_output.append(f"         <{tag}{css_class}>{cell}</{tag}>")
            
        html_output.append("      </tr>")

    html_output.append("</table>")
    return "\n".join(html_output)


def gen_story(lesson_code):
    """
    Generate story (HTML) from lesson code
    @param lesson_code: dictionary with Title, sections
                        and Title+data in each section
    @return: list of HTML declarations
    """

    story = []

    html_header = f"""
<html>
<head>
    <meta charset="UTF-8">
    <style>
        table {{ border-collapse: collapse; width: 90%; table-layout: auto; }}
        th, td {{ border: 1px solid black; padding: 8px; text-align: left; }}
        .arabic {{ direction: rtl; font-family: 'DejaVu Sans', sans-serif; text-align: right; font-size: 1.2em; }}
    </style>
</head>
<body>
"""
    story.append(html_header)

    story_title = lesson_code["Title"]
    # Title
    story.append((f"<h1>{story_title}</h1>"))

    sections = lesson_code["sections"]
    for section in sections:
        section_title = section["Title"]
        story.append((f"<h2>{section_title}</h2>"))
        section_data = section["data"]
        story.append(gen_table(section_data))


    story.append("</body></html>")
    return story

def get_chrome_path():
    """
    Find Chrome in standard Windows places
    """
    paths = [
        os.environ.get("PROGRAMFILES", "C:\\Program Files") + "\\Google\\Chrome\\Application\\chrome.exe",
        os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)") + "\\Google\\Chrome\\Application\\chrome.exe",
        os.environ.get("LOCALAPPDATA", "") + "\\Google\\Chrome\\Application\\chrome.exe"
    ]
    
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def gen_pdf(input_html):
    output_pdf = input_html
    name_without_ext, old_extension = os.path.splitext(input_html)
    pdf_filename = name_without_ext + '.pdf'
    chrome_exe = get_chrome_path()
    if not chrome_exe:
        raise FileNotFoundError("Crome executable path not found")
    current_dir = Path.cwd()
    input_html = os.path.join(current_dir, input_html)
    output_pdf = os.path.join(current_dir, pdf_filename)
    args = [
        chrome_exe,
        "--headless=new",
        "--window-size=1920,1080",
        "--no-pdf-header-footer",
        f"--print-to-pdf={output_pdf}",
        str(input_html)
    ]
    result = subprocess.run(args, check=True, capture_output=True, text=True)

def main():
    rc = 0
    args = parse_args()
    try:
        input_fname = args.input_file
        print(f"Reading file: {input_fname}")
        with open(input_fname, 'r', encoding='utf-8') as file:
            lesson_code = json.load(file)
        print("Generating story")
        story = gen_story(lesson_code)
        output_fname = args.output
        if not output_fname:
            output_fname = input_fname.replace('.json', '.html')
        print(f"Saving to file: {output_fname}")
        with open(output_fname, "w", encoding="utf-8") as f:
            f.write("\n".join(story))
        if args.pdf:
            print("Saving to PDF")
            gen_pdf(output_fname)
        print("All done")
    except Exception as e:
        print(f"Failure: exception - {e}")
        rc = 1
    return rc

if __name__ == "__main__":
    rc = main()
    exit(rc)

