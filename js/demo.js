// Beispieldaten zum Ausprobieren (alles mit demo:true markiert, in "Mehr" wieder entfernbar)
const R = (id, title, emoji, category, time, servings, ingredients, steps, fav = false) =>
  ({ id: 'demo-' + id, demo: true, title, emoji, category, time, servings, ingredients, steps, fav, t: 0 });

export const demoRecipes = [
  R('linsen', 'Linsensuppe mit Fladenbrot', '🍲', 'Suppen', 30, 4,
    ['250 g rote Linsen', '1 Zwiebel', '2 Zehen Knoblauch', '2 Möhren', '1 EL Tomatenmark', '1 TL Kreuzkümmel', '1 Zitrone', '1 Fladenbrot'],
    '1. Zwiebel, Knoblauch und Möhren würfeln und in Olivenöl anbraten.\n2. Tomatenmark und Kreuzkümmel kurz mitrösten.\n3. Linsen und 1 Liter Wasser dazugeben, 20 Minuten köcheln lassen.\n4. Pürieren, mit Salz, Pfeffer und Zitronensaft abschmecken.\n5. Mit warmem Fladenbrot servieren.', true),
  R('mandi', 'Hähnchen-Mandi', '🍗', 'Hauptgerichte', 60, 4,
    ['1 Hähnchen (ganz)', '300 g Basmatireis', '2 Zwiebeln', '1 TL Kurkuma', '2 TL Mandi-Gewürz', '50 g Rosinen', '50 g Mandeln', '3 EL Olivenöl'],
    '1. Hähnchen mit Gewürzen und Öl einreiben, 1 Stunde ziehen lassen.\n2. Im Ofen bei 200 °C ca. 50 Minuten garen.\n3. Reis mit Kurkuma und Zwiebeln kochen.\n4. Rosinen und Mandeln anrösten, über den Reis geben und mit dem Hähnchen servieren.', true),
  R('zucchini', 'Gefüllte Zucchini', '🥒', 'Hauptgerichte', 45, 4,
    ['4 Zucchini', '300 g Hackfleisch', '1 Zwiebel', '200 g Mozzarella', '400 g Tomaten (Dose)', '1 TL Oregano'],
    '1. Zucchini halbieren und aushöhlen.\n2. Hack mit Zwiebel anbraten, Fruchtfleisch dazugeben.\n3. Füllung in die Zucchini geben, Tomaten darüber, Mozzarella drauf.\n4. 25 Minuten bei 190 °C überbacken.'),
  R('fattoush', 'Fattoush-Salat', '🥗', 'Salate', 15, 4,
    ['1 Römersalat', '3 Tomaten', '2 Gurken', '1 Bund Petersilie', '1 Fladenbrot', '2 EL Sumach', '1 Zitrone', '4 EL Olivenöl'],
    '1. Gemüse in mundgerechte Stücke schneiden.\n2. Fladenbrot im Ofen knusprig rösten und brechen.\n3. Zitrone, Öl, Sumach und Salz zum Dressing verrühren.\n4. Alles vermengen und sofort servieren.', true),
  R('pasta', 'Spaghetti Pomodoro', '🍝', 'Hauptgerichte', 25, 2,
    ['250 g Spaghetti', '500 g Tomaten', '3 Zehen Knoblauch', '1 Bund Basilikum', '3 EL Olivenöl', '50 g Parmesan'],
    '1. Spaghetti in Salzwasser kochen.\n2. Knoblauch in Öl anschwitzen, Tomaten dazu und 15 Minuten einkochen.\n3. Mit Basilikum würzen, Nudeln untermischen, Parmesan darüber.'),
  R('shakshuka', 'Shakshuka', '🍳', 'Frühstück', 25, 2,
    ['4 Eier', '400 g Tomaten (Dose)', '1 Paprika', '1 Zwiebel', '2 Zehen Knoblauch', '1 TL Paprikapulver', '1 TL Kreuzkümmel'],
    '1. Zwiebel, Paprika und Knoblauch anbraten.\n2. Gewürze und Tomaten dazu, 10 Minuten köcheln lassen.\n3. Mulden formen, Eier hineingleiten lassen und stocken lassen.\n4. Mit Brot servieren.', true),
  R('pfannkuchen', 'Pfannkuchen', '🥞', 'Frühstück', 20, 3,
    ['250 g Mehl', '400 ml Milch', '3 Eier', '1 Prise Salz', '2 EL Butter'],
    '1. Mehl, Milch, Eier und Salz glatt verrühren, 10 Minuten quellen lassen.\n2. In Butter portionsweise goldbraun ausbacken.\n3. Mit Obst, Honig oder Schokocreme servieren.'),
  R('reispudding', 'Milchreis mit Zimt', '🍚', 'Desserts', 35, 4,
    ['200 g Milchreis', '800 ml Milch', '3 EL Zucker', '1 TL Zimt', '1 Prise Salz'],
    '1. Milch mit Zucker und Salz aufkochen, Reis einrühren.\n2. Bei kleiner Hitze 30 Minuten quellen lassen, dabei oft rühren.\n3. Mit Zimt und Zucker servieren.'),
  R('hummus', 'Hummus', '🧆', 'Salate', 10, 4,
    ['400 g Kichererbsen (Dose)', '3 EL Tahin', '1 Zitrone', '1 Zehe Knoblauch', '4 EL Olivenöl'],
    '1. Alle Zutaten mit etwas Eiswasser fein pürieren.\n2. Mit Salz abschmecken, mit Olivenöl beträufeln.', true),
  R('lasagne', 'Gemüse-Lasagne', '🍕', 'Hauptgerichte', 60, 4,
    ['250 g Lasagneplatten', '2 Zucchini', '1 Aubergine', '500 ml Tomatensauce', '250 g Ricotta', '150 g Mozzarella'],
    '1. Gemüse in Scheiben schneiden und anbraten.\n2. Schichtweise Sauce, Platten, Gemüse und Ricotta in eine Form geben.\n3. Mit Mozzarella bestreuen, 35 Minuten bei 190 °C backen.')
];

export const demoItems = [
  ['Tomaten', '500 g'], ['Paprika', '3'], ['Zucchini', '2'], ['Zwiebeln', '3'], ['Hähnchen', '1,2 kg'],
  ['Halloumi', '250 g'], ['Milch', '1 l'], ['Eier', '10'], ['Fladenbrot', '2'], ['Spülmittel', '']
].map(([name, qty], i) => ({ id: 'demo-i' + i, demo: true, name, qty, done: i === 3, cat: null, t: i }));
