#! /usr/bin/env python
"""
Recode YAML representation of lessons and manifest to JS

Usage: 
    recode_yaml2js.py -d course.ar1
"""
import os
import re
import json
import yaml
import argparse
from pathlib import Path


OUTPUT_LOCALES_FILE = "locales.js"
OUTPUT_LESSONS_FILE = "lessons.js"
OUTPUT_MANIFEST_FILE = "manifest.js"
INPUT_MANIFEST_FILE = "manifest.yaml"


def info(msg):
    print("INFO: {}".format(msg))

def decode_escaped_backtick(text):
    """
    in given text replace \" with " inside backticks
    """
    text = re.sub('`"', '`', re.sub('"`', '`', text))
    split_lines = text.split('`')
    backtick = False
    result = []
    for line in split_lines:
        if backtick:
            line = re.sub(r'\\"', '"', line)
            line = re.sub('<BR>', '\n', line)
        backtick = not backtick
        result.append(line)
    return '`'.join(result)

def read_input(dirname):
    """
    Read YAML files from a course directory
    @return: lessons list and metadata content
    """
    lessons = []
    dirname = os.path.join(dirname, 'yaml')
    # 1. read all files "lesson-NN.yaml"
    directory = Path(dirname)
    lesson_files = list(directory.glob("lesson-*.yaml"))
    for file in sorted(lesson_files):
        lessons.append(read_yaml(file))
    # 2. read the file manifest.yaml
    manifest_file_name = os.path.join(dirname, INPUT_MANIFEST_FILE)
    manifest = read_yaml(manifest_file_name)
    return lessons, manifest

def read_yaml(fname):
    """
    Read YAML
    """
    info("read file << {}".format(fname))
    with open(fname, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    return data

def save_json(fname, js_variable, data):
    info("write file >> {}".format(fname))
    with open(fname, 'w', encoding='utf-8') as f:
        f.write("{} = \n".format(js_variable))
        text = json.dumps(data, ensure_ascii=False, indent=2)
        f.write(decode_escaped_backtick(text))

def extract_from_list(materials):
    d = {}
    result = []
    for row in materials:
        try:
            en = row[0]
            ru = row[1]
            result.append([row[0], row[2], row[3]])
            d[en] = ru
        except Exception as e:
            print("Exception for {} - {}".format(row, e))
    return (result, d)

def separate_data(lessons):
    associations = {}
    for name in lessons:
        topic = lessons[name]
        if 'words' in topic:
            (words, d) = extract_from_list(topic['words'])
            topic['words'] = words
            for w in d.keys():
                if w in associations and associations[w] != d[w]:
                    print("WARNING: overwrite '{}' ~ '{}' with '{}'".format(w, associations[w], d[w]))
            associations.update(d)
        if 'sentences' in topic:
            (sentences, d) = extract_from_list(topic['sentences'])
            topic['sentences'] = sentences
            for w in d.keys():
                if w in associations and associations[w] != d[w]:
                    print("WARNING: overwrite '{}' ~ '{}' with '{}'".format(w, associations[w], d[w]))
            associations.update(d)
    return (lessons, associations)

def parse_arguments():
    """
    Parse command-line arguments.
    @return: parsed arguments
    """
    parser = argparse.ArgumentParser(description="Decode course JS data into YAML format.")
    parser.add_argument('-d', '--course_dir', required=True, help="Directory containing course data.")
    return parser.parse_args()

def main(args):
    lessons, metadata = read_input(args.course_dir)
    ### !!! DEBUG:
    return 0
    (updated_lessons, associations, updated_metadata) = separate_data(lessons, metadata)
    save_json(os.path.join(args.course_dir, OUTPUT_LESSONS_FILE), 'const topics', updated_lessons)
    save_json(os.path.join(args.course_dir, OUTPUT_LOCALES_FILE), 'const course_locales', associations)
    save_json(os.path.join(args.course_dir, OUTPUT_MANIFEST_FILE), 'const manifest', updated_metadata)
    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = main(args)
    exit(rc)
