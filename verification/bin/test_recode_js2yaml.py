import sys
import tempfile
import unittest
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "bin"))
import recode_js2yaml


class RecodeJsToYamlTests(unittest.TestCase):
    def test_escape_backtics_encodes_template_literal_for_json(self):
        source = 'const text = `say "hello"\nnext`;'

        escaped = recode_js2yaml.escape_backtics(source)

        self.assertEqual(
            escaped,
            'const text = "`say \\"hello\\"<BR>next`";',
        )

    def test_decode_escaped_backtick_restores_quotes_and_line_breaks(self):
        source = '"`say \\"hello\\"<BR>next`"'

        self.assertEqual(
            recode_js2yaml.decode_escaped_backtick(source),
            'say "hello"\nnext',
        )

    def test_escape_backtics_leaves_backticks_in_quoted_strings_unchanged(self):
        source = 'const text = "a `quoted` value";'

        self.assertEqual(recode_js2yaml.escape_backtics(source), source)

    def test_decode_story_maps_sections_and_vocalization(self):
        story = (
            "##story-line## '''spoken text'''@vocalized text "
            "##story-translation## translated "
            "##story-transcr## transcription"
        )

        self.assertEqual(
            recode_js2yaml.decode_story(story, "en", "ar"),
            [
                {
                    "ar": "spoken text",
                    "vocalized": "vocalized text",
                    "en": "translated",
                    "transliteration": "transcription",
                }
            ],
        )

    def test_aggregate_list_adds_vocalization_and_locale_associations(self):
        rows = [["hello", "spoken@vocalized", "transcription"]]
        locales = {"fr": {"content": {"hello": "bonjour"}}}

        result = recode_js2yaml.aggregate_list(rows, locales, "ar")

        self.assertEqual(
            result,
            [
                {
                    "en": "hello",
                    "ar": "spoken",
                    "transliteration": "transcription",
                    "vocalized": "vocalized",
                    "fr": "bonjour",
                }
            ],
        )

    def test_append_if_missing_checks_visual_and_vocalized_forms(self):
        topic = [{"ar": "spoken", "vocalized": "vocalized"}]

        recode_js2yaml.append_if_missing(topic, {"ar": "spoken"}, "vocalized", "ar")
        recode_js2yaml.append_if_missing(topic, {"ar": "new"}, "new", "ar")

        self.assertEqual(len(topic), 2)
        self.assertEqual(topic[-1], {"ar": "new"})

    def test_rebuild_lesson_decodes_explanations_and_consumes_locale_text(self):
        topic = {"explanations": '"`English explanation`"'}
        locales = {"fr": {"explanations": {"lesson-1": '"`French explanation`"'}}}

        rebuilt, updated_locales = recode_js2yaml.rebuild_lesson(
            topic, "lesson-1", locales, "ar"
        )

        self.assertEqual(
            rebuilt,
            {
                "explanations": {
                    "en": "English explanation",
                    "fr": "French explanation",
                },
                "id": "lesson-1",
            },
        )
        self.assertEqual(updated_locales["fr"]["explanations"], {})
        self.assertNotIn("id", topic)

    def test_main_converts_course_files_into_yaml(self):
        with tempfile.TemporaryDirectory() as course_dir:
            course_path = Path(course_dir)
            (course_path / "lessons.js").write_text(
                'lessons = {"lesson-1": {"index": 1, "name": "Greetings", '
                '"words": [["hello", "marhaba", "transcription"]]}};',
                encoding="utf-8",
            )
            (course_path / "locales.js").write_text(
                'locales = {"en": {"interface": {}, "content": {}}};',
                encoding="utf-8",
            )
            (course_path / "manifest.js").write_text(
                'manifest = {"target_language": "ar", '
                '"metadata": {"title": "Course"}, "feedback": {}};',
                encoding="utf-8",
            )

            result = recode_js2yaml.main(
                type("Args", (), {"course_dir": str(course_path)})()
            )

            lesson = yaml.safe_load(
                (course_path / "yaml" / "lesson-01.yaml").read_text(
                    encoding="utf-8"
                )
            )
            manifest = yaml.safe_load(
                (course_path / "yaml" / "manifest.yaml").read_text(
                    encoding="utf-8"
                )
            )

        self.assertEqual(result, 0)
        self.assertEqual(lesson["id"], "lesson-1")
        self.assertEqual(lesson["name"], {"en": "Greetings"})
        self.assertEqual(lesson["words"][0]["ar"], "marhaba")
        self.assertEqual(manifest["metadata"]["title"], {"en": "Course"})


if __name__ == "__main__":
    unittest.main()
