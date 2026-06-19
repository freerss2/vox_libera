#! /usr/bin/env python3
"""
This script is responsible for building course HTML files based on a template and course-specific JS files.
It also manages versioning by reading and updating a version.txt file, and ensures that the app_version constant in js/common.js is updated accordingly.
"""

import os
import re
import hashlib

VERSION_FILE = "version.txt"
CHECKSUMS_FILE = "checksums.txt"
TEMPLATE_PATH = os.path.join("src", "course.template.html")
PLACEHOLDER = "__VOX_LIBERA_SCRIPTS_PLACEHOLDER__"

def calculate_md5(filepath):
    """
    Calculate the MD5 hash of a given file.
    """
    hash_md5 = hashlib.md5()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
    except FileNotFoundError:
        return None # Return None if file doesn't exist
    return hash_md5.hexdigest()

def get_relevant_file_checksums(courses):
    """
    Calculate checksums for all files relevant to the course build process.
    """
    checksums = {}

    # Template file
    checksums[TEMPLATE_PATH] = calculate_md5(TEMPLATE_PATH)

    # Common JS file
    common_js_path = os.path.join("js", "common.js")
    checksums[common_js_path] = calculate_md5(common_js_path)

    # Course-specific files
    for course_id, web_scripts in courses.items():
        for script_path in web_scripts:
            os_path = script_path # Paths in 'web_scripts' are already relative from CWD
            checksums[os_path] = calculate_md5(os_path)

    return checksums

def load_checksums():
    """
    Load stored checksums from CHECKSUMS_FILE.
    """
    if not os.path.exists(CHECKSUMS_FILE):
        return {}

    loaded_checksums = {}
    with open(CHECKSUMS_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split(' ', 1)
            if len(parts) == 2:
                checksum, filepath = parts
                loaded_checksums[filepath] = checksum
    return loaded_checksums

def save_checksums(checksums):
    """
    Save current checksums to CHECKSUMS_FILE.
    """
    with open(CHECKSUMS_FILE, 'w', encoding='utf-8') as f:
        for filepath, checksum in checksums.items():
            if checksum:
                f.write(f"{checksum} {filepath}\n")

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

def get_and_increment_version():
    """
    Read version from file, increment the lower (patch) version if relevant files changed and save back.
    @return: new version value (string)
    """
    current_version = "2.7.0"  # Default if file doesn't exist
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, 'r', encoding='utf-8') as f:
            current_version = f.read().strip()

    # Find courses to determine relevant files for checksums
    courses = find_courses()

    # Calculate current checksums
    current_file_checksums = get_relevant_file_checksums(courses)

    # Load previously stored checksums
    stored_checksums = load_checksums()

    # Determine if any relevant files have changed
    files_changed = False
    if not stored_checksums:
        # If no previous checksums, consider it a change to establish baseline
        files_changed = True
    else:
        for filepath, current_checksum in current_file_checksums.items():
            if stored_checksums.get(filepath) != current_checksum:
                files_changed = True
                break
        # Also check if any files were removed from the relevant list
        if not files_changed:
            for filepath in stored_checksums:
                if filepath not in current_file_checksums:
                    files_changed = True
                    break

    if files_changed:
        try:
            major, minor, patch = map(int, current_version.split('.'))
            new_patch = patch + 1
            new_version = f"{major}.{minor}.{new_patch}"

            with open(VERSION_FILE, 'w', encoding='utf-8') as f:
                f.write(new_version)
            print(f"📈 Version Vox Libera updated: {current_version} -> {new_version} due to file changes.")

            save_checksums(current_file_checksums) # Save new checksums only if version was incremented
            return new_version
        except ValueError:
            print(f"⚠️ Warning: Failed to parse version in {VERSION_FILE}. Using it 'as is'.")
            save_checksums(current_file_checksums)
            return current_version
    else:
        print(f"☑️ No relevant file changes detected. Keeping version: {current_version}")
        return current_version

# Get a value for next human-readable version
VERSION = get_and_increment_version()

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