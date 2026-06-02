#! /usr/bin/env python3

import os
import re

VERSION = "2-7"
TEMPLATE_PATH = os.path.join("src", "course.template.html")
PLACEHOLDER = "__VOX_LIBERA_SCRIPTS_PLACEHOLDER__"

def find_courses():
    """
    Scan CWD for valid course folders
    @return: dictionary of cources and their files
    """
    courses = {}
    # Find dirs like course.ar1, course.en_ru
    course_pattern = re.compile(r'^course\.([a-zA-Z0-9_-]+)$')

    for entry in os.listdir('.'):
        if os.path.isdir(entry):
            match = course_pattern.match(entry)
            if match:
                course_id = match.group(1)
                
                # Required files under the course dir
                manifest_os_path = os.path.join(entry, "manifest.js")
                lessons_os_path = os.path.join(entry, "lessons.js")
                
                # Check files existance
                if os.path.exists(manifest_os_path) and os.path.exists(lessons_os_path):
                    # Store relative paths for injecting into HTML
                    courses[course_id] = [
                        f"course.{course_id}/manifest.js",
                        f"course.{course_id}/lessons.js"
                    ]
                else:
                    print(f"⚠️ Warning: In dir {entry} missing manifest.js or lessons.js. Skipped.")
                    
    return courses

def build():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌  Error: Template {TEMPLATE_PATH} not found!")
        return

    # Read the template
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        template = f.read()

    # Find courses and their files
    courses = find_courses()
    
    if not courses:
        print("⚠️ Dirs like 'course.<id>' not found.")
        return

    # Generate HTML per course
    for course_id, web_scripts in courses.items():
        scripts_html = ""
        for script_path in web_scripts:
            scripts_html += f'    <script src="{script_path}?ver={VERSION}" defer></script>\n'
        
        # Replace placeholder with generated content
        final_html = template.replace(PLACEHOLDER, scripts_html.strip())
        
        # Save the result in CWD
        output_filename = f'course.{course_id}.html'
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(final_html)
            
        print(f"✅  Successfully built course file: {output_filename}")

if __name__ == "__main__":
    build()