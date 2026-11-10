// Alle Texte der App auf Deutsch und Arabisch.
const S = {
  de: {
    app: 'Unser Tisch', tabList: 'Einkauf', tabRecipes: 'Rezepte', tabPlan: 'Plan', tabMore: 'Mehr',
    // Liste
    list: 'Einkaufsliste', addPh: 'Was fehlt? z. B. 2 kg Tomaten', catalog: 'Katalog', add: 'Hinzufügen',
    all: 'Alle', anywhere: 'Überall erhältlich', noStore: 'Ohne Markt', done: 'Erledigt', clearDone: 'Erledigte entfernen',
    emptyList: 'Die Liste ist leer', emptyListSub: 'Tippe oben ein, was fehlt – oder wähle einfach aus dem Katalog.', openCatalog: 'Katalog öffnen',
    nOpen: '{n} offen', allDone: 'Alles erledigt 🎉', onList: 'Steht schon auf der Liste', added: '{n} hinzugefügt',
    live: 'Live', devices: '{n} Geräte', offline: 'Offline – wird später abgeglichen', connecting: 'Verbinde …', localOnly: 'Nur auf diesem Gerät',
    // Katalog
    searchProducts: 'Artikel suchen …', mine: 'Unsere Artikel', addCustom: '„{name}“ hinzufügen', finish: 'Fertig', finishN: 'Fertig · {n} auf der Liste', nothing: 'Nichts gefunden',
    // Artikel
    qty: 'Menge', qtyPh: 'z. B. 500 g', note: 'Notiz', notePh: 'z. B. die im Angebot', where: 'Wo kaufen?', any: 'Egal',
    remembered: 'Deine Auswahl wird fürs nächste Mal gemerkt.', category: 'Kategorie', removeItem: 'Von der Liste entfernen', newStore: 'Neuer Markt',
    // Märkte
    stores: 'Märkte', storesSub: 'Lege fest, wo ihr einkauft. Jeder Artikel kann einem Markt zugeordnet werden.', storeName: 'Name', storeNamePh: 'z. B. Lidl',
    symbol: 'Symbol', color: 'Farbe', save: 'Speichern', cancel: 'Abbrechen', del: 'Löschen', edit: 'Bearbeiten', editStore: 'Markt bearbeiten',
    delStoreQ: '„{name}“ löschen? Die Artikel bleiben auf der Liste.', store_arab: 'Arabischer Markt', store_super: 'Supermarkt', store_dm: 'dm', store_ross: 'Rossmann',
    // Rezepte
    recipes: 'Rezepte', searchRecipes: 'Rezepte suchen …', favs: 'Favoriten', rc_all: 'Alle', rc_main: 'Hauptgerichte', rc_salad: 'Salate', rc_soup: 'Suppen', rc_breakfast: 'Frühstück', rc_dessert: 'Desserts',
    noRecipes: 'Noch keine Rezepte', noRecipesSub: 'Füge ein Rezept per Link hinzu – die KI liest Zutaten und Schritte für dich aus.', loadDemo: 'Beispielrezepte laden', removeDemo: 'Beispielrezepte entfernen',
    demoSub: '6 Rezepte zum Ausprobieren', newRecipe: 'Neues Rezept', fromLink: 'Aus einem Link', fromLinkSub: 'Die KI liest das Rezept von der Webseite',
    fromText: 'Text einfügen', fromTextSub: 'Kopierten Text oder Notizen in ein Rezept verwandeln', manual: 'Selbst schreiben', manualSub: 'Zutaten und Schritte von Hand eintragen',
    linkPh: 'https://…', textPh: 'Rezepttext hier einfügen …', recipeLang: 'Sprache des Rezepts', original: 'Original', readRecipe: 'Rezept lesen', aiWorking: 'Die KI liest das Rezept …',
    aiFail: 'Das hat nicht geklappt', aiNoWorker: 'Die KI ist nicht eingerichtet.', checkRecipe: 'Rezept gelesen – bitte kurz prüfen', aiPartial: 'Ohne KI gelesen – bitte genauer prüfen',
    min: 'Min', persons: 'Personen', servings: 'Portionen', ingredients: 'Zutaten', steps: 'Zubereitung', noIngredients: 'Keine Zutaten.', noSteps: 'Noch keine Zubereitung.',
    toList: 'Auf die Einkaufsliste', toListN: '{n} Zutaten auf die Liste', original_link: 'Originalrezept öffnen', translate: 'Übersetzen', translateTo: 'Übersetzen nach', translating: 'Wird übersetzt …', translated: 'Übersetzt',
    delRecipeQ: '„{name}“ löschen?', editRecipe: 'Rezept bearbeiten', title: 'Titel', emoji: 'Emoji', minutes: 'Minuten',
    ingPh: 'Eine Zutat pro Zeile, z. B. 500 g Nudeln', image: 'Bild-Link (optional)', source: 'Quelle (optional)', needTitle: 'Bitte einen Titel eingeben',
    // Plan
    plan: 'Wochenplan', thisWeek: 'diese Woche', slot0: 'Mo – Di', slot1: 'Mi – Do', slot2: 'Fr – So', pickDish: 'Gericht auswählen', dishFor: 'Gericht für {slot}', clearSlot: 'Leeren',
    suggest: 'Neu vorschlagen', suggested: 'Neuer Vorschlag ✨', weekShop: 'Zutaten der Woche', planEmpty: 'Wähle Gerichte aus, dann siehst du hier die Zutaten der Woche.', needRecipes: 'Lege zuerst Rezepte an', free: 'frei',
    // Mehr
    more: 'Einstellungen', language: 'Sprache', household: 'Haushalt', householdSub: 'Alle mit diesem Code sehen dieselbe Liste und dieselben Rezepte – live.',
    householdLocal: 'Der Sync ist nicht eingerichtet – die Daten bleiben auf diesem Gerät.', share: 'Einladen', shareText: 'Tritt unserem Haushalt in „Unser Tisch“ bei:', copied: 'Link kopiert',
    joinPh: 'Code eingeben', join: 'Beitreten', codeLen: 'Der Code hat 10 Zeichen', newHousehold: 'Neuer Haushalt', newHouseholdQ: 'Einen neuen, leeren Haushalt starten? Den alten erreichst du nur noch mit seinem Code.',
    oldTitle: 'Eure frühere Liste', oldBanner: '{n} Artikel – schon nach Märkten sortiert', oldGo: 'Ansehen',
    oldSub: 'Aus eurer alten Liste habe ich {n} verschiedene Artikel gemacht (Doppelte zusammengefasst) und auf Deutsch und Arabisch benannt.',
    oldToList: 'Alle auf die Einkaufsliste', oldToListSub: 'Danach einfach wegwischen, was ihr gerade nicht braucht',
    oldKnown: 'Nur merken', oldKnownSub: 'Im Katalog unter „Unsere Artikel“ – mit einem Tipp auf die Liste', oldDone: '{n} Artikel gemerkt – im Katalog unter „Unsere Artikel“',
    gestureTip: 'Tipp: Zur Seite wischen = löschen · lange drücken und ziehen = anderer Markt',
    deleted: '„{name}“ gelöscht', undo: 'Rückgängig', dropHere: 'Hier ablegen', movedTo: 'Verschoben: {name}',
    fx: 'Ton & Vibration', fxSub: 'Beim Tippen und Abhaken', saved: 'Gespeichert',
    aiInfo: 'Die KI liest Rezepte aus Links, übersetzt zwischen Deutsch und Arabisch und ordnet neue Artikel ein. Ein Schlüssel ist bereits auf dem Server hinterlegt.',
    aiServer: 'Server-Schlüssel', ownKey: 'Eigener Gemini-Schlüssel (optional)', ownKeySet: 'Eigener Schlüssel',
    ownKeyHint: 'Nur nötig, wenn die KI nicht antwortet. Kostenlos erhältlich unter', aiTest: 'Testen', aiTesting: 'KI wird getestet …', aiWorks: 'KI funktioniert',
    manageStores: 'Märkte verwalten', nStores: '{n} Märkte', ai: 'KI-Assistent', aiOk: 'Bereit', aiOff: 'Nicht eingerichtet', aiCheck: 'Wird geprüft …', aiErr: 'Nicht erreichbar',
    // Neu: QR, Plan-Gänge, Sammelimport, Sortierung
    codeLabel: 'Haushaltscode', qrHint: 'Andere scannen diesen Code einfach mit der Handy-Kamera – fertig.', scan: 'Scannen',
    scanTitle: 'QR-Code scannen', scanSub: 'Halte die Kamera auf den Code des anderen Geräts', scanWait: 'Kamera wird gestartet …', scanHint: 'Suche nach einem QR-Code …',
    scanNoCode: 'Das ist kein Haushalts-Code', camErr: 'Keine Kamera verfügbar. Erlaube den Zugriff – oder gib den Code unten ein.',
    joinQ: 'Diesem Haushalt beitreten?', joinInfo: 'Danach siehst du dieselbe Liste, dieselben Rezepte und denselben Plan – live.', joined: 'Willkommen im Haushalt {code} 👋', alreadyIn: 'Du bist schon in diesem Haushalt',
    mains: 'Hauptgerichte', extras: 'Dazu', extrasHint: 'Füge Salat, Dessert, Suppe oder Frühstück hinzu:', removeCourse: 'Entfernen', otherRecipes: 'Andere Rezepte',
    noneOfCourse: 'Noch keine Rezepte in „{c}“ – wähle ein anderes oder lege eins an.',
    c_main: 'Hauptgericht', c_salad: 'Salat', c_dessert: 'Dessert', c_soup: 'Suppe', c_breakfast: 'Frühstück',
    bulk: 'Mehrere Links', bulkSub: 'Viele Rezepte auf einmal – Links einfach untereinander einfügen', bulkPh: 'https://…\nhttps://…\nhttps://…',
    bulkGo: 'Alle einlesen', bulkNone: 'Keine Links gefunden', bulkRun: '{n} von {all} gelesen …', bulkDone: 'Fertig – {n} Rezepte gespeichert', bulkShow: 'Rezepte ansehen', bulkSkip: 'schon vorhanden',
    sort: 'Sortieren', sort_az: 'A – Z', sort_new: 'Neueste', sort_fast: 'Schnellste'
  },
  ar: {
    app: 'سفرتنا', tabList: 'المشتريات', tabRecipes: 'الوصفات', tabPlan: 'الخطة', tabMore: 'المزيد',
    list: 'قائمة المشتريات', addPh: 'ماذا ينقصنا؟ مثلاً 2 كغ طماطم', catalog: 'الأصناف', add: 'إضافة',
    all: 'الكل', anywhere: 'متوفر في أي مكان', noStore: 'بدون متجر', done: 'تم شراؤه', clearDone: 'حذف ما تم شراؤه',
    emptyList: 'القائمة فارغة', emptyListSub: 'اكتب ما ينقصكم في الأعلى، أو اختر من قائمة الأصناف.', openCatalog: 'فتح الأصناف',
    nOpen: '{n} متبقية', allDone: 'تم شراء كل شيء 🎉', onList: 'موجود في القائمة', added: 'تمت إضافة {n}',
    live: 'مباشر', devices: '{n} أجهزة', offline: 'غير متصل – ستتم المزامنة لاحقاً', connecting: 'جارٍ الاتصال …', localOnly: 'على هذا الجهاز فقط',
    searchProducts: 'ابحث عن صنف …', mine: 'أصنافنا', addCustom: 'إضافة «{name}»', finish: 'تم', finishN: 'تم · {n} في القائمة', nothing: 'لا توجد نتائج',
    qty: 'الكمية', qtyPh: 'مثلاً 500 غ', note: 'ملاحظة', notePh: 'مثلاً النوع الذي عليه عرض', where: 'من أين نشتريه؟', any: 'أي متجر',
    remembered: 'سيتم تذكّر اختيارك للمرة القادمة.', category: 'الفئة', removeItem: 'حذف من القائمة', newStore: 'متجر جديد',
    stores: 'المتاجر', storesSub: 'حدّدوا أين تتسوقون. يمكن ربط كل صنف بمتجر.', storeName: 'الاسم', storeNamePh: 'مثلاً Lidl',
    symbol: 'الرمز', color: 'اللون', save: 'حفظ', cancel: 'إلغاء', del: 'حذف', edit: 'تعديل', editStore: 'تعديل المتجر',
    delStoreQ: 'حذف «{name}»؟ ستبقى الأصناف في القائمة.', store_arab: 'المتجر العربي', store_super: 'السوبرماركت', store_dm: 'dm', store_ross: 'Rossmann',
    recipes: 'الوصفات', searchRecipes: 'ابحث في الوصفات …', favs: 'المفضلة', rc_all: 'الكل', rc_main: 'أطباق رئيسية', rc_salad: 'سلطات', rc_soup: 'شوربات', rc_breakfast: 'فطور', rc_dessert: 'حلويات',
    noRecipes: 'لا توجد وصفات بعد', noRecipesSub: 'أضف وصفة عبر رابط – يقرأ الذكاء الاصطناعي المكونات والخطوات عنك.', loadDemo: 'تحميل وصفات تجريبية', removeDemo: 'حذف الوصفات التجريبية',
    demoSub: '6 وصفات للتجربة', newRecipe: 'وصفة جديدة', fromLink: 'من رابط', fromLinkSub: 'يقرأ الذكاء الاصطناعي الوصفة من الموقع',
    fromText: 'لصق نص', fromTextSub: 'تحويل نص منسوخ أو ملاحظات إلى وصفة', manual: 'كتابة يدوية', manualSub: 'إدخال المكونات والخطوات بنفسك',
    linkPh: 'https://…', textPh: 'الصق نص الوصفة هنا …', recipeLang: 'لغة الوصفة', original: 'الأصلية', readRecipe: 'قراءة الوصفة', aiWorking: 'الذكاء الاصطناعي يقرأ الوصفة …',
    aiFail: 'لم تنجح العملية', aiNoWorker: 'الذكاء الاصطناعي غير مُعدّ.', checkRecipe: 'تمت قراءة الوصفة – يرجى المراجعة', aiPartial: 'تمت القراءة بدون ذكاء اصطناعي – يرجى التدقيق',
    min: 'د', persons: 'أشخاص', servings: 'الحصص', ingredients: 'المكونات', steps: 'طريقة التحضير', noIngredients: 'لا توجد مكونات.', noSteps: 'لا توجد طريقة تحضير بعد.',
    toList: 'إلى قائمة المشتريات', toListN: 'إضافة {n} مكونات إلى القائمة', original_link: 'فتح الوصفة الأصلية', translate: 'ترجمة', translateTo: 'ترجمة إلى', translating: 'جارٍ الترجمة …', translated: 'تمت الترجمة',
    delRecipeQ: 'حذف «{name}»؟', editRecipe: 'تعديل الوصفة', title: 'العنوان', emoji: 'رمز', minutes: 'الدقائق',
    ingPh: 'مكوّن في كل سطر، مثلاً 500 غ معكرونة', image: 'رابط الصورة (اختياري)', source: 'المصدر (اختياري)', needTitle: 'يرجى إدخال عنوان',
    plan: 'خطة الأسبوع', thisWeek: 'هذا الأسبوع', slot0: 'الإثنين – الثلاثاء', slot1: 'الأربعاء – الخميس', slot2: 'الجمعة – الأحد', pickDish: 'اختر طبقاً', dishFor: 'طبق {slot}', clearSlot: 'إفراغ',
    suggest: 'اقتراح جديد', suggested: 'اقتراح جديد ✨', weekShop: 'مكونات الأسبوع', planEmpty: 'اختر الأطباق لتظهر هنا مكونات الأسبوع.', needRecipes: 'أضف وصفات أولاً', free: 'فارغ',
    more: 'الإعدادات', language: 'اللغة', household: 'المنزل', householdSub: 'كل من لديه هذا الرمز يرى نفس القائمة ونفس الوصفات – مباشرةً.',
    householdLocal: 'المزامنة غير مُعدّة – تبقى البيانات على هذا الجهاز.', share: 'دعوة', shareText: 'انضم إلى منزلنا في «سفرتنا»:', copied: 'تم نسخ الرابط',
    joinPh: 'أدخل الرمز', join: 'انضمام', codeLen: 'الرمز مكوّن من 10 خانات', newHousehold: 'منزل جديد', newHouseholdQ: 'بدء منزل جديد فارغ؟ يمكن الوصول إلى القديم فقط عبر رمزه.',
    oldTitle: 'قائمتكم السابقة', oldBanner: '{n} صنفاً – مرتبة حسب المتاجر', oldGo: 'عرض',
    oldSub: 'جمعتُ من قائمتكم القديمة {n} صنفاً مختلفاً (بعد حذف المكرر) وسمّيتها بالعربية والألمانية.',
    oldToList: 'إضافة الكل إلى القائمة', oldToListSub: 'ثم اسحب جانباً ما لا تحتاجونه الآن',
    oldKnown: 'حفظ فقط', oldKnownSub: 'في الأصناف تحت «أصنافنا» – بلمسة إلى القائمة', oldDone: 'تم حفظ {n} صنفاً – في الأصناف تحت «أصنافنا»',
    gestureTip: 'نصيحة: اسحب جانباً للحذف · اضغط مطولاً واسحب لنقله إلى متجر آخر',
    deleted: 'تم حذف «{name}»', undo: 'تراجع', dropHere: 'أفلته هنا', movedTo: 'نُقل إلى: {name}',
    fx: 'الصوت والاهتزاز', fxSub: 'عند اللمس ووضع علامة', saved: 'تم الحفظ',
    aiInfo: 'يقرأ الذكاء الاصطناعي الوصفات من الروابط، ويترجم بين العربية والألمانية، ويصنّف الأصناف الجديدة. يوجد مفتاح محفوظ على الخادم.',
    aiServer: 'مفتاح الخادم', ownKey: 'مفتاح Gemini خاص (اختياري)', ownKeySet: 'مفتاح خاص',
    ownKeyHint: 'مطلوب فقط إذا لم يستجب الذكاء الاصطناعي. مجاني من', aiTest: 'اختبار', aiTesting: 'جارٍ اختبار الذكاء الاصطناعي …', aiWorks: 'الذكاء الاصطناعي يعمل',
    manageStores: 'إدارة المتاجر', nStores: '{n} متاجر', ai: 'المساعد الذكي', aiOk: 'جاهز', aiOff: 'غير مُعدّ', aiCheck: 'جارٍ الفحص …', aiErr: 'تعذّر الوصول',
    codeLabel: 'رمز المنزل', qrHint: 'يكفي أن يمسح الآخرون هذا الرمز بكاميرا الهاتف.', scan: 'مسح الرمز',
    scanTitle: 'مسح رمز QR', scanSub: 'وجّه الكاميرا نحو الرمز على الجهاز الآخر', scanWait: 'جارٍ تشغيل الكاميرا …', scanHint: 'جارٍ البحث عن رمز QR …',
    scanNoCode: 'هذا ليس رمز منزل', camErr: 'الكاميرا غير متاحة. اسمح بالوصول إليها – أو أدخل الرمز في الأسفل.',
    joinQ: 'الانضمام إلى هذا المنزل؟', joinInfo: 'بعدها سترى نفس القائمة ونفس الوصفات ونفس الخطة – مباشرةً.', joined: 'أهلاً بك في المنزل {code} 👋', alreadyIn: 'أنت في هذا المنزل بالفعل',
    mains: 'الأطباق الرئيسية', extras: 'إضافات', extrasHint: 'أضف سلطة أو حلوى أو شوربة أو فطوراً:', removeCourse: 'إزالة', otherRecipes: 'وصفات أخرى',
    noneOfCourse: 'لا توجد وصفات في «{c}» بعد – اختر غيرها أو أضف وصفة.',
    c_main: 'طبق رئيسي', c_salad: 'سلطة', c_dessert: 'حلوى', c_soup: 'شوربة', c_breakfast: 'فطور',
    bulk: 'عدة روابط', bulkSub: 'وصفات كثيرة دفعة واحدة – الصق الروابط كل رابط في سطر', bulkPh: 'https://…\nhttps://…\nhttps://…',
    bulkGo: 'قراءة الكل', bulkNone: 'لم يتم العثور على روابط', bulkRun: 'تمت قراءة {n} من {all} …', bulkDone: 'تم – حُفظت {n} وصفات', bulkShow: 'عرض الوصفات', bulkSkip: 'موجودة مسبقاً',
    sort: 'ترتيب', sort_az: 'أ – ي', sort_new: 'الأحدث', sort_fast: 'الأسرع'
  }
};

let lang = localStorage.getItem('ut:lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : 'de');
export const getLang = () => lang;
export function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = S[lang].app;
}
export function setLang(l) { lang = l === 'ar' ? 'ar' : 'de'; localStorage.setItem('ut:lang', lang); applyLang(); }
export const t = (k, v) => (S[lang][k] ?? S.de[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => v?.[n] ?? '');
