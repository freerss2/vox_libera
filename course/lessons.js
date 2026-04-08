const lesson_data_ver = '2.7.4';
// Enabling long word break to next line: insert a special character "Soft Hyphen"
// "само\u00ADобслуживание"
const topics = {
  "all": {
    "name": "All topics",
    "index": 0
  },
  "describe_yourself_1": {
    "index": 1,
    "name": "Tell about yourself 1",
    "words": [
      [
        "nice to meet you",
        "تشرفنا",
        "tasharrafna"
      ],
      [
        "name",
        "اسم",
        "ism"
      ],
      [
        "profession",
        "مهنة",
        "mihna"
      ],
      [
        "programmer",
        "مبرمج",
        "mubarmij"
      ],
      [
        "engineer",
        "مهندس",
        "muhandis"
      ],
      [
        "developer",
        "مطور",
        "mutawwir"
      ],
      [
        "company",
        "شركة",
        "ash-sharika"
      ],
      [
        "family",
        "عائلة",
        "a'ila"
      ],
      [
        "father",
        "أب",
        "ab"
      ],
      [
        "mother",
        "أم",
        "umm"
      ],
      [
        "brother",
        "أخ",
        "akh"
      ],
      [
        "sister",
        "أخت",
        "ukht"
      ],
      [
        "house",
        "بيت",
        "bayt"
      ],
      [
        "mr.",
        "سيد",
        "sayyid"
      ],
      [
        "mrs.",
        "سيدة",
        "sayyida"
      ],
      [
        "miss",
        "آنسة",
        "anisa"
      ],
      [
        "city",
        "مدينة",
        "madina"
      ],
      [
        "country",
        "بلد",
        "balad"
      ],
      [
        "to live",
        "سكن",
        "sakan"
      ],
      [
        "to work",
        "عمل",
        "amal"
      ],
      [
        "congrats!",
        "مبروك",
        "mabruk"
      ],
      [
        "ok",
        "تمام",
        "tamam"
      ],
      [
        "sorry",
        "آسف",
        "asif"
      ],
      [
        "exactly",
        "تماماً",
        "tamaman"
      ],
      [
        "thanks",
        "شكراً",
        "shukran"
      ],
      [
        "to study",
        "درس",
        "daras"
      ],
      [
        "now",
        "الآن",
        "al-an"
      ],
      [
        "with",
        "مع",
        "ma'a"
      ],
      [
        "in",
        "في",
        "fi"
      ]
    ],
    "sentences": [
      [
        "i work as a programmer",
        "بشتغل مبرمج",
        "bashtaghil mubarmij"
      ],
      [
        "i work remotely",
        "بشتغل عن بعد",
        "bashtaghil an bu'd"
      ],
      [
        "i live in a big city",
        "ساكن في مدينة كبيرة",
        "sakin fi madina kabira"
      ],
      [
        "i have a small family",
        "عندي عائلة صغيرة",
        "indi a'ila saghira"
      ],
      [
        "my father is an engineer",
        "أبوي مهندس",
        "abuy muhandis"
      ],
      [
        "my mother is a teacher",
        "أمي معلمة",
        "ummi mu'allima"
      ],
      [
        "beautiful house",
        "بيت جميل",
        "bayt jamil"
      ],
      [
        "beautiful new house",
        "بيت جديد جميل",
        "bayt jadid jamil"
      ],
      [
        "i have a brother and a sister",
        "عندي أخ وأخت",
        "indi akh wa ukht"
      ],
      [
        "i work in an international company",
        "بشتغل في شركة دولية",
        "bashtaghil fi sharika dawliya"
      ],
      [
        "where are you from?",
        "من وين أنت",
        "min wayn anta"
      ],
      [
        "i am from russia",
        "أنا من روسيا",
        "ana min rusiya"
      ],
      [
        "i don't understand",
        "مش فاهم",
        "mish fahim"
      ],
      [
        "once more please",
        "كمان مرة لو سمحت",
        "kaman marra law samaht"
      ],
      [
        "where do you live?",
        "وين ساكن",
        "wayn sakin"
      ],
      [
        "what is your profession?",
        "شو مهنتك",
        "shu mihnatak"
      ],
      [
        "i study arabic now",
        "بدرس اللغة العربية الآن",
        "badrus al-lugha al-arabiya al-an"
      ],
      [
        "my house is here",
        "بيتي هنا",
        "bayti huna"
      ],
      [
        "i love my job",
        "بحب شغلي",
        "bahibb shughli"
      ],
      [
        "we live together",
        "ساكنين مع بعض",
        "saknin ma' ba'ad"
      ]
    ]
  },
  "work_n_learn_1": {
    "index": 2,
    "name": "Professions and studies 1",
    "words": [
      [
        "tailor",
        "خياطة",
        "khayyata"
      ],
      [
        "mathematician",
        "عالم رياضيات",
        "alim riyadiyat"
      ],
      [
        "teacher",
        "معلم",
        "muallim"
      ],
      [
        "designer",
        "مصمم",
        "musammim"
      ],
      [
        "workshop",
        "ورشة",
        "warsha"
      ],
      [
        "art",
        "فن",
        "fann"
      ],
      [
        "academy",
        "أكاديمية",
        "akadimiya"
      ],
      [
        "student",
        "طالبة",
        "taliba"
      ],
      [
        "cinema",
        "سينما",
        "sinima"
      ],
      [
        "faculty / college",
        "كلية",
        "kulliya"
      ],
      [
        "university",
        "جامعة",
        "jamia"
      ],
      [
        "lesson",
        "درس",
        "dars"
      ],
      [
        "science",
        "علم",
        "ilm"
      ],
      [
        "blueprint / drawing",
        "مخطط",
        "mukhattat"
      ],
      [
        "fabric",
        "قماش",
        "qumash"
      ],
      [
        "numbers",
        "أرقام",
        "arqam"
      ],
      [
        "project",
        "مشروع",
        "mashru"
      ],
      [
        "exam",
        "امتحان",
        "al-imtihan"
      ],
      [
        "library",
        "مكتبة",
        "maktaba"
      ]
    ],
    "sentences": [
      [
        "she works as a tailor in the workshop",
        "بتشتغل خياطة في الورشة",
        "bitshataghil khayyata fil-warsha"
      ],
      [
        "the student studies at the faculty of arts",
        "الطالبة بتدرس في كلية الفنون",
        "at-taliba bitadrus fi kulliyat al-funun"
      ],
      [
        "the mathematician works in the academy",
        "عالم الرياضيات بيشتغل في الأكاديمية",
        "alim ar-riyadiyat bishataghil fil-akadimiya"
      ],
      [
        "the designer is making a project in the studio",
        "المصمم بيعمل مشروع في الاستوديو",
        "al-musammim bi'amal mashru fil-ustudiyu"
      ],
      [
        "the teacher explains the lesson in class",
        "المعلم بيشرح الدرس في الصف",
        "al-muallim bishrah ad-dars fis-saff"
      ],
      [
        "i love cinema and art",
        "بحب السينما والفن",
        "bahibb as-sinima wal-fann"
      ],
      [
        "she is sewing a dress from beautiful fabric",
        "بتخيط فستان من قماش جميل",
        "bitkhayyit fustan min qumash jamil"
      ],
      [
        "we study math at the university",
        "بندرس رياضيات في الجامعة",
        "bandrus riyadiyat fil-jamia"
      ],
      [
        "this workshop is very big",
        "هذه الورشة كبيرة كثير",
        "hadhihi al-warsha kabira kathir"
      ],
      [
        "the student has an exam tomorrow",
        "الطالبة عندها امتحان بكرة",
        "at-taliba indha imtihan bukra"
      ],
      [
        "the math professor writes numbers",
        "أستاذ الرياضيات بيكتب الأرقام",
        "ustadh ar-riyadiyat biyaktub al-arqam"
      ],
      [
        "the academy is open for students",
        "الأكاديمية مفتوحة للطلاب",
        "al-akadimiya maftuha lit-tullab"
      ],
      [
        "the designer works on a new blueprint",
        "المصمم بيشتغل على مخطط جديد",
        "al-musammim bishataghil ala mukhattat jadid"
      ],
      [
        "the art lesson starts now",
        "درس الفن بيبدأ الآن",
        "dars al-fann biyabda al-an"
      ]
    ]
  },
  "everyday_life_1": {
    "index": 3,
    "name": "Everyday life 1",
    "words": [
      [
        "carpet",
        "سجادة",
        "as-sajjada"
      ],
      [
        "bed",
        "سرير",
        "as-sarir"
      ],
      [
        "wardrobe / closet",
        "خزانة",
        "al-khizana"
      ],
      [
        "room",
        "غرفة",
        "al-ghurfa"
      ],
      [
        "kitchen",
        "مطبخ",
        "al-matbakh"
      ],
      [
        "bedroom",
        "غرفة نوم",
        "ghurfat nawm"
      ],
      [
        "window",
        "شباك",
        "ash-shubbak"
      ],
      [
        "floor",
        "أرضية",
        "al-ardiya"
      ],
      [
        "ceiling",
        "سقف",
        "as-saqf"
      ],
      [
        "kettle",
        "غلاية",
        "al-ghallaya"
      ],
      [
        "glass / cup",
        "كاسة",
        "kasa"
      ],
      [
        "plate",
        "صحن",
        "sahn"
      ],
      [
        "knife",
        "سكين",
        "as-sikkin"
      ],
      [
        "fork",
        "شوكة",
        "ash-shawka"
      ],
      [
        "spoon",
        "معلقة",
        "ma'laqa"
      ],
      [
        "oven / stove",
        "فرن",
        "al-furn"
      ],
      [
        "tap / sink",
        "حنفية",
        "al-hanafiya"
      ]
    ],
    "sentences": [
      [
        "the carpet is on the floor",
        "السجادة على الأرض",
        "as-sajjada 'ala al-ard"
      ],
      [
        "the wardrobe is in the room",
        "الخزانة في الغرفة",
        "al-khizana fil-ghurfa"
      ],
      [
        "the bed is big and comfortable",
        "السرير كبير ومريح",
        "as-sarir kabir wa murih"
      ],
      [
        "this bedroom is very bright",
        "غرفة النوم هذه منيرة كثير",
        "ghurfat an-nawm hadhihi munira kathir"
      ],
      [
        "the kitchen window is open",
        "شباك المطبح مفتوح",
        "shubbak al-matbakh maftuh"
      ],
      [
        "the ceiling is white and high",
        "السقف أبيض وعالي",
        "as-saqf abyad wa 'ali"
      ],
      [
        "the kettle is on the stove now",
        "الغلاية على الفرن الآن",
        "al-ghallaya 'ala al-furn al-an"
      ],
      [
        "the glass is on the table",
        "الكاسة على الطاولة",
        "al-kasa 'ala at-tawila"
      ],
      [
        "the spoon and fork are here",
        "المعلقة والشوكة هنا",
        "al-ma'laqa wash-shawka huna"
      ],
      [
        "the knife and plate are clean",
        "السكين والصحن نظيفين",
        "as-sikkin was-sahn nadhifin"
      ],
      [
        "the tap is in the kitchen",
        "الحنفية في المطبخ",
        "al-hanafiya fil-matbakh"
      ],
      [
        "i am going to the bedroom",
        "بروح على غرفة النوم",
        "baruh 'ala ghurfat an-nawm"
      ],
      [
        "there is a window in the room",
        "فيه شباك في الغرفة",
        "fi shubbak fil-ghurfa"
      ],
      [
        "where is my knife",
        "وين سكيني",
        "wayn sikkini"
      ],
      [
        "the kettle is hot",
        "الغلاية سخنة",
        "al-ghallaya sukhna"
      ]
    ]
  },
  "hobby_travel_1": {
    "index": 4,
    "name": "Hobbies and travel 1",
    "words": [
      [
        "renting",
        "استئجار",
        "isti'jar"
      ],
      [
        "inside the country",
        "داخل البلاد",
        "dakhil al-bilad"
      ],
      [
        "city",
        "مدينة",
        "madina"
      ],
      [
        "abroad",
        "خارج البلاد",
        "kharij al-bilad"
      ],
      [
        "here",
        "هنا",
        "huna"
      ],
      [
        "studying",
        "دراسة",
        "dirasa"
      ],
      [
        "culture",
        "ثقافة",
        "thaqafa"
      ],
      [
        "better",
        "أفضل",
        "afdal"
      ],
      [
        "car",
        "سيارة",
        "as-sayyara"
      ],
      [
        "music",
        "موسيقى",
        "al-musiqa"
      ],
      [
        "people / nation",
        "شعب",
        "ash-sha'b"
      ],
      [
        "public transport",
        "مواصلات عامة",
        "muwasalat amma"
      ],
      [
        "trip / flight",
        "رحلة",
        "rihla"
      ],
      [
        "travel",
        "سفر",
        "safar"
      ],
      [
        "watching",
        "مشاهدة",
        "mushahada"
      ],
      [
        "visiting / visit",
        "زيارة",
        "ziyara"
      ],
      [
        "free time",
        "وقت فراغ",
        "waqt faragh"
      ],
      [
        "now",
        "الآن",
        "al-an"
      ],
      [
        "there",
        "هناك",
        "hunaka"
      ],
      [
        "transport",
        "مواصلات",
        "muwasalat"
      ],
      [
        "tourism",
        "سياحة",
        "as-siyaha"
      ],
      [
        "movies",
        "أفلام",
        "aflam"
      ],
      [
        "languages",
        "لغات",
        "lughat"
      ]
    ],
    "sentences": [
      [
        "my family loves traveling",
        "عيلتي بتحب السفر",
        "ailti bit-hibb as-safar"
      ],
      [
        "traveling abroad is fun",
        "السفر برّة ممتع",
        "as-safar barra mumti"
      ],
      [
        "public transport here is better",
        "المواصلات هنا أفضل",
        "al-muwasalat huna afdal"
      ],
      [
        "this city is very beautiful",
        "هذه المدينة جميلة كثير",
        "hadhihi al-madina jamila kathir"
      ],
      [
        "the car here is better",
        "السيارة هنا أفضل",
        "as-sayyara huna afdal"
      ],
      [
        "i like listening to music",
        "بحب سماع الموسيقى",
        "bahibb sima al-musiqa"
      ],
      [
        "i watch movies sometimes",
        "بشوف أفلام أحياناً",
        "bashuf aflam ahyanan"
      ],
      [
        "i study different languages",
        "بدرس لغات مختلفة",
        "badrus lughat mukhtalifa"
      ],
      [
        "we study different cultures",
        "بندرس ثقافات مختلفة",
        "bandrus thaqafat mukhtalifa"
      ],
      [
        "we love local tourism",
        "بنحب السياحة المحلية",
        "bin-hibb as-siyaha al-mahalliya"
      ],
      [
        "we rent a car there",
        "بنستأجر سيارة هناك",
        "bansta'jir sayyara hunaka"
      ],
      [
        "we visited european countries",
        "زرنا بلاد أوروبا",
        "zurna bilad urubba"
      ],
      [
        "i love this city",
        "بحب هذه المدينة",
        "bahibb hadhihi al-madina"
      ],
      [
        "we get to know nations",
        "بنتعرف على الشعوب",
        "banta'arraf ala ash-shu'ub"
      ],
      [
        "i am going to the city center",
        "بروح على البلد",
        "baruh ala al-balad"
      ]
    ]
  },
  "restaurant_1": {
    "index": 5,
    "name": "Restaurant 1",
    "words": [
      [
        "tasty / delicious",
        "زاكي",
        "zaki"
      ],
      [
        "salty",
        "مالح",
        "malih"
      ],
      [
        "sweet",
        "حلو",
        "hilu"
      ],
      [
        "sour",
        "حامض",
        "hamid"
      ],
      [
        "hot",
        "سخن",
        "sukhn"
      ],
      [
        "cold",
        "بارد",
        "barid"
      ],
      [
        "appetizer / meze",
        "مقبلات",
        "muqabbilat"
      ],
      [
        "main course",
        "وجبة رئيسية",
        "wajba ra'isiya"
      ],
      [
        "side dish",
        "مقبلات جانبية",
        "muqabbilat janibiya"
      ],
      [
        "dessert",
        "حلو",
        "al-hilu"
      ],
      [
        "the bill / check",
        "الحساب",
        "al-hisab"
      ],
      [
        "meat",
        "لحم",
        "lahm"
      ],
      [
        "rice",
        "أرز",
        "aruzz"
      ],
      [
        "i want",
        "بدي",
        "biddi"
      ],
      [
        "cup",
        "فنجان",
        "finjan"
      ],
      [
        "almonds",
        "لوز",
        "lawz"
      ],
      [
        "almond milk",
        "حليب لوز",
        "halib lawz"
      ],
      [
        "no sugar",
        "بدون سكر",
        "bidun sukkar"
      ],
      [
        "substitute / alternative",
        "بديل",
        "badil"
      ],
      [
        "i like / love",
        "بحب",
        "bahibb"
      ]
    ],
    "sentences": [
      [
        "i want a main course",
        "بدي وجبة رئيسية",
        "biddi wajba ra'isiya"
      ],
      [
        "i like meat with rice",
        "بحب اللحم مع الأرز",
        "bahibb al-lahm ma' ar-ruzz"
      ],
      [
        "the appetizer is very salty",
        "المقبلات مالحة كثير",
        "al-muqabbilat maliha kathir"
      ],
      [
        "the dessert is too sweet",
        "الحلاوة حلوة كثير",
        "al-halawa hilwa kathir"
      ],
      [
        "the lemon is very sour",
        "الليمون حامض كثير",
        "al-laymun hamid kathir"
      ],
      [
        "the tea is hot now",
        "الشاي سخن الآن",
        "ash-shay sukhn al-an"
      ],
      [
        "the water here is cold",
        "المي هنا باردة",
        "al-may huna barida"
      ],
      [
        "the side dish is very tasty",
        "المقبلات الجانبية زاكية",
        "al-muqabbilat al-janibiya zakiya"
      ],
      [
        "bring the bill please",
        "جيب الحساب لو سمحت",
        "jib al-hisab law samaht"
      ],
      [
        "where is the dessert?",
        "وين الحلاوة",
        "wayn al-halawa"
      ],
      [
        "the meal is very tasty",
        "الوجبة زاكية كثير",
        "al-wajba zakiya kathir"
      ],
      [
        "i want cold juice",
        "بدي عصير بارد",
        "biddi asir barid"
      ],
      [
        "the rice is very salty",
        "الأرز مالح كثير",
        "ar-ruzz malih kathir"
      ],
      [
        "i want this dessert",
        "بدي هذه الحلاوة",
        "biddi hadhihi al-halawa"
      ],
      [
        "the restaurant is very tasty",
        "المطعم زاكي كثير",
        "al-mat'am zaki kathir"
      ],
      [
        "i want strong coffee",
        "بدي قهوة قوية",
        "biddi qahwa qawiya"
      ],
      [
        "i want almond milk",
        "بدي حليب لوز",
        "biddi halib lawz"
      ],
      [
        "coffee without sugar",
        "قهوة بدون سكر",
        "qahwa bidun sukkar"
      ],
      [
        "give me a cup",
        "أعطيني فنجان",
        "a'tini finjan"
      ],
      [
        "this coffee is strong",
        "هذه القهوة قوية",
        "hadhihi al-qahwa qawiya"
      ],
      [
        "i want a milk substitute",
        "بدي بديل حليب",
        "biddi badil halib"
      ],
      [
        "this cup is hot",
        "هذا الفنجان سخن",
        "hadha al-finjan sukhn"
      ]
    ]
  },
  "airport_1": {
    "index": 6,
    "name": "Airport 1",
    "words": [
      [
        "airport",
        "مطار",
        "matar"
      ],
      [
        "airplane",
        "طيارة",
        "at-tayyara"
      ],
      [
        "flight / trip",
        "رحلة",
        "rihla"
      ],
      [
        "ticket",
        "تذكرة",
        "at-tadhkara"
      ],
      [
        "passport",
        "جواز سفر",
        "jawaz safar"
      ],
      [
        "baggage / luggage",
        "عفش",
        "afsh"
      ],
      [
        "suitcase / bag",
        "شنطة",
        "shanta"
      ],
      [
        "hand luggage",
        "شنطة إيد",
        "shantat id"
      ],
      [
        "inspection / search",
        "تفتيش",
        "at-taftish"
      ],
      [
        "security",
        "أمن",
        "amn"
      ],
      [
        "layover / transit",
        "ترانزيت",
        "tranzit"
      ],
      [
        "seat",
        "مقعد",
        "maq'ad"
      ],
      [
        "free / empty",
        "فاضي",
        "fadi"
      ],
      [
        "occupied / reserved",
        "محجوز",
        "mahjuz"
      ],
      [
        "border",
        "حدود",
        "hudud"
      ],
      [
        "visit",
        "زيارة",
        "ziyara"
      ],
      [
        "tourism",
        "سياحة",
        "as-siyaha"
      ],
      [
        "hotel",
        "فندق",
        "funduq"
      ],
      [
        "purpose / goal",
        "هدف",
        "hadaf"
      ]
    ],
    "sentences": [
      [
        "where is my passport?",
        "وين جواز سفري",
        "wayn jawaz safari"
      ],
      [
        "the flight is delayed now",
        "الرحلة متأخرة الآن",
        "ar-rihla mut'akhira al-an"
      ],
      [
        "the airplane is very big",
        "الطيارة كبيرة كثير",
        "at-tayyara kabira kathir"
      ],
      [
        "i want a seat by the window",
        "بدي مقعد عند الشباك",
        "biddi maq'ad ind ash-shubbak"
      ],
      [
        "is this seat free?",
        "هذا المقعد فاضي",
        "hadha al-maq'ad fadi"
      ],
      [
        "no, this seat is occupied",
        "لأ هذا المقعد محجوز",
        "la hadha al-maq'ad mahjuz"
      ],
      [
        "where is the security check?",
        "وين تفتيش الأمن",
        "wayn taftish al-amn"
      ],
      [
        "the suitcase is very heavy",
        "الشنطة ثقيلة كثير",
        "ash-shanta thaqila kathir"
      ],
      [
        "this is my hand luggage",
        "هذه شنطة إيدي",
        "hadhihi shantat idi"
      ],
      [
        "i have a layover",
        "عندي ترانزيت",
        "indi tranzit"
      ],
      [
        "where is the boarding pass?",
        "وين تذكرة الصعود",
        "wayn tadhkarat as-su'ud"
      ],
      [
        "the luggage is there below",
        "العفش هناك تحت",
        "al-afsh hunaka taht"
      ],
      [
        "border control is here",
        "تفتيش الحدود هنا",
        "taftish al-hudud huna"
      ],
      [
        "i want to change the seat",
        "بدي أغير المقعد",
        "biddi aghayyar al-maq'ad"
      ],
      [
        "the purpose of the visit is tourism",
        "هدف الزيارة السياحة",
        "hadaf az-ziyara as-siyaha"
      ],
      [
        "the hotel is in the city center",
        "الفندق في وسط البلد",
        "al-funduq fi wast al-balad"
      ],
      [
        "the airport is very beautiful",
        "المطار جميل كثير",
        "al-matar jamil kathir"
      ]
    ]
  },
  "names_meaning_1": {
    "index": 7,
    "name": "Names meaning 1",
    "words": [
      [
        "happy (m)",
        "سعيد",
        "sa'id"
      ],
      [
        "beautiful (m)",
        "جميل",
        "jamil"
      ],
      [
        "kind / good (m)",
        "طيب",
        "tayyib"
      ],
      [
        "tall / high (m)",
        "عالي",
        "ali"
      ],
      [
        "calm / quiet (m)",
        "هادي",
        "hadi"
      ],
      [
        "generous (m)",
        "كريم",
        "karim"
      ],
      [
        "loyal / faithful (m)",
        "أمين",
        "amin"
      ],
      [
        "smart / understanding (m)",
        "فهيم",
        "fahim"
      ],
      [
        "man / guy",
        "زلمة",
        "az-zalama"
      ],
      [
        "employee (m)",
        "موظف",
        "am-muwazzaf"
      ],
      [
        "bright / shining (m)",
        "منير",
        "munir"
      ],
      [
        "strong / tough (m)",
        "شديد",
        "shadid"
      ],
      [
        "flower",
        "زهرة",
        "zahra"
      ],
      [
        "rose",
        "وردة",
        "warda"
      ],
      [
        "star",
        "نجمة",
        "an-najma"
      ],
      [
        "light / glow",
        "نور",
        "an-nur"
      ],
      [
        "sun",
        "شمس",
        "ash-shams"
      ],
      [
        "clear / pure (f)",
        "صافية",
        "safiya"
      ],
      [
        "moon",
        "قمر",
        "al-qamar"
      ],
      [
        "pearl",
        "لؤلؤة",
        "lu'lu'a"
      ],
      [
        "generous (f)",
        "كريمة",
        "karima"
      ],
      [
        "beautiful (f)",
        "جميلة",
        "jamila"
      ],
      [
        "happy (f)",
        "سعيدة",
        "sa'ida"
      ],
      [
        "kind / good (f)",
        "طيبة",
        "tayyiba"
      ]
    ],
    "sentences": [
      [
        "this man is very happy",
        "هذا الزلمة سعيد كثير",
        "hadha az-zalama sa'id kathir"
      ],
      [
        "your friend is very handsome",
        "صاحبك جميل كثير",
        "sahbak jamil kathir"
      ],
      [
        "my brother is very kind",
        "أخوي طيب كثير",
        "akhuy tayyib kathir"
      ],
      [
        "this boy is very tall",
        "هذا الولد عالي كثير",
        "hadha al-walad ali kathir"
      ],
      [
        "the sea today is very calm",
        "البحر اليوم هادي كثير",
        "al-bahr al-yawm hadi kathir"
      ],
      [
        "your father is very generous",
        "أبوك كريم كثير",
        "abuk karim kathir"
      ],
      [
        "this employee is very loyal",
        "هذا الموظف أمين كثير",
        "hadha am-muwazzaf amin kathir"
      ],
      [
        "my son is very smart",
        "ابني فهيم كثير",
        "ibni fahim kathir"
      ],
      [
        "this man is very kind",
        "هذا الزلمة طيب كثير",
        "hadha az-zalama tayyib kathir"
      ],
      [
        "your voice is very bright",
        "صوتك منير كثير",
        "sawtak munir kathir"
      ],
      [
        "this coffee is very strong",
        "هذه القهوة شديدة كثير",
        "hadhihi al-qahwa shadida kathir"
      ],
      [
        "our neighbor is very calm",
        "جارنا هادي كثير",
        "jarna hadi kathir"
      ],
      [
        "this flower is very beautiful",
        "هذه الزهرة جميلة كثير",
        "hadhihi az-zahra jamila kathir"
      ],
      [
        "the sun today is very hot",
        "الشمس اليوم سخنة كثير",
        "ash-shams al-yawm sukhna kathir"
      ],
      [
        "this star is very bright",
        "هذه النجمة منيرة كثير",
        "hadhihi an-najma munira kathir"
      ],
      [
        "your room is very bright",
        "غرفتك منيرة كثير",
        "ghurfatak munira kathir"
      ],
      [
        "this rose is very beautiful",
        "هذه الوردة جميلة كثير",
        "hadhihi al-warda jamila kathir"
      ],
      [
        "the sky today is very clear",
        "السماء اليوم صافية كثير",
        "as-sama' al-yawm safiya kathir"
      ],
      [
        "your sister is very happy",
        "أختك سعيدة كثير",
        "ukhtak sa'ida kathir"
      ],
      [
        "my mom is very kind",
        "أمي طيبة كثير",
        "ummi tayyiba kathir"
      ],
      [
        "the moon today is very beautiful",
        "القمر اليوم جميل كثير",
        "al-qamar al-yawm jamil kathir"
      ],
      [
        "this woman is very generous",
        "هذه المرة كريمة كثير",
        "hadhihi al-mara karima kathir"
      ]
    ]
  },
  "polite_language_1": {
    "index": 8,
    "name": "Polite language 1",
    "words": [
      [
        "thank god",
        "الحمد لله",
        "al-hamdu lillah"
      ],
      [
        "god forbid",
        "لا سمح الله",
        "la samah allah"
      ],
      [
        "to your health (cheers)",
        "صحتين",
        "sahtayn"
      ],
      [
        "bon appetit",
        "صحتين وعافية",
        "sahtayn wa afiya"
      ],
      [
        "be careful / watch out",
        "دير بالك",
        "dir balak"
      ],
      [
        "please / you are welcome",
        "عفواً",
        "afwan"
      ],
      [
        "be so kind / please",
        "لو سمحت",
        "law samaht"
      ],
      [
        "nice to meet you",
        "فرصة سعيدة",
        "fursa sa'ida"
      ],
      [
        "unfortunately i can't",
        "للأسف ما بقدر",
        "lil-asaf ma baqdar"
      ],
      [
        "i wish you luck",
        "بتمنى لك التوفيق",
        "bitmanna lak at-tawfiq"
      ],
      [
        "welcome",
        "أهلاً وسهلاً",
        "ahlan wa sahlan"
      ],
      [
        "make yourself at home",
        "البيت بيتك",
        "al-bayt baytak"
      ],
      [
        "have a safe trip",
        "تروح وترجع بالسلامة",
        "truh wa tirja' bis-salama"
      ],
      [
        "don't worry / no need to worry",
        "ما في داعي للقلق",
        "ma fi da'i lil-qalaq"
      ],
      [
        "please / go ahead / take it",
        "تفضل",
        "tafaddal"
      ],
      [
        "it's my pleasure",
        "على راسي",
        "ala rasi"
      ],
      [
        "it doesn't matter / never mind",
        "مش مشكلة",
        "mish mushkila"
      ],
      [
        "congratulations",
        "مبروك",
        "mabruk"
      ],
      [
        "thanks (reply to mabruk)",
        "الله يبارك فيك",
        "allah yibarik fik"
      ]
    ],
    "sentences": [
      [
        "everything is good, thank god",
        "كل شيء تمام الحمد لله",
        "kull shi tamam al-hamdu lillah"
      ],
      [
        "bon appetit to everyone",
        "صحتين وعافية للجميع",
        "sahtayn wa afiya lil-jami'"
      ],
      [
        "be careful on the road",
        "دير بالك على الطريق",
        "dir balak 'ala at-tariq"
      ],
      [
        "please, i want a menu",
        "لو سمحت بدي المنيو",
        "law samaht biddi al-minyu"
      ],
      [
        "nice to meet you, my friend",
        "فرصة سعيدة يا صاحبي",
        "fursa sa'ida ya sahbi"
      ],
      [
        "unfortunately i can't come today",
        "للأسف ما بقدر أجي اليوم",
        "lil-asaf ma baqdar aji al-yawm"
      ],
      [
        "i wish you luck in work",
        "بتمنى لك التوفيق في الشغل",
        "bitmanna lak at-tawfiq fish-shughl"
      ],
      [
        "no, god forbid",
        "لأ لا سمح الله",
        "la la samah allah"
      ],
      [
        "welcome to our house",
        "أهلاً وسهلاً في بيتنا",
        "ahlan wa sahlan fi baytna"
      ],
      [
        "make yourself at home, my friend",
        "البيت بيتك يا صاحبي",
        "al-bayt baytak ya sahbi"
      ],
      [
        "have a safe trip to russia",
        "تروح وترجع بالسلامة لروسيا",
        "truh wa tirja' bis-salama li-rusiya"
      ],
      [
        "don't worry about the money",
        "ما في داعي للقلق عن المصاري",
        "ma fi da'i lil-qalaq 'an al-masari"
      ],
      [
        "please, sit here",
        "تفضل اقعد هنا",
        "tafaddal uq'ud huna"
      ],
      [
        "it's not a problem, never mind",
        "مش مشكلة بسيطة",
        "mish mushkila basita"
      ],
      [
        "congratulations on the new job",
        "مبروك على الشغل الجديد",
        "mabruk 'ala ash-shughl al-jadid"
      ],
      [
        "it's my pleasure, no need to thank",
        "على راسي ولا يهمك",
        "ala rasi wala yihimmak"
      ]
    ]
  }
};
