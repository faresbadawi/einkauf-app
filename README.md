# Unser Tisch · سفرتنا

Gemeinsame Einkaufsliste und Rezepte für den ganzen Haushalt – auf Deutsch und Arabisch.

- **Einkaufsliste** mit Katalog (~340 Artikel mit Bild/Emoji, DE + AR), Freitext („2 kg Tomaten, Milch“), Mengen und Notizen
- **Märkte** (Arabischer Markt, Supermarkt, dm, Rossmann, eigene): jeden Artikel zuordnen, die App merkt sich die Wahl; Filter pro Markt, sortiert nach Gängen
- **Live-Sync**: alle Geräte mit demselben Haushaltscode sehen Änderungen sofort, auch offline nutzbar
- **Rezepte**: per Link oder eingefügtem Text mit KI (Gemini) einlesen, übersetzen (DE/AR), Portionen umrechnen, Zutaten auswählen und auf die Liste setzen
- **Wochenplan** mit 3 Gerichten und Zutaten der Woche

## Aufbau
- Statische PWA (`index.html`, `js/`, `css/`) – z. B. über GitHub Pages
- `worker/` – Cloudflare Worker: Live-Sync (Durable Object pro Haushalt) + KI. Deploy: `cd worker && npx wrangler deploy`, Schlüssel: `npx wrangler secret put GEMINI_API_KEY`
- Adresse des Workers steht in `js/config.js`

## Lokal testen
```
cd worker && npx wrangler dev --local --port 8787   # Worker
python3 tools/serve.py 8137                          # App
```
Im Browser einmalig `localStorage.setItem('ut:worker','http://localhost:8787/')` setzen.
