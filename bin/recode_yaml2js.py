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
    input strings must not contain backticks
"""
import os
import re
import json
import yaml
import argparse
from pathlib import Path

import sys
sys.path.append('.')
from validate_yaml_lesson_structure import validate_with_lines

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

def extract_sort_question_to_locales(sort_data, key, set_id, locales):
    """
    Push question specified by 'key' to locales
    """
    if key not in sort_data:
        return
    langs = list(sort_data[key].keys());
    for lang in langs:
        if set_id not in locales[lang]['sort_set']:
            locales[lang]['sort_set'][set_id] = {}
        locales[lang]['sort_set'][set_id][key] = sort_data[key].pop(lang)

def decode_sort_set(sort_set, locales, target_lang, topic_words):
    """
    Decode sort_set: list of excercises of "sort" type
    """
    # read all words in sets
    # make sure all words appear in words dictionary
    usedSetIds = []
    for sortSetRecord in sort_set:
        setId = sortSetRecord.get('id')
        # check setId
        if not setId or setId in usedSetIds:
            raise Exception(f"Missing/wrong sort_set id {sortSetRecord}")
        usedSetIds.append(setId)
        setType = sortSetRecord.get('type')
        if not setType or setType not in ('pairs', 'lists'):
            raise Exception(f"Missing/wrong sort_set type {sortSetRecord}")
        wordsToCheck = []
        if 'question1' not in sortSetRecord:
            raise Exception(f"Missing sort_set question1 {sortSetRecord}")
        # save each language question in locales
        extract_sort_question_to_locales(sortSetRecord, 'question1', setId, locales)
        extract_sort_question_to_locales(sortSetRecord, 'question2', setId, locales)
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
            found = find_matching_record(word, topic_words, target_lang)
            if not found:
                topic_words.append(['UNDEFINED', word, 'UNDEFINED'])
    return sort_set

def find_matching_record(word, records_set, targe_lang):
    """
    Find in records a record matching given word
    @return: record or None
    """
    visual = get_visual_from_vocalized(word, targe_lang)
    vocalized = word.split('@')[-1]
    search_set = (visual, vocalized)
    for r in records_set:
        if r[1].split('@')[0] in search_set or r[1].split('@')[-1] in search_set:
            return r
    return None

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
        err_msg = validate_with_lines(file)
        if err_msg:
            raise Exception(err_msg)
        lesson = read_yaml(file)
        validate_input_strings(lesson, file)
        lessons.append(lesson)
    # 2. read the file manifest.yaml
    manifest_file_name = os.path.join(dirname, INPUT_MANIFEST_FILE)
    manifest = read_yaml(manifest_file_name)
    validate_input_strings(manifest, manifest_file_name)
    return lessons, manifest

def validate_input_strings(data, source):
    """Reject backticks in YAML string values, which break generated JS template literals."""
    errors = []

    def visit(value, path):
        if isinstance(value, str):
            if '`' in value:
                errors.append(f"{path}: backtick (`) is not allowed")
        elif isinstance(value, dict):
            for key, child in value.items():
                visit(child, f"{path}.{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                visit(child, f"{path}[{index}]")

    visit(data, "$")
    if errors:
        details = "\n".join(f"  {source}: {error}" for error in errors)
        raise ValueError(f"invalid input strings:\n{details}")

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

def check_lang_item_duplication(sets, lang, item):
    """
    for given language and item check is it already registered in sets
    raise an exception when duplicated
    """
    if not item:
        return
    if lang not in sets:
        sets[lang] = [item]
        return
    if item in sets[lang]:
        raise Exception(f"duplicated entry {item} in {lang}")
    sets[lang].append(item)

def extract_from_list(materials, locales, target_lang):
    """
    Using a list of records create pure 3-element arrays and store translations in locales
    @param materials: list of records with strings per language code
    @param locales: locales object (updated with non-'en' languages translations)
    @param target_lang: target language code
    @return: list of 3-element sets [eng_str, target_lang_str, transliteration], updated locales
    """
    result = []
    # collect translations and transliterations to make sure neither set has duplications
    sets_per_lang = {}
    for row in materials:
        try:
            en = row.pop('en')
            check_lang_item_duplication(sets_per_lang, 'en', en)
            target = row.pop(target_lang)
            check_lang_item_duplication(sets_per_lang, target_lang, target)
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
                check_lang_item_duplication(sets_per_lang, 'vocalized', vocalized)
                target = f"{target}@{vocalized}"
            result.append([en, target, row.pop('transliteration')])
            for lang, translation in row.items():
                if en in locales[lang]['content'] and translation != locales[lang]['content'][en]:
                    print("WARNING: overwrite '{}' ~ '{}' with '{}'".format(
                        en, locales[lang]['content'][en], translation))
                locales[lang]['content'][en] = translation
        except Exception as e:
            raise Exception("extract for {} failed - {}".format(row, e))
    return (result, locales)

def _init_locales(locales):
    """Initialize all locale buckets used during extraction."""
    for lang in locales:
        locales[lang]['content'] = {}
        locales[lang]['explanations'] = {}
        locales[lang]['story'] = {}
        locales[lang]['sort_set'] = {}
        locales[lang]['interface'] = {}


def _collect_title_translations(title, locales, title_key):
    """Move English title and keep localized versions in interface dict."""
    new_value = title.pop('en')
    for lang in title:
        locales[lang]['interface'][new_value] = title.get(lang)
    return new_value


def _process_topic_name(topic, locales):
    """Replace topic name with English value and save localized names."""
    topic_name = topic['name'].pop('en')
    for lang in topic['name']:
        locales[lang]['interface'][topic_name] = topic['name'][lang]
    topic['name'] = topic_name


def _process_explanations(topic, topic_id, locales):
    """Convert lesson explanations to JS-friendly strings and localize them."""
    explanations = topic.get('explanations')
    if not explanations:
        return
    new_value = explanations.pop('en')
    for lang in explanations:
        locales[lang]['explanations'][topic_id] = quote_multiline_js(explanations.get(lang))
    topic['explanations'] = quote_multiline_js(new_value)


def _process_story(topic, topic_id, locales, target_lang):
    """Convert story text and keep localized versions under each language."""
    story = topic.get('story')
    if not story:
        return
    new_value = decode_story(story.pop('en'), 'en', target_lang)
    for lang in story:
        decoded_story = decode_story(story.get(lang), lang, target_lang)
        locales[lang]['story'][topic_id] = quote_multiline_js(decoded_story)
    topic['story'] = quote_multiline_js(new_value)


def _process_pairs_set(pairs_set, topic, locales, target_lang):
    """Normalize a pairs set and keep localized title translations."""
    if 'words' in pairs_set:
        set_type = 'words'
    elif 'abc' in pairs_set:
        set_type = 'abc'
    else:
        raise Exception(f"unsupported pairs set data type - {pairs_set}")
    topic_records = topic[set_type]
    extracted_list = []
    for word in pairs_set[set_type]:
        found = find_matching_record(word, topic_records, target_lang)
        if found:
            rec = found
        else:
            rec = ['UNDEFINED', word, 'UNDEFINED']
            topic_records.append(rec)
        extracted_list.append(rec)
    pairs_set[set_type] = extracted_list
    pairs_set['title'] = _collect_title_translations(pairs_set['title'], locales, 'interface')
    return pairs_set


def _process_pairs_sets(topic, locales, target_lang):
    """Normalize all pairs sets for one lesson."""
    pairs_sets = topic.get('pairs_set')
    if not pairs_sets:
        return
    topic['pairs_set'] = [
        _process_pairs_set(pairs_set, topic, locales, target_lang)
        for pairs_set in pairs_sets
    ]


def _process_topic(topic, index, locales, target_lang, updated_lessons):
    """Recode a single lesson topic and return the updated topic."""
    topic['index'] = index
    topic_id = topic.pop('id')
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
    _process_topic_name(topic, locales)
    _process_explanations(topic, topic_id, locales)
    _process_story(topic, topic_id, locales, target_lang)
    sort_set = topic.get('sort_set')
    if sort_set:
        topic['sort_set'] = decode_sort_set(sort_set, locales, target_lang, topic['words'])
    _process_pairs_sets(topic, locales, target_lang)
    return topic_id, topic


def _finalize_metadata(metadata, locales, target_lang):
    """Convert overall metadata title and feedback to JS-friendly format."""
    metadata['metadata']['title'] = _collect_title_translations(
        metadata['metadata']['title'], locales, 'interface'
    )
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


def separate_data(lessons, metadata):
    """
    Recode lessons content and extract locales
    @param lessons: topics (lessons) list received from YAML files
    @param metadata: general definitions for whole course
    @return: (updated_lessons, locales, metadata)
    Rise exception on input format errors
    """
    locales = metadata['locales']
    _init_locales(locales)

    updated_lessons = {}
    target_lang = metadata['target_language']
    for index, topic in enumerate(lessons):
        topic_id, topic = _process_topic(topic, index, locales, target_lang, updated_lessons)
        updated_lessons[topic_id] = topic

    _finalize_metadata(metadata, locales, target_lang)
    return (updated_lessons, locales, metadata)

def parse_arguments():
    """
    Parse command-line arguments.
    @return: parsed arguments
    """
    parser = argparse.ArgumentParser(description="Decode course YAML source data into JS format.")
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
