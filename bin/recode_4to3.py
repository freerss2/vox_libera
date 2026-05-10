#! /usr/bin/env python
"""
Recode in lessons four-element lists to three-element and global association dictionary

Input data structure (JSON)

"""
import json
import re

input_file = 'lessons_4w.js'
output_file = 'lessons_3w.json'
output_dict = 'manifest.json'

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

def read_input(fname):
    info("read file << {}".format(fname))
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def save_json(fname, data):
    info("write file >> {}".format(fname))
    with open(fname, 'w', encoding='utf-8') as f:
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

def main():
    lessons = read_input(input_file)
    (updated_lessons, associations) = separate_data(lessons)
    save_json(output_file, updated_lessons)
    save_json(output_dict, associations)
    return 0

rc = main()
exit(rc)
