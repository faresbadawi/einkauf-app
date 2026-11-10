// Produktkatalog: Kategorien und Artikel auf Deutsch und Arabisch.
// Zeilenformat:  Emoji|Deutsch|Arabisch|weitere Suchwörter (optional, mit Komma)

/** Vereinheitlicht Text für Suche und Vergleich (Deutsch + Arabisch). */
export const norm = s => String(s ?? '').toLowerCase()
  .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9ء-ي]+/g, ' ').trim();

export const CATS = [
  ['obst', '🍎', 'Obst', 'فواكه'],
  ['gemuese', '🥬', 'Gemüse', 'خضار'],
  ['kraeuter', '🌿', 'Kräuter', 'أعشاب'],
  ['milch', '🥛', 'Milch & Eier', 'ألبان وبيض'],
  ['fleisch', '🥩', 'Fleisch & Fisch', 'لحوم وأسماك'],
  ['brot', '🍞', 'Brot & Backwaren', 'خبز ومخبوزات'],
  ['vorrat', '🍝', 'Nudeln, Reis & Hülsenfrüchte', 'معكرونة وأرز وبقوليات'],
  ['konserven', '🥫', 'Konserven & Saucen', 'معلبات وصلصات'],
  ['gewuerze', '🧂', 'Gewürze & Öle', 'بهارات وزيوت'],
  ['backen', '🧁', 'Backen', 'لوازم الحلويات'],
  ['fruehstueck', '🍯', 'Frühstück, Kaffee & Tee', 'فطور وقهوة وشاي'],
  ['snacks', '🍫', 'Süßes & Snacks', 'حلويات ومكسرات'],
  ['getraenke', '🥤', 'Getränke', 'مشروبات'],
  ['tk', '❄️', 'Tiefkühl', 'مجمدات'],
  ['orient', '🧆', 'Orientalisch', 'منتجات عربية'],
  ['drogerie', '🧴', 'Drogerie & Pflege', 'عناية شخصية'],
  ['haushalt', '🧽', 'Haushalt & Reinigung', 'تنظيف ومنزل'],
  ['baby', '👶', 'Baby', 'أطفال'],
  ['sonst', '🛒', 'Sonstiges', 'أخرى']
].map(([id, emoji, de, ar]) => ({ id, emoji, de, ar }));
export const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
export const CAT_ORDER = Object.fromEntries(CATS.map((c, i) => [c.id, i]));

const RAW = {
  obst: `🍎|Äpfel|تفاح|apfel
🍐|Birnen|إجاص|birne,كمثرى
🍌|Bananen|موز|banane
🍊|Orangen|برتقال|orange,apfelsine
🍊|Mandarinen|يوسفي|mandarine,clementinen,كلمنتينا
🍋|Zitronen|ليمون|zitrone,ليمون حامض
🍋|Limetten|ليمون أخضر|limette
🍇|Weintrauben|عنب|trauben
🍓|Erdbeeren|فراولة|erdbeere,فريز
🫐|Heidelbeeren|توت أزرق|blaubeeren
🍓|Himbeeren|توت العليق|himbeere
🍒|Kirschen|كرز|kirsche
🍑|Pfirsiche|خوخ|pfirsich,دراق
🍑|Nektarinen|نكتارين|nektarine
🍑|Aprikosen|مشمش|aprikose
🟣|Pflaumen|برقوق|pflaume,zwetschgen
🍉|Wassermelone|بطيخ|melone,جبس
🍈|Honigmelone|شمام
🍍|Ananas|أناناس
🥭|Mango|مانجو
🥝|Kiwi|كيوي
🥑|Avocado|أفوكادو
🍎|Granatapfel|رمان
🍈|Feigen|تين|feige
🥥|Kokosnuss|جوز الهند
🍊|Grapefruit|جريب فروت|pampelmuse`,
  gemuese: `🍅|Tomaten|طماطم|tomate,بندورة
🍅|Cherrytomaten|طماطم كرزية|cocktailtomaten
🥒|Gurken|خيار|gurke,salatgurke
🫑|Paprika|فلفل حلو|paprikaschote,فليفلة
🌶️|Chili|فلفل حار|chilischote,peperoni
🥕|Möhren|جزر|karotten,karotte,möhre
🥔|Kartoffeln|بطاطا|kartoffel,بطاطس
🍠|Süßkartoffeln|بطاطا حلوة|süßkartoffel
🧅|Zwiebeln|بصل|zwiebel
🧅|Rote Zwiebeln|بصل أحمر
🧅|Frühlingszwiebeln|بصل أخضر|lauchzwiebeln
🧄|Knoblauch|ثوم|knoblauchzehe,knoblauchzehen
🫚|Ingwer|زنجبيل
🥬|Kopfsalat|خس|salat,blattsalat
🥬|Römersalat|خس روماني|romana
🥬|Eisbergsalat|خس آيسبرغ
🥬|Rucola|جرجير
🥬|Spinat|سبانخ|blattspinat
🥬|Weißkohl|ملفوف|kohl,krautkopf
🥬|Rotkohl|ملفوف أحمر
🥦|Brokkoli|بروكلي
🥦|Blumenkohl|قرنبيط|زهرة
🍆|Auberginen|باذنجان|aubergine
🥒|Zucchini|كوسا
🎃|Kürbis|يقطين|قرع
🍄|Champignons|فطر|pilze
🌽|Maiskolben|ذرة
🫛|Erbsen|بازلاء
🫘|Grüne Bohnen|فاصولياء خضراء|لوبيا
🥬|Lauch|كراث|porree
🥬|Staudensellerie|كرفس|sellerie
🥬|Rote Bete|شمندر
🥬|Radieschen|فجل
🥬|Kohlrabi|كولرابي
🥬|Fenchel|شمر
🥬|Spargel|هليون
🥬|Okra|بامية
🥬|Mangold|سلق`,
  kraeuter: `🌿|Petersilie|بقدونس
🌿|Koriander|كزبرة|كزبرة خضراء
🌿|Minze|نعناع
🌿|Dill|شبت
🌿|Basilikum|ريحان
🌿|Schnittlauch|ثوم معمر
🌿|Thymian|زعتر أخضر
🌿|Rosmarin|إكليل الجبل`,
  milch: `🥛|Milch|حليب|vollmilch
🥛|Haferdrink|حليب الشوفان|hafermilch
🧈|Butter|زبدة
🧈|Margarine|مارغرين
🥚|Eier|بيض|ei
🥛|Joghurt|لبن زبادي|naturjoghurt,لبن,زبادي
🥛|Griechischer Joghurt|زبادي يوناني
🥛|Ayran|عيران
🥛|Sahne|كريمة|schlagsahne,kochsahne,قشطة
🥛|Schmand|كريمة حامضة|saure sahne,creme fraiche
🥛|Quark|جبن قريش|magerquark
🥛|Frischkäse|جبنة كريمية
🧀|Käse|جبنة|scheibenkäse
🧀|Gouda|جبنة جودا
🧀|Mozzarella|موزاريلا
🧀|Feta|جبنة فيتا
🧀|Hirtenkäse|جبنة بيضاء|weißkäse
🧀|Parmesan|بارميزان
🧀|Reibekäse|جبنة مبشورة|streukäse
🧀|Schmelzkäse|جبنة مثلثات
🥛|Kondensmilch|حليب مكثف
🍮|Pudding|بودينغ`,
  fleisch: `🍗|Hähnchen|دجاج|huhn,hühnchen,فروج
🍗|Hähnchenbrust|صدر دجاج|hähnchenbrustfilet
🍗|Hähnchenschenkel|أفخاذ دجاج|hähnchenkeulen
🍗|Hähnchenflügel|أجنحة دجاج|chicken wings
🥩|Hackfleisch|لحم مفروم|rinderhack,hack
🥩|Rindfleisch|لحم بقر
🥩|Lammfleisch|لحم خروف|lamm,لحم غنم
🥩|Steak|ستيك
🥩|Gulasch|لحم مقطع
🌭|Würstchen|نقانق|wurst
🥓|Aufschnitt|مرتديلا|geflügelwurst
🥩|Sucuk|سجق
🦃|Pute|ديك رومي|putenbrust,حبش
🐟|Fisch|سمك|fischfilet
🐟|Lachs|سلمون
🦐|Garnelen|روبيان|shrimps,قريدس,جمبري`,
  brot: `🍞|Brot|خبز
🍞|Toastbrot|خبز توست|toast
🍞|Vollkornbrot|خبز أسمر
🥖|Baguette|خبز فرنسي
🥯|Brötchen|خبز صغير|semmeln,صمون
🥯|Burgerbrötchen|خبز برغر|burger buns
🫓|Fladenbrot|خبز عربي|arabisches brot,pita
🫓|Wraps|خبز تورتيلا|tortilla
🥐|Croissants|كرواسون
🥨|Brezeln|بريتزل
🍰|Kuchen|كيك
🍞|Zwieback|قرشلة`,
  vorrat: `🍝|Spaghetti|سباغيتي
🍝|Nudeln|معكرونة|pasta,penne,fusilli
🍝|Lasagneplatten|رقائق لازانيا
🍜|Suppennudeln|شعيرية|fadennudeln
🍜|Instantnudeln|نودلز سريعة|indomie,اندومي
🍚|Reis|أرز|رز
🍚|Basmatireis|أرز بسمتي
🍚|Rundkornreis|أرز مصري|milchreis
🌾|Bulgur|برغل
🌾|Couscous|كسكس
🫘|Rote Linsen|عدس أحمر
🫘|Linsen|عدس|braune linsen
🫘|Kichererbsen|حمص حب
🫘|Weiße Bohnen|فاصولياء بيضاء
🫘|Kidneybohnen|فاصولياء حمراء
🫘|Dicke Bohnen|فول
🥔|Kartoffelpüree|بطاطا مهروسة
🌾|Grieß|سميد`,
  konserven: `🥫|Passierte Tomaten|طماطم معصورة|passata
🥫|Gehackte Tomaten|طماطم مقطعة معلبة|tomaten (dose),dosentomaten
🥫|Tomatenmark|معجون طماطم|رب البندورة
🥫|Tomatensauce|صلصة طماطم
🌽|Mais (Dose)|ذرة معلبة|mais
🐟|Thunfisch|تونة|thunfisch (dose)
🫒|Oliven|زيتون
🥒|Gewürzgurken|مخلل خيار|essiggurken
🥫|Ketchup|كاتشب
🥫|Mayonnaise|مايونيز
🥫|Senf|خردل
🥫|Sojasauce|صلصة الصويا
🌶️|Scharfe Sauce|صلصة حارة|chilisauce,شطة
🥫|Pesto|بيستو
🥫|Gemüsebrühe|مرق خضار
🥫|Hühnerbrühe|مرق دجاج|ماجي
🥥|Kokosmilch|حليب جوز الهند
🥫|Kichererbsen (Dose)|حمص معلب`,
  gewuerze: `🧂|Salz|ملح
🧂|Pfeffer|فلفل أسود
🫒|Olivenöl|زيت زيتون
🌻|Sonnenblumenöl|زيت دوار الشمس|öl,speiseöl,زيت نباتي
🧴|Essig|خل
🍋|Zitronensaft|عصير ليمون
🌶️|Paprikapulver|بابريكا
🧂|Kreuzkümmel|كمون
🧂|Kurkuma|كركم
🧂|Zimt|قرفة
🧂|Curry|كاري
🧂|Oregano|أوريغانو
🧂|Koriander gemahlen|كزبرة مطحونة
🧂|Kardamom|هيل
🧂|Nelken|قرنفل
🧂|Lorbeerblätter|ورق غار
🧂|Muskat|جوزة الطيب
🧂|Sieben Gewürze|سبع بهارات|7 gewürze,بهارات مشكلة
🧂|Sumach|سماق
🌿|Zaatar|زعتر
🧂|Chiliflocken|فلفل حار مجروش
🧂|Knoblauchpulver|ثوم بودرة
🧂|Getrocknete Minze|نعناع يابس
🧂|Safran|زعفران
🧂|Schwarzkümmel|حبة البركة
🧂|Sesam|سمسم`,
  backen: `🌾|Mehl|طحين|weizenmehl
🍚|Zucker|سكر
🍚|Puderzucker|سكر ناعم
🍚|Brauner Zucker|سكر بني
🧁|Backpulver|بيكنج باودر
🧁|Natron|بيكربونات الصودا
🧁|Vanillezucker|سكر فانيلا|فانيلا
🧁|Hefe|خميرة|trockenhefe
🧁|Speisestärke|نشا
🍫|Kakao|كاكاو|backkakao
🍫|Kuvertüre|شوكولاتة للطبخ
🥥|Kokosraspeln|جوز هند مبشور
🍞|Paniermehl|بقسماط|semmelbrösel`,
  fruehstueck: `🍯|Honig|عسل
🍓|Marmelade|مربى|konfitüre
🍫|Schokocreme|شوكولاتة للدهن|nutella,نوتيلا
🥜|Erdnussbutter|زبدة الفول السوداني
🥣|Müsli|موسلي
🥣|Cornflakes|كورن فليكس
🥣|Haferflocken|شوفان
☕|Kaffee|قهوة|filterkaffee
☕|Instantkaffee|نسكافيه|nescafe
🍵|Schwarzer Tee|شاي أسود|tee,شاي
🍵|Grüner Tee|شاي أخضر
🍵|Kräutertee|شاي أعشاب|kamillentee,pfefferminztee`,
  snacks: `🍫|Schokolade|شوكولاتة
🍪|Kekse|بسكويت
🍬|Fruchtgummi|حلوى مطاطية|gummibärchen
🍬|Bonbons|سكاكر
🥔|Chips|شيبس
🍿|Popcorn|فشار
🥜|Nüsse|مكسرات|nussmischung
🥜|Erdnüsse|فول سوداني
🌰|Walnüsse|جوز
🌰|Mandeln|لوز
🌰|Pistazien|فستق حلبي
🌰|Cashews|كاجو
🌰|Pinienkerne|صنوبر
🍇|Rosinen|زبيب
🌻|Sonnenblumenkerne|بزر دوار الشمس|بزر
🥨|Salzstangen|أصابع مملحة
🍫|Müsliriegel|ألواح حبوب
🍬|Kaugummi|علكة`,
  getraenke: `💧|Wasser|ماء|mineralwasser,stilles wasser
💧|Sprudelwasser|ماء فوار
🧃|Saft|عصير
🧃|Orangensaft|عصير برتقال
🧃|Apfelsaft|عصير تفاح
🥤|Cola|كولا
🥤|Limonade|مشروب غازي|fanta,sprite
🥤|Eistee|شاي مثلج
🥤|Malzgetränk|شراب الشعير
🧃|Sirup|شراب مركز`,
  tk: `❄️|TK-Gemüse|خضار مجمدة
❄️|TK-Erbsen|بازلاء مجمدة
❄️|TK-Spinat|سبانخ مجمدة
❄️|TK-Okra|بامية مجمدة
❄️|TK-Molokhia|ملوخية مجمدة
❄️|TK-Beeren|توت مجمد
🍟|Pommes|بطاطا مقلية
🍕|Pizza|بيتزا
🐟|Fischstäbchen|أصابع السمك
🍦|Eis|آيس كريم|eiscreme,بوظة
🥟|Blätterteig|عجينة مورقة
🥟|Sambusa-Teig|عجينة سمبوسك|yufka`,
  orient: `🥫|Tahin|طحينة|tahini,sesampaste
🧆|Hummus|حمص
🧆|Falafel|فلافل
🧀|Halloumi|جبنة حلوم|حلوم
🧀|Akkawi-Käse|جبنة عكاوي
🧀|Nabulsi-Käse|جبنة نابلسية
🥛|Labneh|لبنة
🥛|Qishta|قشطة
🧈|Ghee|سمن|butterschmalz,سمنة
🌴|Datteln|تمر
🍯|Dattelsirup|دبس تمر
🍯|Granatapfelsirup|دبس رمان
🍇|Weinblätter|ورق عنب
🌿|Molokhia|ملوخية
🌾|Freekeh|فريكة
🌾|Feiner Bulgur|برغل ناعم
🌾|Feiner Grieß|سميد ناعم
🍬|Halawa|حلاوة طحينية|حلاوة
🥒|Eingelegtes Gemüse|مخللات|mixed pickles
🍆|Makdous|مكدوس
🫘|Foul (Dose)|فول مدمس
☕|Arabischer Kaffee|قهوة عربية|mokka
🌿|Mate-Tee|متة
🍵|Hibiskus|كركديه
🧂|Mandi-Gewürz|بهارات مندي
🧂|Kabsa-Gewürz|بهارات كبسة
🧂|Shawarma-Gewürz|بهارات شاورما
🧂|Getrocknete Limetten|لومي
🌹|Rosenwasser|ماء ورد
🌼|Orangenblütenwasser|ماء زهر
🥜|Mastix|مستكة
🍝|Kunafa-Teig|عجينة كنافة
🥩|Halal-Fleisch|لحم حلال
🍮|Qamar ad-Din|قمر الدين
🥤|Tamarinde|تمر هندي
🥤|Vimto|فيمتو`,
  drogerie: `🧴|Shampoo|شامبو
🧴|Spülung|بلسم
🧴|Duschgel|سائل استحمام
🧼|Seife|صابون
🧼|Flüssigseife|صابون سائل
🪥|Zahnpasta|معجون أسنان
🪥|Zahnbürste|فرشاة أسنان
🧴|Mundspülung|غسول فم
🧴|Deo|مزيل عرق
🧴|Creme|كريم
🧴|Handcreme|كريم يدين
🧴|Bodylotion|لوشن للجسم
🧴|Sonnencreme|واقي شمس
🪒|Rasierer|شفرات حلاقة|rasierklingen
🪒|Rasierschaum|رغوة حلاقة
🧻|Taschentücher|مناديل|محارم
🧻|Wattepads|قطن
🧻|Wattestäbchen|أعواد قطن
🩹|Pflaster|لاصق جروح
🧴|Binden|فوط صحية
💊|Vitamine|فيتامينات
💇|Haargel|جل شعر
🧴|Haaröl|زيت شعر
💄|Make-up|مكياج
🧴|Abschminktücher|مناديل إزالة المكياج
🧴|Nagellackentferner|مزيل طلاء الأظافر
🧴|Desinfektionsmittel|معقم`,
  haushalt: `🧻|Toilettenpapier|ورق تواليت|klopapier
🧻|Küchenrolle|مناديل مطبخ|küchenpapier
🧽|Spülmittel|سائل جلي
🧽|Spülmaschinentabs|أقراص غسالة الصحون|tabs
🧂|Spülmaschinensalz|ملح غسالة الصحون
🧺|Waschmittel|مسحوق غسيل
🧺|Weichspüler|منعم ملابس
🧽|Schwämme|إسفنج|schwamm
🧹|Putzmittel|منظف|allzweckreiniger
🧴|Glasreiniger|منظف زجاج
🧴|WC-Reiniger|منظف حمام
🧴|Chlorreiniger|كلور
🧴|Entkalker|مزيل الكلس
🗑️|Müllbeutel|أكياس قمامة
🧻|Alufolie|ورق ألمنيوم
🧻|Frischhaltefolie|نايلون لاصق
🧻|Backpapier|ورق خبز
🛍️|Gefrierbeutel|أكياس تفريز
🧻|Servietten|محارم سفرة
🧹|Wischtücher|مماسح|putztücher
🧤|Gummihandschuhe|قفازات
🕯️|Kerzen|شموع
🔋|Batterien|بطاريات
💡|Glühbirnen|لمبات
🪰|Insektenspray|مبيد حشرات`,
  baby: `🧷|Windeln|حفاضات
🧻|Feuchttücher|مناديل مبللة
🍼|Babymilch|حليب أطفال
🥣|Babybrei|طعام أطفال
🧴|Babycreme|كريم أطفال
🧴|Babyshampoo|شامبو أطفال
🍼|Schnuller|مصاصة`
};

export const PRODUCTS = [];
export const PRODUCT = {};
for (const [cat, raw] of Object.entries(RAW)) {
  for (const line of raw.split('\n')) {
    const [emoji, de, ar, alias = ''] = line.split('|');
    const id = norm(de).replace(/ /g, '-');
    if (PRODUCT[id]) continue;
    const p = { id, emoji, de, ar, cat, n: [norm(de), norm(ar), ...alias.split(',').map(norm).filter(Boolean)] };
    PRODUCTS.push(p); PRODUCT[id] = p;
  }
}

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
