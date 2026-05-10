#! /usr/bin/env python

import os
import re
import subprocess
import sys


def run_cmd_with_tee(command, log_file):
    """
    Run command, save log and return summary
    """
    last_line = ""
    with open(log_file, 'w', encoding='utf-8') as f:
        # bufsize=1 means line-based buffering
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        
        for line in process.stdout:
            # sys.stdout.write(line)
            f.write(line)
            if line.strip():
                last_line = line.strip()
                
    return last_line


input_file = 'index.html' if len(sys.argv) <= 1 else sys.argv[1]
# 1. Read HTML
print(f"1. Parsing {input_file}")
with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"1.1. Got {len(content)} bytes")

# 2. Get all src inside <script>
internal_scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
print(f"2.1. Found {len(internal_scripts)} internal scripts")

scripts = re.findall(r'<script src="([^"?<>]*)\??.*"[^<>]*></script>', content)
print(f"2.2. Found {len(scripts)} scripts")

html_calls = re.findall(r'on\w+="(\w+)\(', content)
unique_calls = list(set(html_calls))
print(f"2.3. Found {len(unique_calls)} function calls")

# 3. Build a single JS
temp_file = 'temp_bundle.js'
print(f"3. Generating intermediate file {temp_file}")
with open(temp_file, 'w', encoding='utf-8') as bundle:

    # print all sources as one source
    for i, script_code in enumerate(internal_scripts):
        bundle.write(f"\n/* --- Internal Script Block #{i+1} --- */\n")
        bundle.write(script_code)

    for script_path in scripts:
        if os.path.exists(script_path):
            # print(f"3.1. read {script_path}")
            bundle.write(f"\n/* --- Start of {script_path} --- */\n")
            with open(script_path, 'r', encoding='utf-8') as s:
                bundle.write(s.read())
        else:
            print(f"WARNING: missing {script_path}")

    # imitate function use
    for func_name in unique_calls:
        bundle.write(f"window.{func_name} = {func_name}\n")


# 4. Run ESLint
print("4. Running ESLint on bundled code...")
# npx eslint app.js > app.js.log
log_file = "eslint.log"
verdict = run_cmd_with_tee([r"C:\Program Files\nodejs\npx.cmd", "eslint", temp_file], log_file)
if not verdict:
    print("4.1. No errors :-)")
    # 5. Remove files
    os.remove(temp_file)
    os.remove(log_file)
else:
    print(f"4.1. Summary:\n{verdict}")
    print(f"4.2. Details: {log_file}")
