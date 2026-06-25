#! /usr/bin/env python
"""
Recode in lessons three-element lists to four-element using global association dictionary

Input data structure (JSON)

"""
import json
import re

input_file = 'lessons_3w.json'
output_file = 'lessons_4w.js'
input_dict = 'manifest.json'

def info(msg):
    print("INFO: {}".format(msg))

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

def read_input(fname):
    info("read file << {}".format(fname))
    with open(fname, 'r', encoding='utf-8') as f:
        text = escape_backtics(f.read())
        data = json.loads(text)
    return data

def save_json(fname, data):
    info("write file >> {}".format(fname))
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def aggregate_list(materials, associations):
    result = []
    for row in materials:
        try:
            en = row[0]
            ru = associations[en]
            result.append([row[0], ru, row[1], row[2]])
        except Exception as e:
            print("Exception for {} - {}".format(row, e))
    return result

def aggregate_data(lessons, associations):
    info("processing {} topics".format(len(lessons.keys())))
    total_words = 0
    total_sentences = 0
    for name in lessons:
        topic = lessons[name]
        info_words = ''
        info_sentences = ''
        if 'words' in topic:
            words = aggregate_list(topic['words'], associations)
            topic['words'] = words
            info_words = "  words: {}".format(len(words))
            total_words += len(words)
        if 'sentences' in topic:
            sentences = aggregate_list(topic['sentences'], associations)
            topic['sentences'] = sentences
            info_sentences = "  sentences: {}".format(len(sentences))
            total_sentences += len(sentences)
        # TODO: implement some mapping for "story" and "explanations"
        info(" * topic '{}' {} {}".format(name, info_words, info_sentences))
    info("total words: {} sentences: {}".format(total_words, total_sentences))
    return lessons

def main():
    lessons = read_input(input_file)
    associations = read_input(input_dict)
    updated_lessons = aggregate_data(lessons, associations)
    save_json(output_file, updated_lessons)
    return 0

rc = main()
exit(rc)
