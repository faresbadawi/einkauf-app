// Eure frühere Einkaufsliste – bereinigt (Doppelte zusammengefasst) und übersetzt.
// Format: Markt|Deutsch|Arabisch|Kategorie|Emoji     Markt: a = Arabischer Markt, s = Supermarkt, d = dm
// Steht der deutsche Name im Katalog, wird der Katalogartikel benutzt (Kategorie/Emoji dann egal).
// "!" am Anfang = war in der alten Liste noch nicht abgehakt.
const RAW = `
!a|Fladenbrot|خبز عربي
a|Irakisches Brot (Marshrouh)|خبز عراقي / مشروح|brot|🫓
a|Gewürzgurken|مخلل خيار
a|Minze|نعنع
a|Grieß (mittel)|سميد وسط|orient|🌾
a|Feiner Grieß|سميد ناعم
a|Hackfleisch|لحمة مفرومة
a|Gulasch|لحمة قطع
a|Hähnchenbrust|صدر دجاج
a|Hähnchen|دجاج
a|Hähnchenschenkel ohne Knochen|وردات دجاج مسحّبة|fleisch|🍗
a|Lammkoteletts|ريش غنم|fleisch|🥩
a|Steak|ستيك
a|Lammfett|دهنة|fleisch|🥩
a|Zucchini|كوسا
a|Auberginen|باذنجان
a|Grüne Bohnen|فاصولياء خضراء
a|Okra|بامية
a|Blumenkohl|قرنبيط
a|Grüne Peperoni|فليفلة خضراء صغيرة|gemuese|🌶️
a|Petersilie|بقدونس
a|Koriander|كزبرة
a|Salbei|ميرمية|kraeuter|🌿
a|Granatapfel|رمان
a|Datteln|تمر
a|Dattelpaste (Ajwa)|عجوة|orient|🌴
a|Joghurt|لبن
a|Labneh|لبنة
a|Käse|جبنة
a|Tresse-Käse (Majdouleh)|جبنة مشللة|orient|🧀
a|Milchpulver|حليب بودرة|milch|🥛
a|Ghee|سمنة
a|Pflanzenfett|سمن نباتي|gewuerze|🧈
a|Bulgur|برغل
a|Grober Bulgur|برغل خشن|vorrat|🌾
a|Feiner Bulgur|برغل ناعم
a|Brauner Bulgur|برغل أسمر|vorrat|🌾
a|Bulgur für Kibbeh|برغل للكبة|orient|🌾
a|Freekeh|فريكة
a|Basmatireis|أرز بسمتي
a|Rundkornreis|رز مصري
a|Linsen|عدس
a|Suppennudeln|شعيرية
a|Instantnudeln|اندومي
a|Foul (Dose)|فول معلب
a|Kichererbsen (Dose)|حمص حب معلب
a|Molokhia|ملوخية
a|Weinblätter|ورق عنب
a|Makdous|مكدوس
a|Grüne Oliven|زيتون أخضر|konserven|🫒
a|Schwarze Oliven|زيتون أسود|konserven|🫒
a|Tomatenmark|دبس بندورة
a|Paprikamark|دبس فليفلة|orient|🌶️
a|Granatapfelsirup|دبس رمان
a|Zitronensaft|عصير ليمون
a|Tahin|طحينة
a|Zaatar|زعتر
a|Pul Biber (Paprikaflocken)|فليفلة ناعمة رش|gewuerze|🌶️
a|Gewürzmischung (Takhlita)|تخليطة|gewuerze|🧂
a|Ka'ak-Gewürz|حوايج كعك|orient|🧂
a|Rosenwasser|ماء الورد
a|Orangenblütenwasser|ماء الزهر
a|Arabischer Kaffee|قهوة عربية
a|Schwarzer Tee|شاي
a|Ka'ak (Sesamkringel)|كعك|orient|🥯
a|Barazek (Sesamkekse)|برازق|orient|🍪
a|Kunafa|كنافة|orient|🍮
a|Schokoküsse (Tarabish)|طرابيش|snacks|🍫
a|Teigblätter|رقائق العجين|tk|🥟
a|Mantı (Shishbarak)|شيشبرك تركي|tk|🥟
a|Gelatine|جيلاتين|backen|🍮
a|Ka'ak-Formen|قوالب كعك|haushalt|🍪
s|Gurken|خيار
s|Kopfsalat|خس
s|Tomaten|بندورة
s|Cherrytomaten|بندورة صغيرة
s|Avocado|أفوكادو
s|Paprika|فليفلة
s|Zwiebeln|بصل
s|Rote Zwiebeln|بصل أحمر
s|Frühlingszwiebeln|بصل أخضر
s|Knoblauch|ثوم
s|Kartoffeln|بطاطا
s|Süßkartoffeln|بطاطا حلوة
s|Möhren|جزر
s|Staudensellerie|كرفس
s|Champignons|فطر
s|Braune Champignons|فطر بني|gemuese|🍄
s|Kürbis|قرع
s|Radieschen|فجل
s|Brokkoli|بروكلي
s|Rotkohl|ملفوف أحمر
s|Rote Bete|شمندر
s|Erbsen|بازلاء
s|Weiße Bohnen|فاصولياء بيضاء
s|Salatzutaten|أغراض سلطة|gemuese|🥗
s|Thymian|زعتر أخضر
s|Rosmarin|إكليل الجبل
s|Schnittlauch|ثوم معمر
s|Obst (nach Saison)|فواكه|obst|🍇
s|Bananen|موز
s|Äpfel|تفاح
s|Weintrauben|عنب
s|Zitronen|ليمون
s|Wassermelone|بطيخ
s|Ananas|أناناس
s|Milch|حليب
s|Eier|بيض
s|Sahne|كريمة طبخ
s|Fruchtjoghurt|لبن مطعّم|milch|🍓
s|Griechischer Joghurt|لبن يوناني
s|Proteinjoghurt|لبن بروتين|milch|🥛
s|Frischkäse|جبنة دهن
s|Kaschkaval-Käse|جبنة قشقوان|milch|🧀
s|Gouda|جبنة صفراء
s|Mozzarella|جبنة موزاريلا
s|Parmesan|جبنة بارميزان
s|Ricotta|جبنة ريكوتا|milch|🧀
s|Kondensmilch|حليب مكثف
s|Räuchertofu|توفو مدخن|milch|🧈
s|Aufschnitt|مرتديلا
s|Fisch|سمك
s|Garnelen|قريدس
s|Toastbrot|خبز توست
s|Mehl|طحين
s|Frittiermehl|طحين القلي|backen|🌾
s|Speisestärke|نشاء
s|Kakao|كاكاو
s|Lasagneplatten|معكرونة لازانيا
s|Farfalle|معكرونة فراشة|vorrat|🍝
s|Kleine Nudeln (Koshari)|معكرونة الكشري|vorrat|🍝
s|Gehackte Tomaten|بندورة مقطعة معلبة
s|Getrocknete Tomaten|بندورة مجففة|konserven|🍅
s|Mais (Dose)|ذرة
s|Kokosmilch|حليب جوز الهند
s|Kokosnuss|جوز الهند
s|Gemüsebrühe|ماجي خضار
s|Sojasauce|صوص الصويا
s|Olivenöl|زيت زيتون
s|Sonnenblumenöl|زيت قلي
s|Balsamico-Essig|خل البلسميكو|gewuerze|🍶
s|Salz|ملح
s|Piment|بهار حلو|gewuerze|🧂
s|Sesam|سمسم
s|Honig|عسل
s|Marmelade|مربى
s|Preiselbeermarmelade|مربى التوت البري|fruehstueck|🍓
s|Schokocreme|شوكولا دهن
s|Instantkaffee|نسكافيه
s|Saft|عصير
s|Cola|كولا
s|Schokolade|شوكولا
s|Butterkekse|بسكويت الشاي|snacks|🍪
!s|Popcorn|بوشار
s|Salzstangen|أصابع مملحة
s|Kaugummi|علكة
s|Pistazien|فستق حلبي
s|Pinienkerne|صنوبر
s|Mandeln|لوز
s|Walnüsse|جوز
s|Maronen|كستناء|snacks|🌰
s|Kürbiskerne|بذر يقطين|snacks|🎃
s|Rosinen|زبيب
s|Pommes|بطاطا مقلية
s|TK-Kirschen|كرز مجمد|tk|🍒
s|Ouzi-Teig|عجين أوزي|tk|🥟
d|Toilettenpapier|محارم تواليت
d|Taschentücher|محارم
d|Duft-Taschentücher|محارم معطرة|drogerie|🧻
d|Spülmittel|سائل جلي
d|Spülmaschinentabs|مكعبات جلاية
d|Colorwaschmittel|مسحوق غسيل للملون|haushalt|🧺
d|Wäscheparfüm|معطر غسيل|haushalt|🌸
d|Raumduft|معطر جو للبيت|haushalt|🌸
d|WC-Reiniger|منظف للتواليت
d|Müllbeutel|أكياس زبالة شفافة
d|Backpapier|ورق زبدة
d|Shampoo|شامبو
d|Spülung|بلسم
d|Duschgel|جل الاستحمام
d|Bodylotion|كريم للجسم
d|Zahnpasta|معجون أسنان
d|Binden|فوط
d|Damenrasierer|شفرات حلاقة نسائية|drogerie|🪒
d|Wattepads|قطن لمسح المكياج
d|Make-up-Entferner|مزيل مكياج|drogerie|🧴
d|Eyeliner|آيلاينر|drogerie|💄
d|Gesichtscreme (grün)|كريم البشرة الأخضر|drogerie|🧴
d|Vitamin C|فيتامين C|drogerie|💊
`;

export const OLD_LIST = RAW.trim().split('\n').map(line => {
  const open = line.startsWith('!');
  const [s, de, ar, cat = 'sonst', emoji = '🛒'] = line.replace(/^!/, '').split('|');
  return { s, de, ar, cat, emoji, open };
});
