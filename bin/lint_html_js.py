#! /usr/bin/env python
"""
Lint HTML and JS code with ESLint
Usage: python lint_html_js.py [input_file]
"""

import os
import re
import subprocess
import sys

NPX_LOC = r"C:\Program Files\nodejs\npx.cmd"  # Adjust if npx is in PATH

def run_cmd_with_tee(command, log_file):
    """
    Run command, save log and return summary
    """
    last_line = ""
    print("Run command: \n{}".format(' '.join(command)))
    with open(log_file, 'w', encoding='utf-8') as f:
        # bufsize=1 means line-based buffering
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        
        for line in process.stdout:
            # sys.stdout.write(line)
            f.write(line)
            if line.strip():
                last_line = line.strip()
                
    return last_line


print(f"0. Started HTML JS linter")
input_file = 'index.html' if len(sys.argv) <= 1 else sys.argv[1]
# 1. Read HTML
print(f"1. Parsing {input_file}")
with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"1.1. Got {len(content)} bytes")

print(f"2. Collect all JS code used by this file")
inline_code = re.findall(r'<script\b[^>]*>(.*?)</script[^>]*>', content, re.DOTALL | re.IGNORECASE)
print(f"2.1. Found {len(inline_code)} inline fragments")

scripts = re.findall(r'<script src="([^"?<>]*)\??.*"[^<>]*></script[^>]*>', content, re.IGNORECASE)
print(f"2.2. Found {len(scripts)} script references")

html_calls = re.findall(r'on\w+="(\w+)\(', content)
unique_calls = list(set(html_calls))
print(f"2.3. Found {len(unique_calls)} function calls")

# 3. Build a single JS
temp_file = 'temp_bundle.js'
print(f"3. Generating intermediate file {temp_file}")
with open(temp_file, 'w', encoding='utf-8') as bundle:

    # print all sources as one source
    print(f"3.1. Writing {len(inline_code)} inline fragments")
    for i, script_code in enumerate(inline_code):
        bundle.write(f"\n/* --- Inline Script Block #{i+1} --- */\n")
        bundle.write(script_code)

    print(f"3.2. Writing {len(scripts)} scripts content")
    for script_path in scripts:
        if script_path.startswith("http://") or script_path.startswith("https://"):
            print(f"INFO: skipping include-script {script_path}")
            continue
        if os.path.exists(script_path):
            # print(f"3.1. read {script_path}")
            bundle.write(f"\n/* --- Start of {script_path} --- */\n")
            with open(script_path, 'r', encoding='utf-8') as s:
                if ('js/' not in script_path) or 'locales' in script_path:
                    first_line = s.readline()
                    first_line = first_line.split('=')[0] + " = '';\n"
                    bundle.write(first_line)
                else:
                    bundle.write(s.read())
        else:
            print(f"WARNING: missing {script_path}")

    # imitate function use
    print(f"3.3. Writing {len(unique_calls)} dummy function calls")
    for func_name in unique_calls:
        bundle.write(f"window.{func_name} = {func_name}\n")


# 4. Run ESLint
print("4. Running ESLint on bundled code...")
# npx eslint app.js > app.js.log
log_file = "eslint.log"
verdict = run_cmd_with_tee([NPX_LOC, "eslint", temp_file], log_file)
if not verdict:
    print("4.1. No errors :-)")
    # 5. Remove files
    os.remove(temp_file)
    os.remove(log_file)
    exit(0)
else:
    print(f"4.1. Summary:\n{verdict}")
    print(f"4.2. Details: {log_file}")
    exit(1)
