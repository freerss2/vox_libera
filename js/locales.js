// locales for UI i18n
const locales = {
  "en": {
    "__title__": "English",
    "__dir__": "ltr",
    "guide_slides": [
  {
    "anchor": "intro",
    "slides": [
  {
    "content": `
### Introduction
![Screen 1](img/user_guide01.png)
`,
    "hint": `
Hello and welcome.
Let's get familiar with the app's appearance and controls

The "three lines" button opens the settings and navigation menu for the app.
The first line of the title is the topic currently being studied, the second line is the current stage (exercise, lesson).
The buttons on the right are used to customize the app interface: turn sound on/off and adjust the text size. 
`
  }
    ]
  },
  {
    "anchor": "interface",
    "content": `
### Menu Description`,
    "slides": [
  {
    "content": `
![Screen 2](img/user_guide02.png)`,
    "hint": `
The top of the menu shows the name of the current topic. The next line displays the topic's statistics: how many words and sentences it contains and the percentage of successful exercises with them. The student's goal is to achieve the maximum percentage. Once 90% is reached, the topic can be considered complete. This result will be taken into account for review exercises. If the student simply "played around," they can reset the statistics for that topic to zero.
You can use the “Previous” and “Next” buttons to go to the previous and next topic.`
  },
  {
    "content": `
In the **center of the menu** there is a list of lessons for the current topic.
![Screen 3](img/user_guide03.png)`,
    "hint": `
This list allows you to track your progress from exercise to exercise. We'll learn more about the different types of exercises and utility screens later.`
  },
  {
    "content": `
**The bottom of the menu** is general settings.
![Screen 4](img/user_guide04.png)`,
    "hint": `
Here you can change the difficulty level, which affects the number of options in exercises. The next switch allows you to focus only on words and exercises that didn't receive the maximum percentage. The third switch turns transcription on and off in exercises. The final settings include resetting all statistics and changing the interface language.
`
  }
    ]
  },
  {
    "anchor": "usage",
    "content": `
###  Screen types and exercises`,
    "slides": [
  {
    "content": `
![Screen 5](img/user_guide05.png)`,
    "hint": `
The topic begins with an explanatory section (if needed). This section describes the topic's features and grammar details.
To proceed to the next step, simply click the button at the end of the text`
  },
  {
    "content": `
**Dictionary screen**
![Screen 6](img/user_guide06.png)`,
    "hint": `
The next step is familiarization with the words and sentences related to this topic. Clicking on a card will reveal the pronunciation. There are no game elements here; the student simply views and memorizes the new material. You can return to this screen at any time, for example, to recall a specific word. A search function is available for this purpose.`
  },
  {
    "content": `
**Flash cards (memory training cards)**
![Screen 7](img/user_guide07.png)
`,
    "hint": `
Using this screen, we practice the connection between a word and its translation. The button in the upper left corner switches the display mode of the cards: in the target language or in the user's language. You can flip the cards to look at the translation. This isn't considered an error and isn't recorded in the statistics. If you want, you can listen to the pronunciation using the "Listen Fast" and "Listen Slow" buttons in the upper right corner. If the translation is familiar, you can mark the card with the "Known" button. The "Repeat" button sets the card aside for another attempt. The card's number is shown at the top among the unlearned cards.
`  },
  {
    "content": `
![Screen 8](img/user_guide08.png)
`,
    "hint": `
After the student has marked all the cards as "Known," they are prompted to proceed to the next stage.`
  },
  {
    "content": `
**Game: Find the Pair**
![Screen 9](img/user_guide09.png)`,
    "hint": `
This is a real exercise, where the student receives a grade. The number of pairs found so far, as well as the number of errors, is shown at the top. Each attempt is recorded in the statistics for that word or sentence.`
  },
  {
    "content": `
**Quiz**
![Screen 10](img/user_guide10.png)`,
    "hint": `
The app offers three types of quizzes: finding a translation into the target language, translating from the target language, and translating what you hear. These quizzes are also stat-tracked, and the game is divided into rounds (the higher the difficulty level, the more rounds).`
  },
  {
    "content": `
![Screen 11](img/user_guide11.png)`,
    "hint": `This way quiz types are designated`
  },
  {
    "content": `
**Build-a-sentense**
![Screen 12](img/user_guide12.png)`,
    "hint": `
There are three types of exercises: constructing a sentence in the target language and in the student's language, and translating what they heard. The student must select the correct answer from the bottom "word bank." An incorrect answer reduces the percentage of successfully learned sentences. If the student feels they haven't understood anything at all, they can look up the answer by clicking the "Give up" button. This is also an error, but at least the correct answer can be immediately seen.`
  },
  {
    "content": `
**The final stage - the summary of the topic**
![Screen 13](img/user_guide13.png)`,
    "hint": `
This is a collection of random exercises containing both material from the current topic and material from previous topics. This allows the student to consolidate what they've learned and refresh their memory of previous material. The final round is divided into several rounds (the more difficult the round, the longer the round).
`
  },
  {
    "content": `
![Screen 14](img/user_guide14.png)`,
    "hint": `
At the end of the final round, the student is asked to either review (if the material isn't fully covered) or move on to the next topic.
`
  }
    ]
  },
  {
    "anchor": "summary",
    "slides": [
{
    "content": `
### Conclusion
The educational materials are created using artificial intelligence and are constantly being updated. You can send your suggestions and comments to the project's author. With sufficient computer skills, students can create their own educational materials; simply download the source code to their computer and correct or add lessons or their vocabularies. Translation of the user interface is also welcome. If anyone would like to contribute, the entire student community will be happy to accept their contribution.



















`,
    "hint": ""
}
    ]
  }
],
    "menu": {
      "words_count": "Words:",
      "sent_count": "Phrases:",
      "topic_completed": "Topic completed",
      "topic_completed_hint": "Include this topic to final round",
      "reset_topic_stats_hint": "Reset topic stats",
      "reset_topic_stats": "Reset ",
      "prev_topic": " Prev.",
      "next_topic": "Next ",
      "reload": "Reload",
      "close": "Close",
      "settings": " Settings",
      "difficulty": "Difficulty",
      "diff-easy": "Easy",
      "diff-medium": "Medium",
      "diff-hard": "Hard",
      "hide-well-learned": "Hide well-learned",
      "show-trans-toggle": "Transcription",
      "reset-all-stat": " Reset all stats"
    },
    "tip_of_the_day" : {
       "title": "Tip of the day",
       "remember_transl": "Remember translation",
       "0": "Balance Theory and Practice",
       "1": "Context is King: Learn Phrases, Not Just Words",
       "2": "Consistency Beats Intensity",
       "3": "Don't Fear Mistakes — They Are Your Best Teachers"
    },
    "modal_results": {
      "title": "Completed topic:",
      "words_learned": "Total words: ",
      "words_accuracy": "Accuracy: "
    },
    "screens": {
      "explanations":    "Explanations",
      "abc":             "ABC",
      "dictionary":      "Dictionary",
      "sentences":       "Sentences",
      "flashcards-abc":  "Letters flashcards",
      "flashcards":      "Words flashcards",
      "flashcards-sent": "Sentences flashcards",
      "story":           "Story",
      "matching-abc":    "Find a match - letters",
      "matching":        "Find a match - words",
      "quiz_u2t":        "Quiz: 👤 → 🌍",
      "quiz_t2u":        "Quiz: 🌍 → 👤",
      "quiz_audio":      "Audio-quiz",
      "sent_u2t":        "Build sentence: 👤 → 🌍",
      "sent_t2u":        "Build sentence: 🌍 → 👤",
      "sent_audio":      "Audio build sentence",
      "final":           "Topic final"
    },
    "main": {
      "app-name": "Vox Libera - learn languages",
      "app-description": `Welcome to "Vox Libera".

This is a FREE open-source application for students and for language enthusiasts.

With our website/app, you can learn a language the way you want. No need to chase imaginary points; your success is measured only by real achievements.

If you'd like to familiarize yourself with the controls and the learning process, click the "User Guide" button.

To start a course, select the course title and click on it.
`,
      "user-guide": "User Guide",
      "documentation": "Documentation",
      "flashcards_completed": "You learned all cards in this set.",
      "card-learned": "✔  Know it",
      "card-repeat": "✘ Repeat",
      "quiz-giveup-button": "✘ Give up",
      "search_hint": "Search...",
      "errors-count": "Errors: ",
      "go_forward": "GO FORWARD ",
      "hint-panel": "Click to see transcr",
      "sum-repeat": " REPEAT",
      "sum-next": "NEXT ",
      "sent-giveup-btn": "✘ Give up",
      "check": " ✔  Check "
    }
  },
  "ru": {
    "__title__": "Русский",
    "__dir__": "ltr",
    "guide_slides": [
  {
    "anchor": "intro",
    "slides": [
  {
    "content": `
### Введение
![Screen 1](img/user_guide01.png)
`,
    "hint": `
Привет и добро пожаловать.
Я помогу тебе познакомьтся с внешним видом и управлением приложением

Кнопкой “три полоски” открывается меню настроек и перемещений по приложению.
Первая строчка заголовка - название изучаемой сейчас темы, вторая - этап (упражнение, урок).
Кнопки справа используются для настройки интерфейса приложения: включение/отключение звука и регулировка размера текста.
`
  }
    ]
  },
  {
    "anchor": "interface",
    "content": `
### Описание меню
`,
    "slides": [
  {
    "content": `
![Screen 2](img/user_guide02.png)`,
    "hint": `
В верхней части меню показано название текущей темы. В следующей строке показана статистика темы: сколько слов и предложений она содержит и каков процент удачных упражнений с ними. Цель ученика - добиться максимального процента. После достижения 90% можно отметить, что тема пройдена. Этот результат будет учитываться в упражнениях на повторение изученного материала. Если ученик просто “поигрался”, он может сбросить в ноль статистику по этой теме.
Кнопками “Пред” и “След” можно переходить к предыдущей и следующей теме.
`
  },
  {
    "content": `
В **центре меню** находится список уроков текущей темы.
![Screen 3](img/user_guide03.png)`,
    "hint": `
Этот список позволяет следить за продвижением от упражнения к упражнению.
С видами упражнений и служебных экранов мы познакомимся позже.
`
  },
  {
    "content": `
**Нижняя часть меню** - общие настройки
![Screen 4](img/user_guide04.png)`,
    "hint": `
Тут можно менять уровень сложности который влияет на количество вариантов в упражнениях. Следующий переключатель позволяет сконцентрироваться только на словах и упражнениях которые не получили максимальный процент. Третий переключатель включает и выключает транскрипцию в упражнениях.
Последние элементы настроек это сброс всей статистики и смена языка интерфейса.
`
  }
    ]
  },
  {
    "anchor": "usage",
    "content": `
###  Виды экранов и упражнений
`,
    "slides": [
  {
    "content": `
![Screen 5](img/user_guide05.png)`,
    "hint": `
Тема начинается с пояснительной части (если она нужна). Тут описываются особенности темы и детали грамматики.
Чтобы перейти к следующему этапу просто нажмите кнопку в конце текста.
`
  },
  {
    "content": `
**Экран словаря**
![Screen 6](img/user_guide06.png)`,
    "hint": `
Следующий этап - знакомство со словами и предложениями этой темы. При нажатии на карточку можно услышать произношение. Тут нет никаких игровых элементов, ученик просто просматривает и запоминает новый материал. При желании можно всегда вернуться на этот экран, например чтобы вспомнить какое-то слово. Для этого есть возможность поиска.
`
  },
  {
    "content": `
**Флеш-карточки (карточки тренировки памяти)**
![Screen 7](img/user_guide07.png)
`,
    "hint": `
При помощи этого экрана мы тренируем связь между словом и переводом. Кнопка в верхнем левом углу переключает режим показа карточек: на изучаемом языке или на языке пользователя. Карточки можно переворачивать чтобы “подсмотреть” перевод. Это не считается ошибкой и не заносится в статистику. При желании можно прослушать произношение - для этого в правом верхнем углу находятся кнопки “слушать быстро” и “слушать медленно”. Если перевод знаком, можно отметить карточку кнопкой “Знаю”. Кнопка “Повторить” откладывает карточку для ещё одной попытки. Сверху указан номер карточки среди невыученных.
`  },
  {
    "content": `
![Screen 8](img/user_guide08.png)
`,
    "hint": `
После того как ученик отметил все карточки как “известные” ему предлагается перейти к следующему этапу.
`
  },
  {
    "content": `
**Игра: поиск пары**
![Screen 9](img/user_guide09.png)`,
    "hint": `
Это уже настоящее упражнение, где ученик получает оценку. Сверху показано сколько пар уже найдено, а также количество ошибок. Каждая попытка записывается в статистику данного слова или предложения.
`
  },
  {
    "content": `
**Викторина**
![Screen 10](img/user_guide10.png)`,
    "hint": `
В приложении есть три вида викторины: поиск перевода на изучаемый язык, перевод с изучаемого языка и перевод услышанного. Тут тоже учитывается статистика, а игра разбита на раунды (чем выше уровень сложности, тем больше раундов).
`
  },
  {
    "content": `
![Screen 11](img/user_guide11.png)`,
    "hint": `Так обозначаются виды викторины`
  },
  {
    "content": `
**Построение предложения**
![Screen 12](img/user_guide12.png)`,
    "hint": `
Есть три вида упражнений: построение предложения на изучаемом языке и на языке ученика, а также перевод услышанного. 
Ученик должен выбрать из нижнего “банка слов” правильный вариант.
Неправильный ответ ухудшает процент успешно выученных предложений. Если ученик чувствует, что абсолютно ничего не понял, он может подсмотреть ответ нажав кнопку “Сдаться”. Это тоже ошибка, но по крайней мере можно сразу увидеть верный вариант.
`
  },
  {
    "content": `
**Последний этап - итог темы**
![Screen 13](img/user_guide13.png)`,
    "hint": `
Это - сборник случайных упражнений, содержащий как материал текущей темы, так и материал из пройденных тем. Таким образом ученик закрепляет выученное и освежает в памяти предыдущий материал. Финал разбит на несколько раундов (чем выше сложность - тем больше). 
`
  },
  {
    "content": `
![Screen 14](img/user_guide14.png)`,
    "hint": `
По окончании последнего раунда ученику предлагается либо повторить (если материал недостаточно изучен), либо перейти к следующей теме.
`
  }
    ]
  },
  {
    "anchor": "summary",
    "slides": [
{
    "content": `
### Заключение
Учебные материалы готовятся при помощи Искусственного интеллекта и постоянно пополняются. Вы можете прислать свои пожелания и замечания автору проекта. При достаточном уровне компьютерных навыков ученики сами могут составлять себе любые учебные материалы, достаточно скачать себе на компьютер исходный код и исправить/добавить уроки или их словари. Перевод интерфейса пользователя тоже приветствуется. Если кто-то желает помочь в этом вопросе всё сообщество учащихся примет его вклад с радостью.


















`,
    "hint": ""
}
    ]
  }
],
    "menu": {
      "words_count": "Слов:",
      "sent_count": "Фраз:",
      "topic_completed": "Тема пройдена",
      "topic_completed_hint": "Включить тему в финальный раунд",
      "reset_topic_stats_hint": "Сбросить прогресс упражнений",
      "reset_topic_stats": "Сбросить ",
      "prev_topic": " Пред.",
      "next_topic": "След. ",
      "reload": "Перезагрузить",
      "close": "Закрыть",
      "settings": " Настройки",
      "difficulty": "Сложность",
      "diff-easy": "Легко",
      "diff-medium": "Средне",
      "diff-hard": "Сложно",
      "hide-well-learned": "Только невыученное",
      "show-trans-toggle": "Транскрипция",
      "reset-all-stat": " Сбросить статистику"
    },
    "tip_of_the_day" : {
       "title": "Совет дня",
       "remember_transl": "Запомни перевод",
       "0": "Сочетай теорию с практикой",
       "1": "Учи слова с учётом контекста",
       "2": "Регулярность — ключ к прогрессу",
       "3": "Не бойся ошибок — на них учатся"
    },
    "modal_results": {
      "title": "Завершена тема:",
      "words_learned": "Всего слов: ",
      "words_accuracy": "Точность: "
    },
    "screens": {
      "explanations":    "Пояснения",
      "abc":             "Алфавит",
      "dictionary":      "Словарь",
      "sentences":       "Предложения",
      "flashcards-abc":  "Карточки букв",
      "flashcards":      "Карточки слов",
      "flashcards-sent": "Карточки предложений",
      "story":           "Учебный текст",
      "matching-abc":    "Поиск пары букв",
      "matching":        "Поиск пары слов",
      "quiz_u2t":        "Викторина: 👤 → 🌍",
      "quiz_t2u":        "Викторина: 🌍 → 👤",
      "quiz_audio":      "Аудио-викторина",
      "sent_u2t":        "Предложение: 👤 → 🌍",
      "sent_t2u":        "Предложение: 🌍 → 👤",
      "sent_audio":      "Аудио-Предложение",
      "final":           "Итог темы"
    },
    "main": {
      "app-name": "Vox Libera - учим языки",
      "app-description": `Добро пожаловать в "Vox Libera".

Это бесплатное приложение с открытым исходным кодом для студентов и любителей языков.

С нашим сайтом/приложением вы можете учить язык так как вам удобно. Не нужно гнаться за воображаемыми баллами, ваш успех оценивается только реальными достижениями. 

Если хотите ознакомиться с элементами управления и процессом учёбы - нажмите кнопку "Знакомство с приложением".

Чтобы начать курс обучения выберите название курса и кликните на нём.
`,
      "user-guide": "Знакомство с приложением",
      "documentation": "Документация",
      "flashcards_completed": "Все карточки в этом наборе изучены.",
      "card-learned": "✔  Знаю",
      "card-repeat": "✘ Повторить",
      "quiz-giveup-button": "✘ Сдаюсь",
      "search_hint": "Поиск...",
      "errors-count": "Ошибки: ",
      "go_forward": "ВПЕРЁД ",
      "hint-panel": "Транскрипция по клику",
      "sum-repeat": " ПОВТОРИТЬ",
      "sum-next": "ДАЛЬШЕ ",
      "sent-giveup-btn": "✘ Сдаюсь",
      "check": " ✔  Проверить "
    }
  }
};
