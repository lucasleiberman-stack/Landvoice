#!/usr/bin/env python3
"""Local dev server that tells the browser NOT to cache anything, so CSS/JS/image edits show up on a normal refresh.
Run:  python3 serve.py        (default port 8000; or  python3 serve.py 8001)"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Landvoice dev server: http://localhost:{port}/index.html  (no caching; Ctrl+C to stop)")
    ThreadingHTTPServer(("", port), NoCache).serve_forever()
