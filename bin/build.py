#! /usr/bin/env python3
"""
This script is responsible for building course HTML files based on a template and course-specific JS files.
It also manages versioning by reading and updating a version.txt file, and ensures that the app_version constant in js/common.js is updated accordingly.
"""

import os
import re
import hashlib
import xml.etree.ElementTree as ET

VERSION_FILE = "version.txt"
CHECKSUMS_FILE = "checksums.txt"
TEMPLATE_PATH = os.path.join("src", "course.template.html")
LUCIDE_IMG_DIR = os.path.join("img", "lucide")
PLACEHOLDER = "__VOX_LIBERA_SCRIPTS_PLACEHOLDER__"


def generate_svg_sprite(source_svg_dir, id_prefix="lucide-"):
    """
    Generate a single SVG sprite sheet from individual SVG files in the specified directory.
    Each SVG file is wrapped in a <symbol> tag with an id based on the filename (e.g., 'smile.svg' becomes 'lucide-smile').
    The resulting sprite sheet is saved as an HTML snippet that can be embedded in web pages.
    @param source_svg_dir: Directory containing individual SVG files.
    @return: generted HTML content as a string, or None if an error occurred.
    """
    svg_files = [f for f in os.listdir(source_svg_dir) if f.endswith('.svg')]
    
    if not svg_files:
        print(f"No SVG files found in the specified directory: {source_svg_dir}")
        return ''

    # Initialize the sprite sheet list
    sprite_elements = []
    
    # Standard XML namespaces often found in SVGs
    ET.register_namespace('', "http://www.w3.org/2000/svg")

    rc = 0
    for file_name in svg_files:
        file_path = os.path.join(source_svg_dir, file_name)
        icon_id = os.path.splitext(file_name)[0] # e.g., 'smile' from 'smile.svg'
        
        try:
            # Parse the SVG file
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Create a new <symbol> element
            symbol = ET.Element('symbol')
            symbol.set('id', f"{id_prefix}{icon_id}")
            
            # Inherit structural/styling attributes from the root <svg> if they exist
            # This preserves Lucide's defaults (viewBox, fill, stroke, etc.)
            attributes_to_keep = [
                'viewBox', 'fill', 'stroke', 'stroke-width', 
                'stroke-linecap', 'stroke-linejoin'
            ]
            for attr in attributes_to_keep:
                if attr in root.attrib:
                    symbol.set(attr, root.attrib[attr])
            
            # If viewBox wasn't found, ensure it defaults to Lucide standard
            if 'viewBox' not in symbol.attrib:
                symbol.set('viewBox', '0 0 24 24')

            # Append all child paths, circles, lines, etc., into the symbol
            for child in root:
                symbol.append(child)
                
            # Convert the symbol element back into a beautifully formatted string
            symbol_str = ET.tostring(symbol, encoding='utf-8').decode('utf-8')
            sprite_elements.append(f"  {symbol_str}")
            
        except ET.ParseError:
            print(f"Skipping {file_name}: Invalid XML format.")
        except Exception as e:
            print(f"Error processing {file_name}: {e}")
            rc = 1

    # Wrap all symbols into the hidden master SVG container
    html_output = (
        '<svg style="display: none;" xmlns="http://www.w3.org/2000/svg">\n'
        + "\n".join(sprite_elements)
        + '\n</svg>'
    )

    return html_output


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

    # Common JS files
    common_files = ['common.js', 'i18n.js', 'settings.js', 'locales.js']
    for common_file in common_files:
        common_file_path = os.path.join("js", common_file)
        checksums[common_file_path] = calculate_md5(common_file_path)

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

def get_version(no_version_increment=False):
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

    # Determine if any relevant files have changed
    files_changed = False

    if no_version_increment:
        print("ℹ️  No version increment requested. Skipping checksum comparison.")
    else:
        # Calculate current checksums
        current_file_checksums = get_relevant_file_checksums(courses)

        # Load previously stored checksums
        stored_checksums = load_checksums()
        if not stored_checksums:
            # If no previous checksums, consider it a change to establish baseline
            print("⚠️ No previous checksums found. Establishing baseline.")
            files_changed = True
        else:
            for filepath, current_checksum in current_file_checksums.items():
                if stored_checksums.get(filepath) != current_checksum:
                    print(f"⚠️ Detected change in file: {filepath}")
                    files_changed = True
                    break
            # Also check if any files were removed from the relevant list
            if not files_changed:
                for filepath in stored_checksums:
                    if filepath not in current_file_checksums:
                        print(f"⚠️ Detected removed file: {filepath}")
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

def parse_arguments():
    """
    Parse command-line arguments.
    @return: parsed arguments
    """
    import argparse

    parser = argparse.ArgumentParser(description="Build course HTML files from template and JS files.")
    parser.add_argument('-n', '--no_version_increment', action='store_true', help="Do not increment version.")
    return parser.parse_args()

def get_embedded_html(file_name):
    """
    Read embedded HTML from file
    @return: file content (string)
    """
    content = ''
    if os.path.exists(file_name):
        with open(file_name, 'r', encoding='utf-8') as f:
            content = f.read().strip()
    if not content:
        print(f"❌  Error: Failed to read embedded HTML {file_name}!")
    return content


def build(args):
    """
    Main build function to generate course HTML files
    @return: rc
    """
    # Get a value for next human-readable version
    app_version = get_version(args.no_version_increment)

    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌  Error: Template {TEMPLATE_PATH} not found!")
        return 1

    # Update app_version in js/common.js
    update_app_version(app_version)

    # Read the template
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        template = f.read()

    # Find courses and their files
    courses = find_courses()

    if not courses:
        print("⚠️ Dirs like 'course.<id>' not found.")
        return 1

    # Get common embedded data
    embedded_html = generate_svg_sprite(LUCIDE_IMG_DIR, id_prefix="lucide-")
    if not embedded_html:
        print(f"❌  Error: Failed to generate embedded HTML from {LUCIDE_IMG_DIR}!")
        return 1

    # Generate HTML per course
    for course_id, web_scripts in courses.items():
        scripts_html = embedded_html + "\n"
        for script_path in web_scripts:
            scripts_html += f'    <script src="{script_path}?ver={app_version}" defer></script>\n'

        # Replace placeholder with generated content
        final_html = template.replace(PLACEHOLDER, scripts_html.strip())

        # Globally replace VERSION template
        final_html = final_html.replace("{{VERSION}}", app_version)

        # Save the result in CWD
        output_filename = f'course.{course_id}.html'
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(final_html)

        print(f"✅  Successfully built course file: {output_filename} (v{app_version})")
    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = build(args)
    exit(rc)