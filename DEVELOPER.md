# vox_libera.app - developer manual

This document is written for code developers and/or learning materials authors

## Prerequisites

The development environment assumes a basic knowledge in computers or initial assistance by some IT consultant.
So, if you are a linguist that just want to create/improve some language course, please make sure that your computer is able to run Python.

## Creating a new language course

It's recommended to take an existing course as a reference, and just replace existing materials with a desired content.
Sorry, no pre-designed templates.

## Converting the course definition to code

The code used by web-application has a bit different format than the source materials.
So, for converting human-friendly YAML to JavaScript code there is a dedicated converter program.

### Running the converter

```shell
python .\bin\recode_yaml2js.py -d course.ar1
```

Where "python" is an optional prefix for Windows OS, path ".\bin\recode_yaml2js.py" is a relative location of the program under the project area, and "course.ar1" - directory with a target course to be compiled.

The program is reading each lesson from course.ar1\yaml\lesson-NN.yaml and creates a single file lessons.js along with a locales.js

After successful convertion the updated course is instantly available for local access. Just open "index.html" in browser and select the desired course from main menu.

### Files format

 * manifest.yaml
  * main fields

```yaml
id: arabic_1
author: felixl@rambler.ru
version: 2.9.0
target_language: ar
icon_code: ع
```

> **id** - unique ID to be used for course identification by code

> **author** - optional data (not displayed by application)

> **version** - manually updated version for changes tracking in application UI

> **target_language** - learned language two-letter code (important for correct vocalization and visualization)

> **icon_code** - typical Unicode character for target language display in menus and browser tab

  * meta-data fields

```yaml
metadata:
  description: First 300 words and building basic sentences
  level: A0
  prerequisites:
  - Alphabet
  goals:
  - Basic Greetings
  - Simple Sentences
  title:
    en: Arabic Basics
    ru: Основы арабского
```

> All metadata fields are for internal use, except of "title" that is shown in course selection menu
