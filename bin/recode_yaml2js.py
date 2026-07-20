#! /usr/bin/env python
"""
Recode YAML representation of lessons and manifest to JS

Usage: 
    recode_yaml2js.py -d course.ar1

Conversions:
    abc, words and sentences records are split into "english" "target" "transliteration" triples
    the rest of languages tanslations are stored in localization dictionaries

Input checks:
    lesson ID must be unique
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

VOCALIZATION_PER_LANG = {
    'he': {'regex': re.compile(r'[\u05B0-\u05BB\u05BD-\u05C4\u05C7]')},
    'ar': {'regex': re.compile(r'[\u064B-\u0650\u0652\u0653\u0670]')}
}

def _report(severity, msg):
    print(f"{severity}: {msg}")

def info(msg):
    _report("INFO", msg)

def error(msg):
    _report("ERROR", msg)

def quote_multiline_js(text):
    """
    For given text perform pre-dump quotation
    replace real newlines with <BR>, place backticks ` around the string
    """
    text = text.replace("\n", "<BR>")
    return f"`{text}`"

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

def decode_sort_set(sort_set, user_lang, target_lang, topic_words):
    """
    Decode sort_set: list of excercises of "sort" type
    """
    # read all words in sets
    # make sure all words appear in words dictionary
    for sortSetRecord in sort_set:
        setType = sortSetRecord.get('type')
        if not setType or setType not in ('pairs', 'lists'):
            raise Exception(f"Missing/wrong sort_set type {sortSetRecord}")
        wordsToCheck = []
        if 'question1' not in sortSetRecord:
            raise Exception(f"Missing sort_set question1 {sortSetRecord}")
        if 'data' not in sortSetRecord:
            raise Exception(f"Missing sort_set data {sortSetRecord}")
        sortSetData = sortSetRecord['data']
        if setType == 'pairs':
            for pair in sortSetData:
                wordsToCheck.append(pair[0])
                wordsToCheck.append(pair[1])
        else:
            for i, val in enumerate(sortSetData[0]):
                wordsToCheck.append(val)
                wordsToCheck.append(sortSetData[1][i])
        # check that wordsToCheck present in topic_words
        for word in wordsToCheck:
            visual = get_visual_from_vocalized(word, target_lang)
            vocalized = word.split('@')[-1]
            found = [tw for tw in topic_words
                     if tw[1].split('@')[0] in (visual, vocalized) or
                        tw[1].split('@')[-1] in (visual, vocalized)]
            if not found:
                topic_words.append(['UNDEFINED', word, 'UNDEFINED'])
    return sort_set

def decode_story(story, user_lang, target_lang):
    """
    @param story: list of records
    @param user_lang: user language code
    @param target_lang: target language code
    @return: multi-line string with records encoded to sections ##section-name## section body
    Sections are: story-line (target lang), story-translation (user lang), story-transcr (transliteration)
    Target language text is additionally quoted with '''text'''
    """
    result_list = []
    sections_mapping = {
        'story-line': target_lang, 'story-translation': user_lang, 'story-transcr': 'transliteration'
    }
    for line in story:
        text_line = []
        for section in ('story-line', 'story-translation', 'story-transcr'):
            body = line.get(sections_mapping[section])
            if not body:
                print(f"ERROR: missing section {section} in story {line}")
                continue
            if section == 'story-line':
                vocalized = line.get('vocalized')
                if vocalized:
                    visual = body
                else:
                    # No pre-defined vocalization, let's build visual and vocalized
                    visual = get_visual_from_vocalized(body, target_lang)
                    if visual:
                        vocalized = body
                # and add vocalized to body
                if vocalized:
                    body = f"{visual}@{vocalized}"
                body = f"''' {body} '''"
            text_line.append(f"##{section}## {body}")
        result_list.append(' '.join(text_line))
    return "\n".join(result_list)

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

def get_visual_from_vocalized(v_text, target_lang):
    """
    If target language supports vocalized version - try to get two representations for text
    @return: visual representation (non-vocalized) or nothing
    """
    lang_config = VOCALIZATION_PER_LANG.get(target_lang)
    if not lang_config:
        return ''
    compiled_regex = lang_config['regex']
    has_vocalization = bool(compiled_regex.search(v_text))
    # check is there vocalization characters in text
    if not has_vocalization:
        return ''
    # create visual presentation text and return it
    return compiled_regex.sub('', v_text)

def extract_from_list(materials, locales, target_lang):
    """
    Using a list of records create pure 3-element arrays and store translations in locales
    """
    result = []
    for row in materials:
        try:
            en = row.pop('en')
            target = row.pop(target_lang)
            # TODO: for target languages like he/ar make sure that all characters inside are legal
            vocalized = row.pop('vocalized', '')
            # for vocalized version - pack it with a target language visual representation
            if not vocalized:
                # when no explicit vocalization - try to apply automatic generator per target language
                visual = get_visual_from_vocalized(target, target_lang)
                if visual:
                    vocalized = target 
                    target = visual
            if vocalized:
                target = f"{target}@{vocalized}"
            result.append([en, target, row.pop('transliteration')])
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
    @param lessons: topics (lessons) list received from YAML files
    @param metadata: general definitions for whole course
    @return: (updated_lessons, locales, metadata)
    Rise exception on input format errors
    """
    locales = metadata['locales']
    for lang in locales:
        locales[lang]['content'] = {}
        locales[lang]['explanations'] = {}
        locales[lang]['story'] = {}
        locales[lang]['interface'] = {}

    updated_lessons = {}
    target_lang = metadata['target_language']
    for index, topic in enumerate(lessons):
        topic['index'] = index
        topic_id = topic.pop('id')
        # check lesson ID uniquness
        if topic_id in updated_lessons:
            raise Exception(f"duplicated topic (lesson) ID: {topic_id}")
        if 'abc' in topic:
            (abc, locales) = extract_from_list(topic['abc'], locales, target_lang)
            topic['abc'] = abc
        if 'words' in topic and topic['words']:
            (words, locales) = extract_from_list(topic['words'], locales, target_lang)
            topic['words'] = words
        else:
            topic['words'] = []
        if 'sentences' in topic and topic['sentences']:
            (sentences, locales) = extract_from_list(topic['sentences'], locales, target_lang)
            topic['sentences'] = sentences
        else:
            topic['sentences'] = []
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
                locales[lang]['explanations'][topic_id] = quote_multiline_js(explanations.get(lang))
            topic['explanations'] = quote_multiline_js(new_value)
        # topic['story'] - if exists, use 'en', rest - under each lang 'story'[id]
        story = topic.get('story')
        if story:
            new_value = decode_story(story.pop('en'), 'en', target_lang)
            for lang in story:
                decoded_story = decode_story(story.get(lang), lang, target_lang)
                locales[lang]['story'][topic_id] = quote_multiline_js(decoded_story)
            topic['story'] = quote_multiline_js(new_value)
        sort_set = topic.get('sort_set')
        if sort_set:
            new_sort_set = decode_sort_set(sort_set, 'en', target_lang, topic['words'])
            # TODO: decode other translations too
            topic['sort_set'] = new_sort_set
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
                    raise Exception(f"unsupported pairs set data type - {pairs_set}")
                (new_value, locales) = extract_from_list(pairs_set[key], locales, target_lang)
                pairs_set[key] = new_value
                # split title translations
                pairs_set_title = pairs_set['title'].pop('en')
                for lang in pairs_set['title']:
                    locales[lang]['interface'][pairs_set_title] = pairs_set['title'][lang]
                pairs_set['title'] = pairs_set_title
                new_sets.append(pairs_set)
            topic['pairs_set'] = new_sets
        updated_lessons[topic_id] = topic
    # metadata['metadata']['title'] - replace with 'en', rest - to 'interface'
    new_value = metadata['metadata']['title'].pop('en')
    for lang in metadata['metadata']['title']:
        locales[lang]['interface'][new_value] = metadata['metadata']['title'].get(lang)
    metadata['metadata']['title'] = new_value
    # metadata['feedback'] - dictionary of lists - each list to apply extract_from_list - to 'interface'
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
    try:
        lessons, metadata = read_input(args.course_dir)
        (updated_lessons, locales, updated_metadata) = separate_data(lessons, metadata)
        save_json(os.path.join(args.course_dir, OUTPUT_LESSONS_FILE), 'const topics', updated_lessons)
        save_json(os.path.join(args.course_dir, OUTPUT_LOCALES_FILE), 'const course_locales', locales)
        save_json(os.path.join(args.course_dir, OUTPUT_MANIFEST_FILE), 'const manifest', updated_metadata)
    except Exception as e:
        error(f"failure - {e}, operation aborted!")
        return 1
    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = main(args)
    exit(rc)
