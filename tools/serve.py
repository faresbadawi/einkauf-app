#!/usr/bin/env python3
"""Testserver: liefert die App aus und bietet /proxy?url=... zum Rezept-Import (ohne CORS-Probleme).
Nur öffentliche http(s)-Adressen werden geholt (kein Zugriff auf das lokale Netz)."""
import ipaddress, socket, sys, urllib.error, urllib.parse, urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

MAX = 3_000_000

def is_public(host):
    try:
        return all(ipaddress.ip_address(a[4][0]).is_global for a in socket.getaddrinfo(host, None))
    except Exception:
        return False

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

def fetch(url):
    opener = urllib.request.build_opener(NoRedirect)
    for _ in range(4):
        p = urllib.parse.urlsplit(url)
        if p.scheme not in ('http', 'https') or not p.hostname or not is_public(p.hostname):
            raise ValueError('Adresse nicht erlaubt')
        safe = urllib.parse.urlunsplit((p.scheme, p.netloc, urllib.parse.quote(p.path, safe='/%:@'), urllib.parse.quote(p.query, safe='=&%:@/?'), ''))
        req = urllib.request.Request(safe, headers={'User-Agent': 'Mozilla/5.0 (compatible; UnserTisch)', 'Accept-Language': 'de,en;q=0.8,ar;q=0.6'})
        try:
            with opener.open(req, timeout=15) as r:
                return r.read(MAX)
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308) and e.headers.get('Location'):
                url = urllib.parse.urljoin(url, e.headers['Location']); continue
            raise
    raise ValueError('Zu viele Weiterleitungen')

class H(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/proxy?'):
            q = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            try:
                body = fetch(q.get('url', [''])[0]); code = 200
            except Exception as e:
                body = str(e).encode(); code = 502
            self.send_response(code); self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache'); super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
    ThreadingHTTPServer(('0.0.0.0', port), H).serve_forever()
