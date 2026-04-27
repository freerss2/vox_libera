const manifest = {
  "id": "hebrew_1",
  "author": "felixl@rambler.ru",
  "version": "2.7.3",
  "metadata": {
    "title": "Hebrew Basics",
    "description": "First 200 words and building basic sentences",
    "level": "A0",
    "prerequisites": ["Alphabet"],
    "goals": ["Basic Greetings", "Simple Sentences"]
  },
  "target_language": "he",
  "icon_code": "א",
  "feedback": {
    "perfect": [
      ["Great!", "נהדר!", "Nehedar!"],
      ["Perfect!", "מושלם!", "Mushlam!"],
    ],
    "good": [
      ["Good job!", "עבודה טובה!", "'Avoda tova!"],
      ["Well done!", "כל הכבוד!", "Kol hakavod!"]
    ],
    "tryAgain": [
      ["Try again", "נסה שוב", "Nase shuv"],
      ["Don't give up!", "אל תוותר!", "Al tevater!"]
    ]
  },
  "course_locales":
  {
    "en": {
      "__title__": "English",
      "__dir__": "ltr",
    },
    "ru": {
      "__title__": "Русский",
      "__dir__": "ltr",
      "explanations" : {
        "all": `
### Первые 200 слов и базовые конструкции предложения.
Цель курса — сформировать устойчивый **базовый лексикон**, необходимый для повседневного общения и понимания обиходной речи. 

Курс ориентирован на учащихся уровня **A0-A1**, уже знакомых с алфавитом и правилами чтения.
Тем не менее, для закрепления навыка чтения в курс добавлены уроки полностью посвящённые алфавиту.
Программа и учебные тексты структурированы с применением технологий **искусственного интеллекта**, что позволило отобрать наиболее актуальные и частотные языковые конструкции.

### Обновление 2026-04-22
Добавлен новый урок "Местоимённые предлоги 1"

### Обновление 2026-04-24
Добавлен новый урок "Алфавит 1я часть"
`,
    "abc_1": `
### Немного о языке
История иврита как языка начинается более 3000 лет тому назад. Иврит относится к семитским языкам и использует написание справа налево. Начертание букв и состав алфавита сходны с другими древними языками из ближневосточного и средиземноморского регионов. Современное начертание отличается от древних вариантов, но правила чтения остались неизменными.  Фонетика не содержит экзотических звуков, если только вы не собираетесь имитировать традиционные акценты.
`,

        "pronominal_prepositions_1": `
### Предлог «С» ('''עם''')
В иврите есть особенность — когда к предлогу im (с) добавляются суффиксы, он часто превращается в форму it- (iti, itkha). Это важно для запоминания, так как корень меняется.

### Предлог «НА» ('''על''')
В иврите он часто заменяет предлог «о» (думать о ком-то = думать на кого-то, khoshev al).

### Винительный падеж ('''את''')
Помни, что oti/otkha используется только тогда, когда мы знаем, о ком речь. Глаголы «видеть» (ro'e) и «любить» (ohev) всегда требуют этой формы.
`
      },
      "interface": {
        "Hebrew Basics": "Основы иврита",
        "First 200 words and building basic sentences": "Первые 200 слов и базовые конструкции предложения.",
        "Great!": "Отлично!",
        "Perfect!": "Превосходно!",
        "Good job!": "Хорошая работа!",
        "Well done!": "Молодец!",
        "Try again": "Попробуй еще раз",
        "Don't give up!": "Не сдавайся!",
        "All topics": "Все темы",
        "ABC 1": "Алфавит 1я часть",
        "Tell about yourself 1": "Рассказ о себе 1",
        "Professions and studies 1": "Профессии и учёба 1",
        "Everyday life 1": "Быт и обиход 1",
        "Pronominal prepositions 1": "Местоимённые предлоги 1",
        "Hobbies and travel 1": "Хобби и путешествия 1",
        "Restaurant 1": "Ресторан 1",
        "Airport 1": "Аэропорт 1",
        "Names meaning 1": "Значения имён 1",
        "Polite language 1": "Вежливые обращения 1",
        "Studying language 1": "Изучая язык 1"
      },
      "content": {
  "Aleph (silent consonant)": "Алеф (немая согласная)",
  "Bet": "Бет",
  "Vet": "Вет",
  "Gimel": "Гимел",
  "Dalet": "Далет",
  "Hey": "hей",
  "Waw": "Вав",
  "Zayin": "Зайин",
  "Khet": "Хет",
  "Tet": "Тет",
  "Yud": "Йуд",
  "pleased to meet you": "рад знакомству",
  "name": "имя",
  "profession": "профессия",
  "programmer": "программист",
  "engineer": "инженер",
  "developer": "разработчик",
  "company": "компания",
  "family": "семья",
  "father": "отец",
  "mother": "мать",
  "brother": "брат",
  "sister": "сестра",
  "house": "дом",
  "mr.": "господин",
  "mrs.": "госпожа",
  "miss": "девушка",
  "city": "город",
  "country": "страна",
  "to live": "жить",
  "to work": "работать",
  "congrats!": "поздравляю!",
  "ok": "хорошо",
  "sorry": "извини",
  "exactly": "совершенно верно",
  "thanks": "спасибо",
  "to study": "учиться",
  "now": "сейчас",
  "with": "с",
  "in": "в / внутри",
  "i work as a programmer": "я работаю программистом",
  "i work remotely": "я работаю удалённо",
  "i live in a big city": "я живу в большом городе",
  "i have a small family": "у меня небольшая семья",
  "my father is an engineer": "мой отец инженер",
  "my mother is a teacher": "моя мать учительница",
  "beautiful house": "красивый дом",
  "beautiful new house": "красивый новый дом",
  "i have a brother and a sister": "у меня есть брат и сестра",
  "i work in an international company": "я работаю в международной компании",
  "where are you from?": "откуда ты?",
  "i am from russia": "я из россии",
  "i don't understand": "я не понимаю",
  "once more please": "ещё раз пожалуйста",
  "where do you live?": "где ты живешь",
  "what is your profession?": "какая твоя профессия",
  "i study hebrew now": "я учу иврит сейчас",
  "my house is here": "мой дом здесь",
  "i love my job": "я люблю свою работу",
  "we live together": "мы живем вместе",
  "tailor": "портная",
  "mathematician": "математик",
  "teacher": "учитель",
  "designer": "дизайнер",
  "workshop": "мастерская",
  "art": "искусство",
  "academy": "академия",
  "student": "студентка",
  "cinema": "кинематография",
  "faculty / college": "факультет",
  "university": "университет",
  "lesson": "урок",
  "science": "наука",
  "blueprint / drawing": "чертеж",
  "fabric": "ткань",
  "numbers": "цифры",
  "project": "проект",
  "exam": "экзамен",
  "library": "библиотека",
  "she works as a tailor in the workshop": "она работает портной в мастерской",
  "the student studies at the faculty of arts": "студентка учится на факультете искусств",
  "the mathematician works in the academy": "математик работает в академии",
  "the designer is making a project in the studio": "дизайнер создает проект в студии",
  "the teacher explains the lesson in class": "учитель объясняет урок в классе",
  "i love cinema and art": "я люблю кинематограф и искусство",
  "she is sewing a dress from beautiful fabric": "она шьет платье из красивой ткани",
  "we study math at the university": "мы изучаем математику в университете",
  "this workshop is very big": "эта мастерская очень большая",
  "the student has an exam tomorrow": "у студентки завтра экзамен",
  "the math professor writes numbers": "профессор математики пишет цифры",
  "the academy is open for students": "академия открыта для студентов",
  "the designer works on a new blueprint": "дизайнер работает над новым чертежом",
  "the art lesson starts now": "урок искусства начинается сейчас",
  "carpet": "ковёр",
  "bed": "кровать",
  "wardrobe / closet": "шкаф",
  "room": "комната",
  "kitchen": "кухня",
  "bedroom": "спальня",
  "window": "окно",
  "floor": "пол",
  "ceiling": "потолок",
  "kettle": "чайник",
  "glass / cup": "стакан",
  "plate": "тарелка",
  "knife": "нож",
  "fork": "вилка",
  "spoon": "ложка",
  "oven / stove": "печка",
  "tap / sink": "кран / раковина",
  "the carpet is on the floor": "ковёр лежит на полу",
  "the wardrobe is in the room": "шкаф стоит в комнате",
  "the bed is big and comfortable": "кровать большая и удобная",
  "this bedroom is very bright": "эта спальня очень светлая",
  "the kitchen window is open": "окно в кухне открыто",
  "the ceiling is white and high": "потолок белый и высокий",
  "the kettle is on the stove now": "чайник сейчас на печке",
  "the glass is on the table": "стакан стоит на столе",
  "the spoon and fork are here": "ложка и вилка здесь",
  "the knife and plate are clean": "нож и тарелка чистые",
  "the tap is in the kitchen": "кран в кухне",
  "i am going to the bedroom": "я иду в спальню",
  "there is a window in the room": "в комнате есть окно",
  "where is my knife": "где лежит мой нож",
  "the kettle is hot": "чайник горячий",
  "with me": "со мной",
  "with you (m)": "с тобой (м.р.)",
  "with you (f)": "с тобой (ж.р.)",
  "in me / in it": "во мне / в нем",
  "in you (m)": "в тебе (м.р.)",
  "on me": "на мне",
  "on you (m)": "на тебе (м.р.)",
  "me (direct object)": "меня (кого/что)",
  "you (m, direct object)": "тебя (м.р.)",
  "you (f, direct object)": "тебя (ж.р.)",
  "with us": "с нами",
  "on us": "на нас",
  "do you want to go with me?": "ты хочешь пойти со мной?",
  "i love you": "я люблю тебя",
  "everything is on me": "всё на мне",
  "he is speaking with you now": "он говорит с тобой сейчас",
  "i see you": "я вижу тебя",
  "what is in it?": "что в нем?",
  "he is thinking about us": "он думает о нас",
  "do you understand me?": "ты понимаешь меня?",
  "wait for me a minute": "подожди меня минуту",
  "i am with you": "я с тобой"
}
    }
  }
}
