const lesson_data_ver = '2.8.1';
// Enabling long word break to next line: insert a special character "Soft Hyphen"
// "само\u00ADобслуживание"
const topics = {
  "all": {
    "name": "All topics",
    "index": 0,
    "explanations": `
### The First 200 Words and Basic Sentence Constructions
The course aims to develop a stable **basic vocabulary** necessary for everyday communication and understanding of everyday speech.

The course is designed for students at levels **A0-A1** who are already familiar with the alphabet and reading rules.
However, to reinforce reading skills, the course has been supplemented with lessons entirely devoted to the alphabet.
The curriculum and course texts are structured using **artificial intelligence** technologies, which allowed us to select the most relevant and frequently used language structures.

### Update 2026-04-22
Added new lesson "Pronominal prepositions 1"

### Update 2026-04-24
Added new lesson "ABC 1"
`
  },
  "abc_1": {
    "index": 1,
    "name": "ABC 1",
    "explanations": `
### A little about the language
The history of Hebrew as a language begins over 3,000 years ago. Hebrew is a Semitic language and is written from right to left. The letterforms and alphabetic composition are similar to those of other ancient languages ​​from the Middle East and Mediterranean regions. Modern scripts differ from the ancient versions, but the rules for reading remain unchanged. The pronunciation does not contain any exotic sounds, unless you intend to imitate traditional accents.
`,
    "abc": [
      ["Aleph (silent consonant)", "א", ""],
      ["Bet", "בּ", "b"],
      ["Vet", "ב", "v"],
      ["Gimel", "ג", "g"],
      ["Dalet", "ד", "d"],
      ["Hey", "ה", "h"],
      ["Waw", "ו", "w"],
      ["Zayin", "ז", "z"],
      ["Khet", "ח", "kh"],
      ["Tet", "ט", "T"],
      ["Yud", "י", "j"]
    ],
    "words": [],
    "sentences": []
  },
  "describe_yourself_1": {
    "index": 2,
    "name": "Tell about yourself 1",
    "words": [
      [
        "pleased to meet you",
        "נעים מאוד",
        "na'im me'od"
      ],
      [
        "name",
        "שם",
        "shem"
      ],
      [
        "profession",
        "מקצוע",
        "miktzo'a"
      ],
      [
        "programmer",
        "מתכנת",
        "metakhnet"
      ],
      [
        "engineer",
        "מהנדס",
        "mehandes"
      ],
      [
        "developer",
        "מפתח",
        "mifate'akh"
      ],
      [
        "company",
        "חברה",
        "hevra"
      ],
      [
        "family",
        "משפחה",
        "mishpakha"
      ],
      [
        "father",
        "אבא",
        "aba"
      ],
      [
        "mother",
        "אמא",
        "ima"
      ],
      [
        "brother",
        "אח",
        "akh"
      ],
      [
        "sister",
        "אחות",
        "akhot"
      ],
      [
        "house",
        "בית",
        "bayit"
      ],
      [
        "mr.",
        "מר",
        "mar"
      ],
      [
        "mrs.",
        "גברת",
        "geveret"
      ],
      [
        "miss",
        "בחורה",
        "bakhura"
      ],
      [
        "city",
        "עיר",
        "ir"
      ],
      [
        "country",
        "מדינה",
        "medina"
      ],
      [
        "to live",
        "לגור",
        "lagur"
      ],
      [
        "to work",
        "לעבוד",
        "la'avod"
      ],
      [
        "congrats!",
        "מזל טוב",
        "mazal tov"
      ],
      [
        "ok",
        "בסדר",
        "be-seder"
      ],
      [
        "sorry",
        "סליחה",
        "slikha"
      ],
      [
        "exactly",
        "בדיוק",
        "bediyuk"
      ],
      [
        "thanks",
        "תודה",
        "toda"
      ],
      [
        "to study",
        "ללמוד",
        "lilmod"
      ],
      [
        "now",
        "עכשיו",
        "akhshav"
      ],
      [
        "with",
        "עם",
        "im"
      ],
      [
        "in",
        "בתוך",
        "betokh"
      ]
    ],
    "sentences": [
      [
        "i work as a programmer",
        "אני עובד כמתכנת",
        "ani oved ke-metakhnet"
      ],
      [
        "i work remotely",
        "אני עובד מרחוק",
        "ani oved me-rakhok"
      ],
      [
        "i live in a big city",
        "אני גר בעיר גדולה",
        "ani gar be-ir gdola"
      ],
      [
        "i have a small family",
        "יש לי משפחה קטנה",
        "yesh li mishpakha ktana"
      ],
      [
        "my father is an engineer",
        "אבא שלי מהנדס",
        "aba sheli mehandes"
      ],
      [
        "my mother is a teacher",
        "אמא שלי מורה",
        "ima sheli mora"
      ],
      [
        "beautiful house",
        "בית יפה",
        "bayit yafe"
      ],
      [
        "beautiful new house",
        "בית חדש ויפה",
        "bayit khadash ve-yafe"
      ],
      [
        "i have a brother and a sister",
        "יש לי אח ואחות",
        "yesh li akh ve-akhot"
      ],
      [
        "i work in an international company",
        "אני עובד בחברה בינלאומית",
        "ani oved be-hevra beynle'umit"
      ],
      [
        "where are you from?",
        "מאיפה אתה?",
        "me-eyfo ata?"
      ],
      [
        "i am from russia",
        "אני מרוסיה",
        "ani me-rusiya"
      ],
      [
        "i don't understand",
        "אני לא מבין",
        "ani lo mevin"
      ],
      [
        "once more please",
        "עוד פעם בבקשה",
        "od pa'am be-vakasha"
      ],
      [
        "where do you live?",
        "איפה אתה גר?",
        "eyfo ata gar?"
      ],
      [
        "what is your profession?",
        "מה המקצוע שלך?",
        "ma ha-miktzo'a shelkha?"
      ],
      [
        "i study hebrew now",
        "אני לומד עברית עכשיו",
        "ani lomed ivrit akhshav"
      ],
      [
        "my house is here",
        "הבית שלי פה",
        "ha-bayit sheli po"
      ],
      [
        "i love my job",
        "אני אוהב את העבודה שלי",
        "ani ohev et ha-avoda sheli"
      ],
      [
        "we live together",
        "אנחנו גרים ביחד",
        "anakhnu garim be-yakhad"
      ]
    ]
  },
  "work_n_learn_1": {
    "index": 3,
    "name": "Professions and studies 1",
    "words": [
      [
        "tailor",
        "תופרת",
        "toferet"
      ],
      [
        "mathematician",
        "מתמטיקאי",
        "matematika'i"
      ],
      [
        "teacher",
        "מורה",
        "mora"
      ],
      [
        "designer",
        "מעצב",
        "me'atzev"
      ],
      [
        "workshop",
        "סדנה",
        "sadna"
      ],
      [
        "art",
        "אמנות",
        "omanut"
      ],
      [
        "academy",
        "אקדמיה",
        "akademya"
      ],
      [
        "student",
        "סטודנטית",
        "studentit"
      ],
      [
        "cinema",
        "קולנוע",
        "kolno'a"
      ],
      [
        "faculty / college",
        "פקולטה",
        "fakulta"
      ],
      [
        "university",
        "אוניברסיטה",
        "universita"
      ],
      [
        "lesson",
        "שיעור",
        "shi'ur"
      ],
      [
        "science",
        "מדע",
        "mada"
      ],
      [
        "blueprint / drawing",
        "שרטוט",
        "sirtut"
      ],
      [
        "fabric",
        "בד",
        "bad"
      ],
      [
        "numbers",
        "מספרים",
        "misparim"
      ],
      [
        "project",
        "פרויקט",
        "proyekt"
      ],
      [
        "exam",
        "מבחן",
        "mivkhan"
      ],
      [
        "library",
        "ספרייה",
        "sifriya"
      ]
    ],
    "sentences": [
      [
        "she works as a tailor in the workshop",
        "היא עובדת כתופרת בסדנה",
        "hi ovedet ke-toferet ba-sadna"
      ],
      [
        "the student studies at the faculty of arts",
        "הסטודנטית לומדת בפקולטה לאמנויות",
        "ha-studentit lomedet ba-fakulta le-omanuyot"
      ],
      [
        "the mathematician works in the academy",
        "המתמטיקאי עובד באקדמיה",
        "ha-matematika'i oved ba-akademya"
      ],
      [
        "the designer is making a project in the studio",
        "המעצב יוצר פרויקט בסטודיו",
        "ha-me'atzev yotzer proyekt be-studio"
      ],
      [
        "the teacher explains the lesson in class",
        "המורה מסביר את השיעור בכיתה",
        "ha-more masbir et ha-shi'ur ba-kita"
      ],
      [
        "i love cinema and art",
        "אני אוהב קולנוע ואמנות",
        "ani ohev kolno'a ve-omanut"
      ],
      [
        "she is sewing a dress from beautiful fabric",
        "היא תופרת שמלה מבד יפה",
        "hi toferet simla mi-bad yafe"
      ],
      [
        "we study math at the university",
        "אנחנו לומדים מתמטיקה באוניברסיטה",
        "anakhnu lomdim matematika ba-universita"
      ],
      [
        "this workshop is very big",
        "הסדנה הזאת גדולה מאוד",
        "ha-sadna ha-zot gdola me'od"
      ],
      [
        "the student has an exam tomorrow",
        "יש לסטודנטית מבחן מחר",
        "yesh la-studentit mivkhan makhar"
      ],
      [
        "the math professor writes numbers",
        "הפרופסור למתמטיקה כותב מספרים",
        "ha-profesor le-matematika kotev misparim"
      ],
      [
        "the academy is open for students",
        "האקדמיה פתוחה לסטודנטים",
        "ha-akademya ptuha le-studentim"
      ],
      [
        "the designer works on a new blueprint",
        "המעצב עובד על שרטוט חדש",
        "ha-me'atzev oved al sirtut khadash"
      ],
      [
        "the art lesson starts now",
        "שיעור אמנות מתחיל עכשю",
        "shi'ur omanut matkhil akhshav"
      ]
    ]
  },
  "everyday_life_1": {
    "index": 4,
    "name": "Everyday life 1",
    "words": [
      [
        "carpet",
        "שטיח",
        "shati'akh"
      ],
      [
        "bed",
        "מיטה",
        "mita"
      ],
      [
        "wardrobe / closet",
        "ארון",
        "aron"
      ],
      [
        "room",
        "חדר",
        "kheder"
      ],
      [
        "kitchen",
        "מטבח",
        "mitbakh"
      ],
      [
        "bedroom",
        "חדר שינה",
        "khadar sheyna"
      ],
      [
        "window",
        "חלון",
        "khalon"
      ],
      [
        "floor",
        "רצפה",
        "ritzpa"
      ],
      [
        "ceiling",
        "תקרה",
        "tikra"
      ],
      [
        "kettle",
        "קומקום",
        "kumkum"
      ],
      [
        "glass / cup",
        "כוס",
        "kos"
      ],
      [
        "plate",
        "צלחת",
        "tzalakhat"
      ],
      [
        "knife",
        "סכין",
        "sakin"
      ],
      [
        "fork",
        "מזלג",
        "mazleg"
      ],
      [
        "spoon",
        "כף",
        "kaf"
      ],
      [
        "oven / stove",
        "תנור",
        "tanur"
      ],
      [
        "tap / sink",
        "ברז",
        "berez"
      ]
    ],
    "sentences": [
      [
        "the carpet is on the floor",
        "השטיח על הרצפה",
        "ha-shati'akh al ha-ritzpa"
      ],
      [
        "the wardrobe is in the room",
        "הארון בחדר",
        "ha-aron ba-kheder"
      ],
      [
        "the bed is big and comfortable",
        "המיטה גדולה ונוחה",
        "ha-mita gdola ve-nukha"
      ],
      [
        "this bedroom is very bright",
        "חדר השינה הזה מואר מאוד",
        "khadar ha-sheyna ha-ze mu'ar me'od"
      ],
      [
        "the kitchen window is open",
        "החלון במטבח פתוח",
        "ha-khalon ba-mitbakh patu'akh"
      ],
      [
        "the ceiling is white and high",
        "התקרה לבנה וגבוהה",
        "ha-tikra levana ve-gvoha"
      ],
      [
        "the kettle is on the stove now",
        "הקומקום על התנור עכשיו",
        "ha-kumkum al ha-tanur akhshav"
      ],
      [
        "the glass is on the table",
        "הכוס על השולחן",
        "ha-kos al ha-shulkhan"
      ],
      [
        "the spoon and fork are here",
        "הכף והמזלג פה",
        "ha-kaf ve-ha-mazleg po"
      ],
      [
        "the knife and plate are clean",
        "הסכין והצלחת נקיים",
        "ha-sakin ve-ha-tzalakhat nekiyim"
      ],
      [
        "the tap is in the kitchen",
        "הברז במטבח",
        "ha-beretz ba-mitbakh"
      ],
      [
        "i am going to the bedroom",
        "אני הולך לחדר השינה",
        "ani holekh le-khadar ha-sheyna"
      ],
      [
        "there is a window in the room",
        "יש חלון בחדר",
        "yesh khalon ba-kheder"
      ],
      [
        "where is my knife",
        "איפה הסכין שלי?",
        "eyfo ha-sakin sheli?"
      ],
      [
        "the kettle is hot",
        "הקומקום חם",
        "ha-kumkum kham"
      ]
    ]
  },
  "pronominal_prepositions_1": {
    "index": 5,
    "name": "Pronominal prepositions 1",
    "explanations": `
### Preposition "With" ('''עם''')
Hebrew has a peculiarity: when suffixes are added to the preposition im (with), it often turns into the form it- (iti, itkha). This is important to remember, as the root changes.

### Preposition "On" ('''על''')
In Hebrew, it often replaces the preposition "o" (to think of someone = to think of someone, khoshev al).

### Accusative case ('''את'''):
Remember that oti/otkha is only used when we know who is being referred to. The verbs "to see" (ro'e) and "to love" (ohev) always require this form.

`,
    "words": [
      [
        "with me",
        "איתי",
        "iti"
      ],
      [
        "with you (m)",
        "איתך",
        "itkha"
      ],
      [
        "with you (f)",
        "איתך",
        "itakh"
      ],
      [
        "in me / in it",
        "בי",
        "bi"
      ],
      [
        "in you (m)",
        "בך",
        "bekha"
      ],
      [
        "on me",
        "עלי",
        "alay"
      ],
      [
        "on you (m)",
        "עליך",
        "alekha"
      ],
      [
        "me (direct object)",
        "אותי",
        "oti"
      ],
      [
        "you (m, direct object)",
        "אותך",
        "otkha"
      ],
      [
        "you (f, direct object)",
        "אותך",
        "otakh"
      ],
      [
        "with us",
        "איתנו",
        "itanu"
      ],
      [
        "on us",
        "עלינו",
        "alenu"
      ]
    ],
    "sentences": [
      [
        "do you want to go with me?",
        "אתה רוצה ללכת איתי?",
        "ata rotze lalekhet iti?"
      ],
      [
        "i love you",
        "אני אוהב אותך",
        "ani ohev otkha"
      ],
      [
        "everything is on me",
        "הכל עלי",
        "ha-kol alay"
      ],
      [
        "he is speaking with you now",
        "הוא מדבר איתך עכשיו",
        "hu medaber itkha akhshav"
      ],
      [
        "i see you",
        "אני רואה אותך",
        "ani ro'e otkha"
      ],
      [
        "what is in it?",
        "מה יש בו?",
        "ma yesh bo?"
      ],
      [
        "he is thinking about us",
        "הוא חושב עלינו",
        "hu khoshev alenu"
      ],
      [
        "do you understand me?",
        "אתה מבין אותי?",
        "ata mevin oti?"
      ],
      [
        "wait for me a minute",
        "חכה לי דקה",
        "khake li daka"
      ],
      [
        "i am with you",
        "אני איתך",
        "ani itkha"
      ]
    ]
  }
};
