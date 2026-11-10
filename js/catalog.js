// Produktkatalog: Kategorien und Artikel auf Deutsch, Arabisch und Englisch – nur halal (kein Alkohol, kein Schwein, kein Tabak).
// Zeilenformat:  Emoji|Deutsch|Arabisch|Englisch|weitere Suchwörter (optional, mit Komma)
// Die ID eines Artikels kommt aus dem deutschen Namen – den deutschen Namen bestehender Artikel daher nicht ändern.

/** Vereinheitlicht Text für Suche und Vergleich (Deutsch, Englisch, Arabisch). */
export const norm = s => String(s ?? '').toLowerCase()
  .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ء-ي]+/g, ' ').trim();

export const CATS = [
  ['obst', '🍎', 'Obst', 'فواكه', 'Fruit'],
  ['gemuese', '🥬', 'Gemüse', 'خضار', 'Vegetables'],
  ['kraeuter', '🌿', 'Kräuter', 'أعشاب', 'Herbs'],
  ['milch', '🥛', 'Milch & Eier', 'ألبان وبيض', 'Dairy & eggs'],
  ['fleisch', '🥩', 'Fleisch & Fisch', 'لحوم وأسماك', 'Meat & fish'],
  ['brot', '🍞', 'Brot & Backwaren', 'خبز ومخبوزات', 'Bread & bakery'],
  ['vorrat', '🍝', 'Nudeln, Reis & Hülsenfrüchte', 'معكرونة وأرز وبقوليات', 'Pasta, rice & pulses'],
  ['konserven', '🥫', 'Konserven & Saucen', 'معلبات وصلصات', 'Cans & sauces'],
  ['gewuerze', '🧂', 'Gewürze & Öle', 'بهارات وزيوت', 'Spices & oils'],
  ['backen', '🧁', 'Backen', 'لوازم الحلويات', 'Baking'],
  ['fruehstueck', '🍯', 'Frühstück, Kaffee & Tee', 'فطور وقهوة وشاي', 'Breakfast, coffee & tea'],
  ['snacks', '🍫', 'Süßes & Snacks', 'حلويات ومكسرات', 'Sweets & snacks'],
  ['getraenke', '🥤', 'Getränke', 'مشروبات', 'Drinks'],
  ['tk', '❄️', 'Tiefkühl', 'مجمدات', 'Frozen'],
  ['orient', '🧆', 'Orientalisch', 'منتجات عربية', 'Middle Eastern'],
  ['drogerie', '🧴', 'Drogerie & Pflege', 'عناية شخصية', 'Personal care'],
  ['haushalt', '🧽', 'Haushalt & Reinigung', 'تنظيف ومنزل', 'Household & cleaning'],
  ['baby', '👶', 'Baby', 'أطفال', 'Baby'],
  ['sonst', '🛒', 'Sonstiges', 'أخرى', 'Other']
].map(([id, emoji, de, ar, en]) => ({ id, emoji, de, ar, en }));
export const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
export const CAT_ORDER = Object.fromEntries(CATS.map((c, i) => [c.id, i]));

const RAW = {
  obst: `🍎|Äpfel|تفاح|Apples|apfel
🍐|Birnen|إجاص|Pears|birne,كمثرى
🍌|Bananen|موز|Bananas|banane
🍊|Orangen|برتقال|Oranges|orange,apfelsine
🍊|Mandarinen|يوسفي|Mandarins|mandarine,clementinen,كلمنتينا
🍋|Zitronen|ليمون|Lemons|zitrone,ليمون حامض
🍋|Limetten|ليمون أخضر|Limes|limette
🍇|Weintrauben|عنب|Grapes|trauben
🍓|Erdbeeren|فراولة|Strawberries|erdbeere,فريز
🫐|Heidelbeeren|توت أزرق|Blueberries|blaubeeren
🍓|Himbeeren|توت العليق|Raspberries|himbeere
🫐|Brombeeren|توت أسود|Blackberries
🍒|Kirschen|كرز|Cherries|kirsche
🍑|Pfirsiche|خوخ|Peaches|pfirsich,دراق
🍑|Nektarinen|نكتارين|Nectarines|nektarine
🍑|Aprikosen|مشمش|Apricots|aprikose
🟣|Pflaumen|برقوق|Plums|pflaume,zwetschgen,خوخ أحمر
🍉|Wassermelone|بطيخ|Watermelon|melone,جبس
🍈|Honigmelone|شمام|Honeydew melon|melon
🍍|Ananas|أناناس|Pineapple
🥭|Mango|مانجو|Mango
🥝|Kiwi|كيوي|Kiwi
🥑|Avocado|أفوكادو|Avocado
🍎|Granatapfel|رمان|Pomegranate
🍈|Feigen|تين|Figs|feige
🥥|Kokosnuss|جوز الهند|Coconut
🍊|Grapefruit|جريب فروت|Grapefruit|pampelmuse,ليمون هندي
🟠|Kaki|كاكا|Persimmon|sharon
🍏|Quitten|سفرجل|Quince|quitte
🟡|Physalis|حرنكش|Physalis
🍈|Papaya|بابايا|Papaya
🐉|Drachenfrucht|فاكهة التنين|Dragon fruit|pitaya
🟣|Passionsfrucht|فاكهة العاطفة|Passion fruit|maracuja
🍇|Rote Johannisbeeren|كشمش أحمر|Redcurrants
🟢|Stachelbeeren|عنب الثعلب|Gooseberries
🌵|Kaktusfeigen|صبر|Prickly pears
🍑|Mispeln|أكي دنيا|Loquats|بشملة
🍊|Blutorangen|برتقال دموي|Blood oranges
🍏|Grüne Äpfel|تفاح أخضر|Green apples|granny smith`,
  gemuese: `🍅|Tomaten|طماطم|Tomatoes|tomate,بندورة
🍅|Cherrytomaten|طماطم كرزية|Cherry tomatoes|cocktailtomaten
🍅|Rispentomaten|طماطم عنقودية|Vine tomatoes
🥒|Gurken|خيار|Cucumbers|gurke,salatgurke
🥒|Minigurken|خيار صغير|Mini cucumbers|snackgurken,خيار بلدي
🫑|Paprika|فلفل حلو|Bell peppers|paprikaschote,فليفلة
🫑|Spitzpaprika|فلفل حلو طويل|Pointed peppers
🌶️|Chili|فلفل حار|Chillies|chilischote
🌶️|Peperoni|فلفل أخضر حار|Green chillies|grüne peperoni
🥕|Möhren|جزر|Carrots|karotten,karotte,möhre
🥔|Kartoffeln|بطاطا|Potatoes|kartoffel,بطاطس
🥔|Festkochende Kartoffeln|بطاطا للسلق|Waxy potatoes
🍠|Süßkartoffeln|بطاطا حلوة|Sweet potatoes|süßkartoffel
🧅|Zwiebeln|بصل|Onions|zwiebel
🧅|Rote Zwiebeln|بصل أحمر|Red onions
🧅|Frühlingszwiebeln|بصل أخضر|Spring onions|lauchzwiebeln
🧅|Schalotten|بصل صغير|Shallots
🧄|Knoblauch|ثوم|Garlic|knoblauchzehe,knoblauchzehen
🫚|Ingwer|زنجبيل|Ginger
🥬|Kopfsalat|خس|Lettuce|salat,blattsalat
🥬|Römersalat|خس روماني|Romaine lettuce|romana
🥬|Eisbergsalat|خس آيسبرغ|Iceberg lettuce
🥬|Feldsalat|خس الحقل|Lamb's lettuce
🥬|Rucola|جرجير|Rocket|arugula
🥬|Spinat|سبانخ|Spinach|blattspinat
🥬|Weißkohl|ملفوف|White cabbage|kohl,krautkopf
🥬|Rotkohl|ملفوف أحمر|Red cabbage
🥬|Spitzkohl|ملفوف مدبب|Pointed cabbage
🥬|Wirsing|ملفوف مجعد|Savoy cabbage
🥬|Chinakohl|ملفوف صيني|Chinese cabbage
🥦|Brokkoli|بروكلي|Broccoli
🥦|Blumenkohl|قرنبيط|Cauliflower|زهرة
🥬|Rosenkohl|كرنب بروكسل|Brussels sprouts
🍆|Auberginen|باذنجان|Aubergines|aubergine,eggplant
🍆|Kleine Auberginen|باذنجان صغير للمحشي|Baby aubergines|باذنجان مكدوس
🥒|Zucchini|كوسا|Courgettes
🥒|Helle Zucchini|كوسا بلدي للمحشي|Pale courgettes|kusa
🎃|Kürbis|يقطين|Pumpkin|قرع,hokkaido
🎃|Butternut-Kürbis|قرع العسل|Butternut squash
🍄|Champignons|فطر|Mushrooms|pilze
🍄|Braune Champignons|فطر بني|Brown mushrooms
🍄|Austernpilze|فطر محاري|Oyster mushrooms
🌽|Maiskolben|ذرة|Corn on the cob
🫛|Erbsen|بازلاء|Peas
🫘|Grüne Bohnen|فاصولياء خضراء|Green beans|لوبيا
🫛|Zuckerschoten|بازلاء سكرية|Sugar snap peas
🥬|Lauch|كراث|Leek|porree
🥬|Staudensellerie|كرفس|Celery|sellerie
🥔|Knollensellerie|كرفس جذري|Celeriac
🥕|Pastinaken|جزر أبيض|Parsnips
🥬|Rote Bete|شمندر|Beetroot
🥬|Radieschen|فجل|Radishes
⚪|Rettich|فجل أبيض|White radish
🥬|Kohlrabi|كولرابي|Kohlrabi
⚪|Weiße Rüben|لفت|Turnips|steckrübe
🥬|Fenchel|شمر|Fennel
🥬|Spargel|هليون|Asparagus
🥬|Okra|بامية|Okra
🥬|Mangold|سلق|Chard
🥬|Grünkohl|كرنب أجعد|Kale
🫛|Edamame|إدامامي|Edamame
🫘|Frische Saubohnen|فول أخضر|Fresh broad beans
🫛|Frische Kichererbsen|حمص أخضر|Fresh chickpeas|ملانة
🥗|Salatmischung|خلطة سلطة|Mixed salad
🌱|Sprossen|براعم|Sprouts
🫒|Artischocken|أرضي شوكي|Artichokes|خرشوف`,
  kraeuter: `🌿|Petersilie|بقدونس|Parsley
🌿|Glatte Petersilie|بقدونس عريض|Flat-leaf parsley
🌿|Koriander|كزبرة|Coriander|كزبرة خضراء,cilantro
🌿|Minze|نعناع|Mint
🌿|Dill|شبت|Dill
🌿|Basilikum|ريحان|Basil
🌿|Schnittlauch|ثوم معمر|Chives
🌿|Thymian|زعتر أخضر|Thyme
🌿|Rosmarin|إكليل الجبل|Rosemary
🌿|Salbei|ميرمية|Sage
🌿|Oregano frisch|أوريغانو طازج|Fresh oregano
🌿|Zitronengras|عشبة الليمون|Lemongrass
🌿|Kresse|رشاد|Cress
🌿|Portulak|بقلة|Purslane|فرفحينة
🌿|Wilder Zaatar|زعتر بري أخضر|Fresh za'atar`,
  milch: `🥛|Milch|حليب|Milk|vollmilch
🥛|Fettarme Milch|حليب قليل الدسم|Semi-skimmed milk
🥛|H-Milch|حليب طويل الأجل|UHT milk|haltbare milch
🥛|Laktosefreie Milch|حليب خالٍ من اللاكتوز|Lactose-free milk
🥛|Haferdrink|حليب الشوفان|Oat milk|hafermilch
🥛|Sojadrink|حليب الصويا|Soy milk|sojamilch
🥛|Mandeldrink|حليب اللوز|Almond milk
🥛|Buttermilch|لبن مخيض|Buttermilk
🧈|Butter|زبدة|Butter
🧈|Margarine|مارغرين|Margarine
🥚|Eier|بيض|Eggs|ei
🥛|Joghurt|لبن زبادي|Yoghurt|naturjoghurt,لبن,زبادي
🥛|Griechischer Joghurt|زبادي يوناني|Greek yoghurt
🥛|Fruchtjoghurt|زبادي بالفواكه|Fruit yoghurt
🥛|Skyr|سكير|Skyr
🥛|Ayran|عيران|Ayran
🥛|Kefir|كفير|Kefir
🥛|Sahne|كريمة|Cream|schlagsahne,kochsahne,قشطة
🥛|Schmand|كريمة حامضة|Sour cream|saure sahne,creme fraiche
🥛|Quark|جبن قريش|Quark|magerquark
🥛|Hüttenkäse|جبن قريش حبيبي|Cottage cheese
🥛|Frischkäse|جبنة كريمية|Cream cheese
🧀|Käse|جبنة|Cheese|scheibenkäse
🧀|Gouda|جبنة جودا|Gouda
🧀|Emmentaler|جبنة إمنتال|Emmental
🧀|Cheddar|جبنة شيدر|Cheddar
🧀|Mozzarella|موزاريلا|Mozzarella
🧀|Feta|جبنة فيتا|Feta
🧀|Hirtenkäse|جبنة بيضاء|White cheese|weißkäse
🧀|Parmesan|بارميزان|Parmesan
🧀|Reibekäse|جبنة مبشورة|Grated cheese|streukäse
🧀|Schmelzkäse|جبنة مثلثات|Cheese triangles|la vache qui rit,البقرة الضاحكة
🧀|Scheibletten|جبنة شرائح للتوست|Cheese slices|toastkäse
🧀|Ricotta|جبنة ريكوتا|Ricotta
🧀|Mascarpone|ماسكاربوني|Mascarpone
🧀|Kaschkaval-Käse|جبنة قشقوان|Kashkaval cheese|قشقوان
🥛|Kondensmilch|حليب مكثف|Condensed milk|حليب محلى
🥛|Kaffeesahne|كريمة القهوة|Coffee creamer
🍮|Pudding|بودينغ|Pudding
🍮|Milchreis (fertig)|رز بحليب جاهز|Rice pudding
🥛|Milchpulver|حليب بودرة|Milk powder|nido,نيدو`,
  fleisch: `🍗|Hähnchen|دجاج|Chicken|huhn,hühnchen,فروج
🍗|Hähnchenbrust|صدر دجاج|Chicken breast|hähnchenbrustfilet
🍗|Hähnchenschenkel|أفخاذ دجاج|Chicken thighs|hähnchenkeulen
🍗|Hähnchenflügel|أجنحة دجاج|Chicken wings
🍗|Hähnchengeschnetzeltes|دجاج مقطع شرائح|Sliced chicken|شاورما دجاج
🍗|Hähnchenleber|كبدة دجاج|Chicken liver
🍗|Hähnchenherzen|قلوب دجاج|Chicken hearts
🥩|Hackfleisch|لحم مفروم|Minced meat|hack
🥩|Rinderhack|لحم بقر مفروم|Minced beef
🥩|Lammhack|لحم غنم مفروم|Minced lamb
🥩|Rindfleisch|لحم بقر|Beef
🥩|Kalbfleisch|لحم عجل|Veal
🥩|Lammfleisch|لحم خروف|Lamb|lamm,لحم غنم
🥩|Lammkeule|فخذ خروف|Leg of lamb
🥩|Lammschulter|كتف خروف|Lamb shoulder
🥩|Lammkoteletts|ريش غنم|Lamb chops
🥩|Ziegenfleisch|لحم ماعز|Goat meat
🥩|Steak|ستيك|Steak
🥩|Gulasch|لحم مقطع|Diced meat
🥩|Rinderleber|كبدة بقر|Beef liver
🌭|Würstchen (halal)|نقانق حلال|Halal sausages|wurst,würstchen
🥓|Aufschnitt|مرتديلا|Cold cuts|geflügelwurst,mortadella
🥓|Geflügelsalami|سلامي دجاج|Chicken salami
🥩|Pastirma|بسطرما|Pastirma|rinderschinken
🥩|Sucuk|سجق|Sucuk
🦃|Pute|ديك رومي|Turkey|putenbrust,حبش
🍔|Burger-Patties|أقراص برغر|Burger patties
🥙|Döner-Fleisch|لحم شاورما|Shawarma meat|shawarma
🥩|Kebab-Spieße|أسياخ كباب|Kebab skewers|kofta,كفتة
🐟|Fisch|سمك|Fish|fischfilet
🐟|Lachs|سلمون|Salmon
🐟|Kabeljau|سمك القد|Cod
🐟|Seelachs|بلوق|Pollock
🐟|Dorade|سمك دنيس|Sea bream
🐟|Wolfsbarsch|سمك قاروص|Sea bass|levrek,لوقس
🐟|Forelle|سمك سلمون مرقط|Trout
🐟|Sardinen|سردين|Sardines
🦐|Garnelen|روبيان|Prawns|shrimps,قريدس,جمبري
🦑|Tintenfisch|حبار|Squid|calamari,كاليماري`,
  brot: `🍞|Brot|خبز|Bread
🍞|Toastbrot|خبز توست|Toast bread|toast
🍞|Vollkornbrot|خبز أسمر|Wholemeal bread
🍞|Sandwichbrot|خبز سندويش|Sandwich bread
🥖|Baguette|خبز فرنسي|Baguette
🥯|Brötchen|خبز صغير|Bread rolls|semmeln
🥯|Burgerbrötchen|خبز برغر|Burger buns
🌭|Hot-Dog-Brötchen|خبز هوت دوغ|Hot dog buns
🫓|Arabisches Brot|خبز عربي|Arabic bread|khubz,pita,arabisch brot,syrisches brot,libanesisches brot,خبز شامي
🫓|Fladenbrot|خبز تركي|Turkish flatbread|pide,türkisches brot,خبز بيدا
🫓|Saj-Brot (Markouk)|خبز صاج|Saj bread|markouk,saj,مرقوق,شراك
🫓|Tannour-Brot|خبز تنور|Tannour bread|tannur,tannour
🥖|Samoon|صمون|Samoon|irakisches brötchen
🫓|Lavash|خبز لواش|Lavash
🫓|Wraps|خبز تورتيلا|Wraps|tortilla
🫓|Naan|خبز نان|Naan
🥐|Croissants|كرواسون|Croissants
🥨|Brezeln|بريتزل|Pretzels
🍰|Kuchen|كيك|Cake
🍞|Zwieback|قرشلة|Rusks
🍞|Knäckebrot|خبز مقرمش|Crispbread
🍞|Brotchips|خبز محمص|Bread crisps`,
  vorrat: `🍝|Spaghetti|سباغيتي|Spaghetti
🍝|Nudeln|معكرونة|Pasta|pasta,fusilli
🍝|Penne|معكرونة قلم|Penne
🍝|Fusilli|معكرونة لولبية|Fusilli
🍝|Farfalle|معكرونة فراشة|Farfalle
🍝|Makkaroni|معكرونة أنابيب|Macaroni
🍝|Tagliatelle|تالياتيلي|Tagliatelle
🍝|Lasagneplatten|رقائق لازانيا|Lasagne sheets
🍝|Tortellini|تورتيليني|Tortellini
🍜|Suppennudeln|شعيرية|Vermicelli|fadennudeln
🍜|Reisnudeln|معكرونة الأرز|Rice noodles
🍜|Instantnudeln|نودلز سريعة|Instant noodles|indomie,اندومي
🍚|Reis|أرز|Rice|رز
🍚|Basmatireis|أرز بسمتي|Basmati rice
🍚|Jasminreis|أرز ياسمين|Jasmine rice
🍚|Rundkornreis|أرز مصري|Short-grain rice|milchreis
🍚|Langkornreis|أرز طويل الحبة|Long-grain rice
🍚|Risottoreis|أرز ريزوتو|Risotto rice
🌾|Bulgur|برغل|Bulgur
🌾|Couscous|كسكس|Couscous
🌾|Quinoa|كينوا|Quinoa
🌾|Graupen|شعير مقشور|Pearl barley
🫘|Rote Linsen|عدس أحمر|Red lentils
🫘|Linsen|عدس|Lentils|braune linsen
🫘|Grüne Linsen|عدس أخضر|Green lentils|عدس بحبه
🫘|Kichererbsen|حمص حب|Chickpeas
🫘|Weiße Bohnen|فاصولياء بيضاء|White beans
🫘|Kidneybohnen|فاصولياء حمراء|Kidney beans
🫘|Schwarze Bohnen|فاصولياء سوداء|Black beans
🫘|Dicke Bohnen|فول|Fava beans
🫘|Mungbohnen|ماش|Mung beans
🫘|Schälerbsen|بازلاء مجففة|Split peas
🥔|Kartoffelpüree|بطاطا مهروسة|Mashed potato mix
🌾|Grieß|سميد|Semolina
🌾|Polenta|بولينتا|Polenta`,
  konserven: `🥫|Passierte Tomaten|طماطم معصورة|Passata|passata
🥫|Gehackte Tomaten|طماطم مقطعة معلبة|Chopped tomatoes|tomaten (dose),dosentomaten
🥫|Tomatenmark|معجون طماطم|Tomato paste|رب البندورة
🥫|Tomatensauce|صلصة طماطم|Tomato sauce
🥫|Nudelsauce|صلصة معكرونة|Pasta sauce
🌽|Mais (Dose)|ذرة معلبة|Sweetcorn (tin)|mais
🫛|Erbsen und Möhren (Dose)|بازلاء وجزر معلبة|Peas and carrots (tin)
🫘|Kidneybohnen (Dose)|فاصولياء حمراء معلبة|Kidney beans (tin)
🫘|Weiße Bohnen (Dose)|فاصولياء بيضاء معلبة|White beans (tin)|baked beans
🍄|Champignons (Dose)|فطر معلب|Mushrooms (tin)
🐟|Thunfisch|تونة|Tuna|thunfisch (dose)
🐟|Sardinen (Dose)|سردين معلب|Sardines (tin)
🫒|Oliven|زيتون|Olives
🥒|Gewürzgurken|مخلل خيار|Gherkins|essiggurken
🫑|Eingelegte Paprika|فلفل مخلل|Pickled peppers
🥫|Ketchup|كاتشب|Ketchup
🥫|Mayonnaise|مايونيز|Mayonnaise
🥫|Senf|خردل|Mustard
🥫|Sojasauce|صلصة الصويا|Soy sauce
🌶️|Scharfe Sauce|صلصة حارة|Hot sauce|chilisauce,شطة,sriracha
🥫|Süß-saure Sauce|صلصة حلوة حامضة|Sweet and sour sauce
🥫|Grillsauce|صلصة باربكيو|BBQ sauce|bbq
🧄|Knoblauchsauce|صلصة ثوم|Garlic sauce|toum,ثومية
🥫|Pesto|بيستو|Pesto
🥫|Gemüsebrühe|مرق خضار|Vegetable stock
🥫|Hühnerbrühe|مرق دجاج|Chicken stock|ماجي
🥫|Rinderbrühe (halal)|مرق لحم|Beef stock
🥥|Kokosmilch|حليب جوز الهند|Coconut milk
🥫|Kichererbsen (Dose)|حمص معلب|Chickpeas (tin)
🍑|Pfirsiche (Dose)|خوخ معلب|Peaches (tin)
🍍|Ananas (Dose)|أناناس معلب|Pineapple (tin)
🍲|Fertigsuppe|شوربة جاهزة|Instant soup|tütensuppe`,
  gewuerze: `🧂|Salz|ملح|Salt
🧂|Meersalz|ملح بحري|Sea salt
🧂|Pfeffer|فلفل أسود|Black pepper
🧂|Weißer Pfeffer|فلفل أبيض|White pepper
🫒|Olivenöl|زيت زيتون|Olive oil
🌻|Sonnenblumenöl|زيت دوار الشمس|Sunflower oil|öl,speiseöl,زيت نباتي
🌻|Rapsöl|زيت الكانولا|Rapeseed oil
🫒|Frittieröl|زيت قلي|Frying oil
🥥|Kokosöl|زيت جوز الهند|Coconut oil
🌰|Sesamöl|زيت سمسم|Sesame oil
🧴|Essig|خل|Vinegar
🍎|Apfelessig|خل تفاح|Apple cider vinegar
🧴|Balsamico-Essig|خل البلسميكو|Balsamic vinegar
🍋|Zitronensaft|عصير ليمون|Lemon juice
🌶️|Paprikapulver|بابريكا|Paprika
🌶️|Geräuchertes Paprikapulver|بابريكا مدخنة|Smoked paprika
🧂|Kreuzkümmel|كمون|Cumin
🧂|Kurkuma|كركم|Turmeric
🧂|Zimt|قرفة|Cinnamon
🪵|Zimtstangen|عيدان قرفة|Cinnamon sticks
🧂|Ingwerpulver|زنجبيل مطحون|Ground ginger
🧂|Curry|كاري|Curry powder
🧂|Garam Masala|غرام ماسالا|Garam masala
🧂|Oregano|أوريغانو|Oregano
🧂|Basilikum getrocknet|ريحان مجفف|Dried basil
🧂|Petersilie getrocknet|بقدونس مجفف|Dried parsley
🧂|Koriander gemahlen|كزبرة مطحونة|Ground coriander
🧂|Koriandersamen|بذور كزبرة|Coriander seeds
🧂|Kardamom|هيل|Cardamom
🧂|Nelken|قرنفل|Cloves
🧂|Lorbeerblätter|ورق غار|Bay leaves
🧂|Muskat|جوزة الطيب|Nutmeg
🧂|Anis|يانسون|Aniseed
🧂|Sternanis|يانسون نجمي|Star anise
🧂|Fenchelsamen|حبة حلوة|Fennel seeds
🧂|Piment|بهار حلو|Allspice
🧂|Sieben Gewürze|سبع بهارات|Seven spices|7 gewürze,بهارات مشكلة
🧂|Sumach|سماق|Sumac
🌿|Zaatar|زعتر|Za'atar
🧂|Chiliflocken|فلفل حار مجروش|Chilli flakes
🧂|Cayennepfeffer|فلفل كايين|Cayenne pepper
🧂|Knoblauchpulver|ثوم بودرة|Garlic powder
🧂|Zwiebelpulver|بصل بودرة|Onion powder
🧂|Getrocknete Minze|نعناع يابس|Dried mint
🧂|Safran|زعفران|Saffron
🧂|Schwarzkümmel|حبة البركة|Nigella seeds|حبة سوداء
🧂|Sesam|سمسم|Sesame seeds
🧂|Brühwürfel (halal)|مكعبات مرق|Stock cubes|maggi würfel
🧂|Hähnchengewürz|بهارات دجاج|Chicken seasoning
🧂|Fischgewürz|بهارات سمك|Fish seasoning
🧂|Falafel-Gewürz|بهارات فلافل|Falafel spice
🧂|Kibbeh-Gewürz|بهارات كبة|Kibbeh spice
🧂|Baharat|بهارات|Baharat`,
  backen: `🌾|Mehl|طحين|Flour|weizenmehl
🌾|Vollkornmehl|طحين أسمر|Wholemeal flour
🍚|Zucker|سكر|Sugar
🍚|Puderzucker|سكر ناعم|Icing sugar
🍚|Brauner Zucker|سكر بني|Brown sugar
🧁|Backpulver|بيكنج باودر|Baking powder
🧁|Natron|بيكربونات الصودا|Baking soda
🧁|Vanillezucker|سكر فانيلا|Vanilla sugar|فانيلا
🧁|Vanilleextrakt|خلاصة الفانيلا|Vanilla extract
🧁|Hefe|خميرة|Yeast|trockenhefe
🧁|Speisestärke|نشا|Cornflour
🧁|Halal-Gelatine|جيلاتين حلال|Halal gelatine|gelatine,agar
🍫|Kakao|كاكاو|Cocoa powder|backkakao
🍫|Kuvertüre|شوكولاتة للطبخ|Cooking chocolate
🍫|Schokotropfen|قطع شوكولاتة|Chocolate chips
🥥|Kokosraspeln|جوز هند مبشور|Desiccated coconut
🌰|Gemahlene Mandeln|لوز مطحون|Ground almonds
🍞|Paniermehl|بقسماط|Breadcrumbs|semmelbrösel
🍯|Zuckersirup|قطر|Sugar syrup|attar
🎂|Tortenguss|جيلي للكيك|Cake glaze
🎂|Streusel|حبيبات تزيين|Sprinkles
🧁|Muffinförmchen|قوالب ورق للكب كيك|Cupcake cases
🧁|Backmischung|خليط كيك جاهز|Cake mix
🧁|Sahnesteif|مثبت كريمة|Cream stabiliser`,
  fruehstueck: `🍯|Honig|عسل|Honey
🍓|Marmelade|مربى|Jam|konfitüre
🍊|Orangenmarmelade|مربى برتقال|Marmalade
🍫|Schokocreme|شوكولاتة للدهن|Chocolate spread|nutella,نوتيلا
🥜|Erdnussbutter|زبدة الفول السوداني|Peanut butter
🥣|Müsli|موسلي|Muesli
🥣|Granola|غرانولا|Granola|knuspermüsli
🥣|Cornflakes|كورن فليكس|Cornflakes
🥣|Kinder-Cerealien|حبوب إفطار للأطفال|Kids' cereal|chocapic,frosties
🥣|Haferflocken|شوفان|Oats
☕|Kaffee|قهوة|Coffee|filterkaffee
☕|Kaffeebohnen|حبوب القهوة|Coffee beans
☕|Kaffeekapseln|كبسولات قهوة|Coffee capsules|nespresso,dolce gusto
☕|Instantkaffee|نسكافيه|Instant coffee|nescafe
☕|Cappuccino-Pulver|كابتشينو|Cappuccino powder
🍵|Schwarzer Tee|شاي أسود|Black tea|tee,شاي
🍵|Grüner Tee|شاي أخضر|Green tea
🍵|Kräutertee|شاي أعشاب|Herbal tea|pfefferminztee
🍵|Kamillentee|بابونج|Chamomile tea
🍵|Salbeitee|شاي ميرمية|Sage tea
🍫|Kakaogetränk|شوكولاتة ساخنة|Hot chocolate|kaba
🥞|Pfannkuchen-Mix|خليط بان كيك|Pancake mix
🍁|Ahornsirup|شراب القيقب|Maple syrup`,
  snacks: `🍫|Schokolade|شوكولاتة|Chocolate
🍫|Schokoriegel|لوح شوكولاتة|Chocolate bar|snickers,mars,twix
🍪|Kekse|بسكويت|Biscuits|cookies
🍪|Butterkekse|بسكويت الشاي|Butter biscuits
🍪|Waffeln|ويفر|Wafers
🥐|Croissant-Snacks|كرواسون معبأ|Packaged croissants|7days
🍬|Fruchtgummi (halal)|حلوى مطاطية حلال|Halal gummies|gummibärchen,fruchtgummi
🍬|Bonbons|سكاكر|Sweets
🥔|Chips|شيبس|Crisps
🌽|Tortilla-Chips|رقائق التورتيلا|Tortilla chips|nachos
🍿|Popcorn|فشار|Popcorn|بوشار
🥜|Nüsse|مكسرات|Nuts|nussmischung
🥜|Erdnüsse|فول سوداني|Peanuts
🌰|Walnüsse|جوز|Walnuts
🌰|Mandeln|لوز|Almonds
🌰|Pistazien|فستق حلبي|Pistachios
🌰|Cashews|كاجو|Cashews
🌰|Haselnüsse|بندق|Hazelnuts
🌰|Pinienkerne|صنوبر|Pine nuts
🌰|Maronen|كستناء|Chestnuts
🍇|Rosinen|زبيب|Raisins
🍑|Getrocknete Aprikosen|مشمش مجفف|Dried apricots
🍈|Getrocknete Feigen|تين مجفف|Dried figs
🌻|Sonnenblumenkerne|بزر دوار الشمس|Sunflower seeds|بزر
🎃|Kürbiskerne|بزر يقطين|Pumpkin seeds
🍉|Melonenkerne|بزر بطيخ|Melon seeds
🥨|Salzstangen|أصابع مملحة|Pretzel sticks
🍘|Reiswaffeln|كعك الأرز|Rice cakes
🍫|Müsliriegel|ألواح حبوب|Cereal bars
🍬|Kaugummi|علكة|Chewing gum`,
  getraenke: `💧|Wasser|ماء|Water|mineralwasser,stilles wasser
💧|Sprudelwasser|ماء فوار|Sparkling water
🧃|Saft|عصير|Juice
🧃|Orangensaft|عصير برتقال|Orange juice
🧃|Apfelsaft|عصير تفاح|Apple juice
🧃|Multivitaminsaft|عصير متعدد الفيتامينات|Multivitamin juice|ace
🧃|Mangosaft|عصير مانجو|Mango juice
🧃|Granatapfelsaft|عصير رمان|Pomegranate juice
🧃|Apfelschorle|عصير تفاح فوار|Apple spritzer
🥤|Cola|كولا|Cola
🥤|Limonade|مشروب غازي|Soft drink|fanta,sprite
🥤|Eistee|شاي مثلج|Iced tea
🥤|Malzgetränk|شراب الشعير|Malt drink|barbican
🥤|Energydrink|مشروب طاقة|Energy drink
🧃|Sirup|شراب مركز|Cordial
🥛|Kakaomilch|حليب بالشوكولاتة|Chocolate milk
🧃|Smoothie|سموذي|Smoothie`,
  tk: `❄️|TK-Gemüse|خضار مجمدة|Frozen vegetables
❄️|TK-Erbsen|بازلاء مجمدة|Frozen peas
❄️|TK-Spinat|سبانخ مجمدة|Frozen spinach
❄️|TK-Okra|بامية مجمدة|Frozen okra
❄️|TK-Molokhia|ملوخية مجمدة|Frozen molokhia
❄️|TK-Bohnen|فاصولياء مجمدة|Frozen green beans
❄️|TK-Brokkoli|بروكلي مجمد|Frozen broccoli
❄️|TK-Kräuter|أعشاب مجمدة|Frozen herbs
❄️|TK-Beeren|توت مجمد|Frozen berries
❄️|TK-Mango|مانجو مجمد|Frozen mango
🍟|Pommes|بطاطا مقلية|Chips (frozen)|fries
🥔|Kartoffelecken|بطاطا ودجز|Potato wedges
🍕|Pizza|بيتزا|Pizza
🐟|Fischstäbchen|أصابع السمك|Fish fingers
🍗|Chicken Nuggets|ناجتس دجاج|Chicken nuggets|nuggets
🍗|TK-Hähnchen|دجاج مجمد|Frozen chicken
🦐|TK-Garnelen|روبيان مجمد|Frozen prawns
🧆|TK-Falafel|فلافل مجمدة|Frozen falafel
🥟|TK-Kibbeh|كبة مجمدة|Frozen kibbeh
🥟|TK-Sambousek|سمبوسك مجمد|Frozen sambousek
🍦|Eis|آيس كريم|Ice cream|eiscreme,بوظة
🥟|Blätterteig|عجينة مورقة|Puff pastry
🥟|Filoteig|عجينة الفيلو|Filo pastry|baklava teig
🥟|Sambusa-Teig|عجينة سمبوسك|Samosa pastry|yufka
🥟|Pizzateig|عجينة بيتزا|Pizza dough
🥟|Mantı|شيشبرك|Manti|shishbarak`,
  orient: `🥫|Tahin|طحينة|Tahini|tahini,sesampaste
🧆|Hummus|حمص|Hummus
🧆|Falafel|فلافل|Falafel
🧆|Falafel-Mischung|خلطة فلافل|Falafel mix
🧆|Mutabbal|متبل|Moutabal|baba ghanoush,بابا غنوج
🌶️|Muhammara|محمرة|Muhammara
🧀|Halloumi|جبنة حلوم|Halloumi|حلوم
🧀|Akkawi-Käse|جبنة عكاوي|Akkawi cheese
🧀|Nabulsi-Käse|جبنة نابلسية|Nabulsi cheese
🧀|Majdouleh-Käse|جبنة مجدولة|Braided cheese|جبنة مشللة,tresse
🧀|Shanklish|شنكليش|Shanklish
🧀|Jameed|جميد|Jameed
🥛|Labneh|لبنة|Labneh
🥛|Labneh-Kugeln|لبنة مكعزلة|Labneh balls|لبنة بالزيت
🥛|Qishta|قشطة|Ashta cream
🧈|Ghee|سمن|Ghee|butterschmalz,سمنة
🧈|Samneh Baladi|سمنة بلدية|Clarified butter
🌴|Datteln|تمر|Dates
🌴|Medjool-Datteln|تمر مجهول|Medjool dates
🌴|Dattelpaste|عجوة|Date paste|ajwa
🍯|Dattelsirup|دبس تمر|Date syrup
🍯|Traubensirup|دبس عنب|Grape molasses
🍯|Carobsirup|دبس خروب|Carob molasses
🍯|Granatapfelsirup|دبس رمان|Pomegranate molasses
🌶️|Paprikamark|دبس فليفلة|Pepper paste|biber salçası
🍇|Weinblätter|ورق عنب|Vine leaves
🌿|Molokhia|ملوخية|Molokhia
🌿|Getrocknete Molokhia|ملوخية يابسة|Dried molokhia
🌾|Freekeh|فريكة|Freekeh
🌾|Feiner Bulgur|برغل ناعم|Fine bulgur
🌾|Grober Bulgur|برغل خشن|Coarse bulgur
🌾|Feiner Grieß|سميد ناعم|Fine semolina
🌾|Kishk|كشك|Kishk
🍬|Halawa|حلاوة طحينية|Halva|حلاوة
🥒|Eingelegtes Gemüse|مخللات|Mixed pickles
🥒|Eingelegte Rüben|لفت مخلل|Pickled turnips
🍆|Makdous|مكدوس|Makdous
🫘|Foul (Dose)|فول مدمس|Ful medames
🫘|Msabaha|مسبحة|Msabbaha
☕|Arabischer Kaffee|قهوة عربية|Arabic coffee|mokka
☕|Kaffee mit Kardamom|قهوة مع هيل|Coffee with cardamom
🌿|Mate-Tee|متة|Yerba mate
🍵|Hibiskus|كركديه|Hibiscus tea
🍵|Anistee|شاي يانسون|Anise tea
🍵|Zimttee|شاي قرفة|Cinnamon tea
🧂|Mandi-Gewürz|بهارات مندي|Mandi spice
🧂|Kabsa-Gewürz|بهارات كبسة|Kabsa spice
🧂|Shawarma-Gewürz|بهارات شاورما|Shawarma spice
🧂|Maqluba-Gewürz|بهارات مقلوبة|Maqluba spice
🧂|Getrocknete Limetten|لومي|Dried limes|loomi
🌹|Rosenwasser|ماء ورد|Rose water
🌼|Orangenblütenwasser|ماء زهر|Orange blossom water
🥜|Mastix|مستكة|Mastic
🧂|Mahlab|محلب|Mahlab
🍝|Kunafa-Teig|عجينة كنافة|Kunafa dough
🥮|Maamoul|معمول|Maamoul
🥯|Ka'ak|كعك|Ka'ak
🍪|Barazek|برازق|Barazek
🍯|Baklava|بقلاوة|Baklava
🍬|Lokum|راحة الحلقوم|Turkish delight
🍮|Qamar ad-Din|قمر الدين|Apricot paste
🥤|Tamarinde|تمر هندي|Tamarind
🥤|Vimto|فيمتو|Vimto
🥤|Jallab|جلاب|Jallab
🥩|Halal-Fleisch|لحم حلال|Halal meat
🌰|Bizr (Kerne-Mix)|بزورات|Mixed seeds
🫓|Zaatar-Mischung|زعتر مع سمسم|Za'atar mix`,
  drogerie: `🧴|Shampoo|شامبو|Shampoo
🧴|Spülung|بلسم|Conditioner
🧴|Haarkur|ماسك شعر|Hair mask
🧴|Duschgel|سائل استحمام|Shower gel
🧼|Seife|صابون|Soap
🧼|Flüssigseife|صابون سائل|Liquid soap
🪥|Zahnpasta|معجون أسنان|Toothpaste
🪥|Zahnbürste|فرشاة أسنان|Toothbrush
🪥|Zahnseide|خيط أسنان|Dental floss
🪥|Miswak|مسواك|Miswak
🧴|Mundspülung|غسول فم|Mouthwash
🧴|Deo|مزيل عرق|Deodorant
🧴|Creme|كريم|Cream
🧴|Gesichtscreme|كريم الوجه|Face cream
🧴|Handcreme|كريم يدين|Hand cream
🧴|Bodylotion|لوشن للجسم|Body lotion
🧴|Sonnencreme|واقي شمس|Sunscreen
🧴|Lippenpflege|مرطب شفاه|Lip balm
🪒|Rasierer|شفرات حلاقة|Razors|rasierklingen
🪒|Rasierschaum|رغوة حلاقة|Shaving foam
🧻|Taschentücher|مناديل|Tissues|محارم
🧻|Wattepads|قطن|Cotton pads
🧻|Wattestäbchen|أعواد قطن|Cotton buds
🩹|Pflaster|لاصق جروح|Plasters
💊|Schmerztabletten|مسكن ألم|Painkillers|paracetamol,ibuprofen
🧴|Binden|فوط صحية|Sanitary pads
🧴|Slipeinlagen|فوط يومية|Panty liners
💊|Vitamine|فيتامينات|Vitamins
💊|Vitamin D|فيتامين د|Vitamin D
💇|Haargel|جل شعر|Hair gel
🧴|Haaröl|زيت شعر|Hair oil
🎨|Henna|حناء|Henna
💄|Make-up|مكياج|Make-up
🧴|Abschminktücher|مناديل إزالة المكياج|Make-up wipes
🧴|Nagellackentferner|مزيل طلاء الأظافر|Nail polish remover
🧴|Desinfektionsmittel|معقم|Disinfectant
🌸|Parfüm (alkoholfrei)|عطر بدون كحول|Alcohol-free perfume|oud,عود,دهن عود
🪔|Bakhoor|بخور|Bakhoor|weihrauch
🌡️|Fieberthermometer|ميزان حرارة|Thermometer`,
  haushalt: `🧻|Toilettenpapier|ورق تواليت|Toilet paper|klopapier
🧻|Küchenrolle|مناديل مطبخ|Kitchen roll|küchenpapier
🧽|Spülmittel|سائل جلي|Washing-up liquid
🧽|Spülmaschinentabs|أقراص غسالة الصحون|Dishwasher tablets|tabs
🧂|Spülmaschinensalz|ملح غسالة الصحون|Dishwasher salt
✨|Klarspüler|ملمع غسالة الصحون|Rinse aid
🧺|Waschmittel|مسحوق غسيل|Laundry detergent
🧺|Colorwaschmittel|مسحوق غسيل للملون|Colour detergent
🧺|Weichspüler|منعم ملابس|Fabric softener
🧺|Fleckentferner|مزيل بقع|Stain remover
🧽|Schwämme|إسفنج|Sponges|schwamm
🧹|Putzmittel|منظف|All-purpose cleaner|allzweckreiniger
🧴|Glasreiniger|منظف زجاج|Glass cleaner
🧴|WC-Reiniger|منظف حمام|Toilet cleaner
🧴|Badreiniger|منظف الحمامات|Bathroom cleaner
🧴|Chlorreiniger|كلور|Bleach
🧴|Entkalker|مزيل الكلس|Descaler
🧴|Bodenreiniger|منظف أرضيات|Floor cleaner
🌸|Raumduft|معطر جو|Air freshener
🗑️|Müllbeutel|أكياس قمامة|Bin bags
🧻|Alufolie|ورق ألمنيوم|Aluminium foil
🧻|Frischhaltefolie|نايلون لاصق|Cling film
🧻|Backpapier|ورق خبز|Baking paper
🛍️|Gefrierbeutel|أكياس تفريز|Freezer bags
🛍️|Brotbeutel|أكياس خبز|Bread bags
🧻|Servietten|محارم سفرة|Napkins
🍽️|Pappteller|صحون كرتون|Paper plates
🥤|Pappbecher|أكواب كرتون|Paper cups
🧹|Wischtücher|مماسح|Cleaning cloths|putztücher
🧤|Gummihandschuhe|قفازات|Rubber gloves
🕯️|Kerzen|شموع|Candles
🔋|Batterien|بطاريات|Batteries
💡|Glühbirnen|لمبات|Light bulbs
🪰|Insektenspray|مبيد حشرات|Insect spray
🔥|Grillkohle|فحم للشوي|Charcoal`,
  baby: `🧷|Windeln|حفاضات|Nappies
🧻|Feuchttücher|مناديل مبللة|Wet wipes
🍼|Babymilch|حليب أطفال|Baby formula
🥣|Babybrei|طعام أطفال|Baby food
🥣|Babykekse|بسكويت أطفال|Baby biscuits
🍐|Quetschies|هريس فواكه للأطفال|Fruit pouches
🧴|Babycreme|كريم أطفال|Baby cream
🧴|Wundschutzcreme|كريم التسلخات|Nappy cream
🧴|Babyshampoo|شامبو أطفال|Baby shampoo
🧴|Babyöl|زيت أطفال|Baby oil
🍼|Schnuller|مصاصة|Dummy
🍼|Fläschchen|رضاعة|Baby bottle`
};

export const PRODUCTS = [];
export const PRODUCT = {};
for (const [cat, raw] of Object.entries(RAW)) {
  for (const line of raw.split('\n')) {
    const [emoji, de, ar, en = '', alias = ''] = line.split('|');
    const id = norm(de).replace(/ /g, '-');
    if (PRODUCT[id]) continue;
    const p = { id, emoji, de, ar, en, cat, n: [norm(de), norm(ar), norm(en), ...alias.split(',').map(norm)].filter(Boolean) };
    PRODUCTS.push(p); PRODUCT[id] = p;
  }
}
// Frühere IDs, damit bereits gespeicherte Artikel weiter erkannt werden
for (const [old, now] of [['wuerstchen', 'wuerstchen-halal'], ['fruchtgummi', 'fruchtgummi-halal']]) PRODUCT[old] = PRODUCT[now];

/** Sucht in einer Produktliste (Katalog + eigene Artikel). Beste Treffer zuerst. */
export function search(list, q, max = 60) {
  const n = norm(q); if (!n) return [];
  const hits = [];
  for (const p of list) {
    let best = 9;
    for (const name of p.n) {
      const s = name === n ? 0 : name.startsWith(n) ? 1 : name.split(' ').some(w => w.startsWith(n)) ? 2 : name.includes(n) ? 3 : 9;
      if (s < best) best = s;
    }
    if (best < 9) hits.push([best, p]);
  }
  return hits.sort((a, b) => a[0] - b[0]).slice(0, max).map(h => h[1]);
}

/** Findet zu einem freien Namen (z. B. Rezeptzutat "Zwiebel") das passende Produkt. */
export function findProduct(list, name) {
  const n = norm(name); if (!n) return null;
  const words = n.split(' ');
  let best = null, score = 0;
  for (const p of list) {
    for (const pn of p.n) {
      let s = 0;
      if (pn === n) s = 1000;
      else if (pn.includes(' ')) { if ((' ' + n + ' ').includes(' ' + pn + ' ')) s = 100 + pn.length; }
      else if (words.some(w => w === pn || (Math.min(w.length, pn.length) >= 3 && Math.abs(w.length - pn.length) <= 2 && (w.startsWith(pn) || pn.startsWith(w))))) s = pn.length;
      if (s > score) { score = s; best = p; }
    }
  }
  return best;
}
