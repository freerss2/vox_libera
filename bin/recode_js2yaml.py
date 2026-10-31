#! /usr/bin/env python3
"""
Recode in lessons three-element lists to four-element using global association dictionary

Usage: 
    recode_js2yaml.py -d course.he1

"""
import os
import re
import json
import yaml
import argparse

INPUT_LOCALES_FILE = "locales.js"
INPUT_LESSONS_FILE = "lessons.js"
INPUT_MANIFEST_FILE = "manifest.js"
OUTPUT_MANIFEST_FILE = "manifest.yaml"

def str_presenter(dumper, data):
    if '\n' in data:
        # Kill leading whitespace/newlines, add one newline at end
        data = data.lstrip('\n ').rstrip() + '\n'
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    return dumper.represent_scalar('tag:yaml.org,2002:str', data)

yaml.add_representer(str, str_presenter) 

def _notify(severity, msg):
    print(f"{severity}: {msg}")

def info(msg):
    _notify("INFO", msg)

def error(msg):
    _notify("ERROR", msg)

def quot_escape(line):
    """
    Escape " in backtick JS blocks
    " => \\"
    """
    return re.sub("\n", '<BR>', re.sub('"', r'\"', line))

def escape_backtics(text):
    """
    Escape quotes inside JS template literals, while leaving literal backticks
    inside ordinary quoted strings unchanged.
    """
    result = []
    i = 0
    in_single_quote = False
    in_double_quote = False

    while i < len(text):
        ch = text[i]
        prev = text[i - 1] if i > 0 else ''

        if ch == "'" and not in_double_quote and prev != "\\":
            in_single_quote = not in_single_quote
            result.append(ch)
            i += 1
            continue

        if ch == '"' and not in_single_quote and prev != "\\":
            in_double_quote = not in_double_quote
            result.append(ch)
            i += 1
            continue

        if ch == '`' and not in_single_quote and not in_double_quote:
            i += 1
            content = []
            while i < len(text):
                if text[i] == '`' and text[i - 1] != "\\":
                    break
                content.append(text[i])
                i += 1
            result.append('"`' + quot_escape(''.join(content)) + '`"')
            if i < len(text):
                i += 1
            continue

        result.append(ch)
        i += 1

    return ''.join(result)

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
    return ''.join(result)

def decode_story(story_text, user_lang, target_lang):
    """
    @param story_text: story text, delimited with "\n"
    Each line contains 3 sections ##SECTION-NAME## SECTION BODY
    Sections are: story-line (target lang), story-translation (user lang), story-transcr (transliteration)
    Target language text is additionally quoted with '''text'''
    @param user_lang: code for user lang
    @param target_lang: code for target lang
    @return: list of records having each section under right key
    """
    result_list = []
    pattern = r'##(\S+?)##\s*(.*?)(?=\s*##\S+?##|$)'

    sections_mapping = {
        'story-line': target_lang, 'story-translation': user_lang, 'story-transcr': 'transliteration'
    }
    for line in story_text.split('\n'):
        matches = re.findall(pattern, line.strip())
        if not matches:
            continue
        line_rec = {}
        for section_name, body in matches:
            vocalized = None
            if section_name == 'story-line':
                body = body.replace("'''", "")
                # try to separate vocalized/visual representation
                if '@' in body:
                    (body, vocalized) = body.split('@')[:2]
            line_rec[sections_mapping[section_name]] = body.strip()
            if vocalized:
                line_rec['vocalized'] = vocalized.strip()
        result_list.append(line_rec)

    return result_list

def read_input(fname):
    """
    Read input file and return JSON data (without variable name)
    @param fname: input file name
    @return: JSON data
    """
    info("read file << {}".format(fname))
    with open(fname, 'r', encoding='utf-8') as f:
        text = escape_backtics(f.read())
        var_name = text.split('=')[0].strip()
        info("got variable >> {}".format(var_name))
        text = '='.join(text.split('=')[1:]).replace('};', '}')
        try:
            data = json.loads(text)
        except Exception as e:
            error(f"failed reading JSON input {e}")
            exit(1)
    return data

def save_json(fname, data):
    info("write file >> {}".format(fname))
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def save_yaml(fname, data):
    info("write file >> {}".format(fname))
    with open(fname, 'w', encoding='utf-8') as f:
        yaml.dump({'id': data.pop('id', 'unknown')}, f)
        yaml.dump(data, f,
                  allow_unicode=True,
                  sort_keys=False,
                  default_flow_style=False,
                  width=4096)

def aggregate_list(materials, locales, target_lang):
    """
    Use a list of 3-element sets to build a list of records with all languages translations
    @param materials: input list
    @param locales: information for localization per language
    @param target_lang: target language code
    @return: list of fully filled records
    """
    result = []
    for row in materials:
        try:
            en = row[0]
            target_str = row[1]
            if '@' in target_str:
                (target_str, vocalized) = target_str.split('@')[:2]
            else:
                vocalized = None
            record = {'en': en, target_lang: target_str, 'transliteration': row[2]}
            if vocalized:
                record['vocalized'] = vocalized
            for lang in locales:
                associations = locales[lang].get('content', {})
                if en in associations:
                   record[lang] = associations[en] 
            result.append(record)
        except Exception as e:
            error("Exception for {} - {}".format(row, e))
    return result

def aggregate_data(lessons, locales, manifest):
    """
    Aggregate data from lessons and locales
    @param lessons: list of lessons with words and sentences
    @param locales: set of locales with associations per language
    @param manifest: course manifest with metadata
    @return: aggregated lessons with words and sentences, and manifest
    """
    info("processing {} topics".format(len(lessons.keys())))
    target_lang = manifest.get('target_language', 'ar')
    _aggregate_metadata(locales, manifest)
    totals = {'abc': 0, 'words': 0, 'sentences': 0}
    for name, topic in lessons.items():
        counts = _aggregate_topic(topic, name, locales, target_lang)
        for collection in totals:
            totals[collection] += counts[collection]
    info("total words: {} sentences: {} abc: {}".format(
        totals['words'], totals['sentences'], totals['abc']))
    _aggregate_feedback(manifest, locales, target_lang)
    for lang in locales:
        locales[lang].pop('content', None)
    manifest['locales'] = locales
    return lessons, manifest

def _aggregate_metadata(locales, manifest):
    metadata_title = {'en': manifest.get('metadata', {}).pop('title', '')}
    for lang in locales:
        if 'interface' not in locales[lang]:
            continue
        value = locales[lang].get('interface', {}).pop(metadata_title['en'], '')
        if value:
            metadata_title[lang] = value
        if 'explanations' not in locales[lang]:
            locales[lang]['explanations'] = {}
        if 'story' not in locales[lang]:
            locales[lang]['story'] = {}
    manifest['metadata']['title'] = metadata_title

def _aggregate_topic(topic, name, locales, target_lang):
    counts = _aggregate_topic_lists(topic, locales, target_lang)
    _aggregate_sort_sets(topic, locales)
    _aggregate_pairs_sets(topic, locales, target_lang)
    topic['name'] = {'en': topic.get('name', name)}
    topic['name'].update(_take_interface_translations(locales, topic['name']['en']))
    info(" * topic '{}'   words: {}   sentences: {}   abc: {}".format(
        name, counts['words'], counts['sentences'], counts['abc']))
    return counts

def _aggregate_topic_lists(topic, locales, target_lang):
    counts = {'abc': 0, 'words': 0, 'sentences': 0}
    for collection in counts:
        if collection in topic:
            topic[collection] = aggregate_list(topic[collection], locales, target_lang)
            counts[collection] = len(topic[collection])
    return counts

def _aggregate_sort_sets(topic, locales):
    for sort_set_data in topic.get('sort_set', []):
        sort_set_id = sort_set_data['id']
        questions1 = {}
        questions2 = {}
        for lang in locales:
            rec = locales[lang]['sort_set'].get(sort_set_id)
            if not rec:
                continue
            questions1[lang] = rec['question1']
            if 'question2' in rec:
                questions2[lang] = rec['question2']
        sort_set_data['question1'] = questions1
        if questions2:
            sort_set_data['question2'] = questions2

def _aggregate_pairs_sets(topic, locales, target_lang):
    for pairs_set in topic.get('pairs_set', []):
        set_type = 'abc' if 'abc' in pairs_set else 'words' if 'words' in pairs_set else None
        if not set_type:
            continue
        aggregated = aggregate_list(pairs_set[set_type], locales, target_lang)
        pure_str_list = []
        for rec in aggregated:
            target_str = rec.get(target_lang)
            pure_str_list.append(target_str)
            if not target_str:
                error(f"failed to parse {rec}")
                continue
            append_if_missing(topic[set_type], rec, target_str, target_lang)
        pairs_set[set_type] = pure_str_list
        title = pairs_set['title']
        pairs_set['title'] = {'en': title}
        pairs_set['title'].update(_take_interface_translations(locales, title))

def _take_interface_translations(locales, text):
    translations = {}
    for lang in locales:
        if 'interface' not in locales[lang]:
            continue
        value = locales[lang].get('interface', {}).pop(text, '')
        if value:
            translations[lang] = value
    return translations

def _aggregate_feedback(manifest, locales, target_lang):
    for feedback_id, feedback in manifest.get('feedback', {}).items():
        records = []
        for item in feedback:
            record = {'en': item[0], target_lang: item[1], 'transliteration': item[2]}
            record.update(_take_interface_translations(locales, item[0]))
            records.append(record)
        manifest['feedback'][feedback_id] = records

def append_if_missing(topic_list, rec, target_str, target_lang):
    """
    Lookup for target string in topic list
    If missing - append this record
    """
    for t in topic_list:
        t_visual = t.get(target_lang)
        t_vocalized = t.get('vocalized')
        if target_str in (t_visual, t_vocalized):
            # Found - no need to duplicate
            return
    topic_list.append(rec)

def parse_arguments():
    """
    Parse command-line arguments.
    @return: parsed arguments
    """
    parser = argparse.ArgumentParser(description="Decode course JS data into YAML format.")
    parser.add_argument('-d', '--course_dir', required=True, help="Directory containing course data.")
    return parser.parse_args()

def safe_mkdir(path):
    """
    Create a directory if it does not exist.
    @param path: directory path
    """
    if not os.path.exists(path):
        os.makedirs(path)
        info("created directory {}".format(path))

def rebuild_lesson(topic, topic_id, locales, target_lang):
    """
    Rebuild a lesson topic with updated structure.
    @param topic: original topic data
    @param topic_id: ID of the topic
    @param locales: set of locales with associations per language
    @return: rebuilt topic data, updated locales with removed associations
    """
    rebuilt_topic = topic.copy()
    rebuilt_topic['id'] = topic_id
    explanations = topic.get('explanations', '')
    story = topic.get('story', '')
    if explanations:
        explanations = {'en': decode_escaped_backtick(explanations)}
        for lang, content in locales.items():
            if 'explanations' in content and topic_id in content['explanations']:
                topic_explanation = locales[lang]['explanations'].pop(topic_id, '')
                explanations[lang] = decode_escaped_backtick(topic_explanation)
        rebuilt_topic['explanations'] = explanations
    if story:
        decoded_story = decode_escaped_backtick(story)
        story = {'en': decode_story(decoded_story, 'en', target_lang)}
        for lang, content in locales.items():
            if 'story' in content and topic_id in content['story']:
                topic_story = locales[lang]['story'].pop(topic_id, '')
                if not topic_story:
                    continue
                decoded_topic_lang_story = decode_escaped_backtick(topic_story)
                story[lang] = decode_story(decoded_topic_lang_story, lang, target_lang)
        rebuilt_topic['story'] = story
    return rebuilt_topic, locales

def main(args):
    lessons = read_input(os.path.join(args.course_dir, INPUT_LESSONS_FILE))
    locales = read_input(os.path.join(args.course_dir, INPUT_LOCALES_FILE))
    manifest = read_input(os.path.join(args.course_dir, INPUT_MANIFEST_FILE))
    target_lang = manifest.get('target_language', 'ar')
    updated_lessons, updated_manifest = aggregate_data(lessons, locales, manifest)
    updated_locales = updated_manifest.get('locales', {})

    yaml_dir = os.path.join(args.course_dir, 'yaml')
    safe_mkdir(yaml_dir)
    for lesson_id in updated_lessons:
        topic = updated_lessons[lesson_id]
        topic, updated_locales = rebuild_lesson(topic, lesson_id, updated_locales, target_lang)
        index = topic.pop('index', 0)
        lesson_file = os.path.join(yaml_dir, "lesson-%02.2d.yaml" % int(index))
        save_yaml(lesson_file, topic)
    updated_manifest['locales'] = updated_locales
    save_yaml(os.path.join(yaml_dir, OUTPUT_MANIFEST_FILE), updated_manifest)

    return 0

if __name__ == "__main__":
    args = parse_arguments()
    rc = main(args)
    exit(rc)
