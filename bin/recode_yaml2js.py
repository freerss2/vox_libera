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
        f.write(";\n")

def extract_from_list(materials, locales, target_lang):
    """
    Using a list of records create pure 3-element arrays and store translations in locales
    """
    result = []
    for row in materials:
        try:
            en = row.pop('en')
            result.append([en, row.pop(target_lang), row.pop('transliteration')])
            for lang, translation in row.items():
                if en in locales[lang]['content'] and translation != locales[lang]['content'][en]:
                    print("WARNING: overwrite '{}' ~ '{}' with '{}'".format(
                        en, locales[lang]['content'][en], translation))
                locales[lang]['content'][en] = translation
        except Exception as e:
            print("Exception for {} - {}".format(row, e))
    return (result, locales)

def separate_data(lessons, metadata):
    """
    Recode lessons content and extract locales
    """
    locales = metadata['locales']
    for lang in locales:
        locales[lang]['content'] = {}
        locales[lang]['explanations'] = {}
        locales[lang]['interface'] = {}

    updated_lessons = []
    target_lang = metadata['target_language']
    for index, topic in enumerate(lessons):
        topic['index'] = index
        topic_id = topic['id']
        if 'abc' in topic:
            (abc, locales) = extract_from_list(topic['abc'], locales, target_lang)
            topic['abc'] = abc
        if 'words' in topic:
            (words, locales) = extract_from_list(topic['words'], locales, target_lang)
            topic['words'] = words
        if 'sentences' in topic:
            (sentences, locales) = extract_from_list(topic['sentences'], locales, target_lang)
            topic['sentences'] = sentences
        # topic['name'] - replace with 'en', rest - to 'interface'
        topic_name = topic['name'].pop('en')
        for lang in topic['name']:
            locales[lang]['interface'][topic_name] = topic['name'][lang]
        topic['name'] = topic_name
        # topic['explanations'] - if exists, use 'en', rest - under each lang 'explanations'[id]
        explanations = topic.get('explanations')
        if explanations:
            new_value = explanations.pop('en')
            for lang in explanations:
                locales[lang]['explanations'][topic_id] = explanations.get(lang)
            topic['explanations'] = new_value
        # topic['story'] - if exists, use 'en', rest - under each lang 'story'[id]
        story = topic.get('story')
        if story:
            new_value = story.pop('en')
            for lang in story:
                locales[lang]['story'][topic_id] = story.get(lang)
            topic['story'] = new_value
        # same for pairs_set (list with "words"/"abc" inside)
        pairs_sets = topic.get('pairs_set')
        if pairs_sets:
            new_sets = []
            for pairs_set in pairs_sets:
                if 'words' in pairs_set:
                    key = 'words'
                elif 'abc' in pairs_set:
                    key = 'abc'
                else:
                    continue
                (new_value, locales) = extract_from_list(pairs_set[key], locales, target_lang)
                pairs_set[key] = new_value
                new_sets.append(pairs_set)
            topic['pairs_set'] = new_sets
        updated_lessons.append(topic)
    # metadata['metadata']['title'] - replace with 'en', rest - to 'interface'
    new_value = metadata['metadata']['title'].pop('en')
    for lang in metadata['metadata']['title']:
        locales[lang]['interface'][new_value] = metadata['metadata']['title'].get(lang)
    metadata['metadata']['title'] = new_value
    # TODO: metadata['feedback'] - dictionary of lists - each list to apply extract_from_list - to 'interface'
    feedback = metadata.pop('feedback')
    for key in feedback:
        new_list = []
        for rec in feedback[key]:
            en = rec.pop('en')
            new_list.append([en, rec.pop(target_lang), rec.pop('transliteration')])
            for lang in rec:
                locales[lang]['interface'][en] = rec[lang]
        feedback[key] = new_list
    metadata['feedback'] = feedback
    metadata.pop('locales')
    return (updated_lessons, locales, metadata)

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
    (updated_lessons, locales, updated_metadata) = separate_data(lessons, metadata)
    # TODO: for lessons and locales convert single string to multi-line (?)
    save_json(os.path.join(args.course_dir, OUTPUT_LESSONS_FILE), 'const topics', updated_lessons)
    save_json(os.path.join(args.course_dir, OUTPUT_LOCALES_FILE), 'const course_locales', locales)
    save_json(os.path.join(args.course_dir, OUTPUT_MANIFEST_FILE), 'const manifest', updated_metadata)
    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = main(args)
    exit(rc)
