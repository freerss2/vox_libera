#! /usr/bin/env python
"""
Lint dictionary for language course

Usage:

   lint_dictionary.py course.xx/lessons.js
"""

import sys
import json
import re

def get_args():
    """
    Get command line arguments
    """
    if len(sys.argv) != 2:
       print("Usage: lint_dictionary.py course.xx/lessons.js")
       return None
    return sys.argv[1]

def read_file(file_path):
    """
    Read file content
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return None

def quot_escape(line):
    """
    Escape " in backtick JS blocks
    " => \\"
    """
    return re.sub("\n", '<BR>', re.sub('"', r'\"', line))

def escape_backtics(text):
    """
    Escape quotes inside backticks block
    """
    split_lines = text.split('`')
    result = []
    backtick = False
    for line in split_lines:
        if backtick:
            line = '"`' + quot_escape(line) + '`"'
        result.append(line)
        backtick = not backtick
    return " ".join(result)

def extract_dictionary(file_content):
    """
    Extract dictionary from file content
    """
    try:
        file_content = file_content.split("\n")[1:]  # Skip first line
        file_content[0] = re.sub(r"const topics = ", '', file_content[0])
        file_content[-1] = re.sub(r";$", '', file_content[-1  ])
        file_content = "\n".join(file_content).strip()
        file_content = escape_backtics(file_content)
        return json.loads(file_content)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

def check_dictionary(dictionary):
    """
    Check dictionary for issues
    """
    rc = 0
    global_translations = {}
    global_content = {}
    for topic_id in dictionary:
         topic = dictionary[topic_id]
         print(f"Checking topic {topic_id}:")
         words = topic.get("words", [])
         sentences = topic.get("sentences", [])
         topic_translation = {}
         topic_content = {}
         print(f"  Found {len(words)} words and {len(sentences)} sentences")
         topic_set = words + sentences
         for entry in topic_set:
             if len(entry) != 3:
                 print(f"  Error: entry {entry} does not have 3 elements")
                 rc = 1
             for i, element in enumerate(entry):
                 if not isinstance(element, str):
                     print(f"  Error: entry {entry} element {i} is not a string")
                     rc = 1
             translation = entry[0]
             content = entry[1]
             if translation in global_translations:
                 print(f"  Error: translation '{translation}' already exists in topic {global_translations[translation]}")
                 rc = 1
             else:
                 global_translations[translation] = topic_id
             if content in global_content:
                 print(f"  Error: content '{content}' already exists in topic {global_content[content]}")
                 rc = 1
             else:
                 global_content[content] = topic_id
             if translation in topic_translation:
                 print(f"  Error: translation '{translation}' already exists in topic {topic_id}")
                 rc = 1
             else:
                 topic_translation[translation] = content
             if content in topic_content.values():
                 print(f"  Error: content '{content}' already exists in topic {topic_id}")
                 rc = 1
             else:
                 topic_content[content] = translation
    return rc

def main():
    """
    Lint dictionary for language course
    """
    file_path = get_args()
    if file_path is None:
        return 1
    print(f"Linting {file_path}")  

    file_content = read_file(file_path)
    if file_content is None:
        return 1

    dictionary = extract_dictionary(file_content)
    if dictionary is None:
        return 1
    
    print(f"Dictionary extracted from {file_path}")
    rc = check_dictionary(dictionary)

    return rc

if __name__ == "__main__":
    rc = main()
    exit(rc)