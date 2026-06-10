#! /usr/bin/env python3
"""
This script is responsible for building course HTML files based on a template and course-specific JS files.
It also manages versioning by reading and updating a version.txt file, and ensures that the app_version constant in js/common.js is updated accordingly.
"""

import os
import re

VERSION_FILE = "version.txt"
TEMPLATE_PATH = os.path.join("src", "course.template.html")
PLACEHOLDER = "__VOX_LIBERA_SCRIPTS_PLACEHOLDER__"

def get_and_increment_version():
    """
    Read version from file, increment the lower (patch) version and save back
    @return: new version value (string)
    """
    # When missing create new with a default value
    if not os.path.exists(VERSION_FILE):
        default_version = "2.7.0"
        with open(VERSION_FILE, 'w', encoding='utf-8') as f:
            f.write(default_version)
        return default_version

    with open(VERSION_FILE, 'r', encoding='utf-8') as f:
        version_str = f.read().strip()

    try:
        # Split a version string like this "2.7.14"
        major, minor, patch = map(int, version_str.split('.'))

        # Increment the last value
        new_patch = patch + 1
        new_version = f"{major}.{minor}.{new_patch}"

        # Save updated value back to file
        with open(VERSION_FILE, 'w', encoding='utf-8') as f:
            f.write(new_version)

        print(f"📈 Version Vox Libera updated: {version_str} -> {new_version}")
        return new_version

    except ValueError:
        # Safety for any manual intervention
        print(f"⚠️ Warning: Failed to parse version in {VERSION_FILE}. Using it 'as is'.")
        return version_str

# Get a value for next human-readable version
VERSION = get_and_increment_version()

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

def update_app_version(version):
    """
    Update app_version constant in js/common.js with the new version
    @param version: new version string
    """
    common_js_path = os.path.join("js", "common.js")

    if not os.path.exists(common_js_path):
        print(f"⚠️ Warning: {common_js_path} not found!")
        return

    # Read the file
    with open(common_js_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update app_version inline
    updated_content = re.sub(
        r"const app_version = '[^']*';",
        f"const app_version = '{version}';",
        content
    )

    # Write back if changed
    if updated_content != content:
        with open(common_js_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"✅  Updated app_version in {common_js_path} to {version}")

def build():
    """
    Main build function to generate course HTML files
    """
    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌  Error: Template {TEMPLATE_PATH} not found!")
        return

    # Update app_version in js/common.js
    update_app_version(VERSION)

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

        # Globally replace VERSION template
        final_html = final_html.replace("{{VERSION}}", VERSION)

        # Save the result in CWD
        output_filename = f'course.{course_id}.html'
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(final_html)

        print(f"✅  Successfully built course file: {output_filename} (v{VERSION})")

if __name__ == "__main__":
    build()