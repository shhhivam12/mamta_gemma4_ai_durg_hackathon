"""
Mamta v2 — Your Digital Dai
Minimal Flask server. All AI processing happens in-browser via Gemma 4.
No API keys needed. Zero cloud dependency.
"""
import os
from flask import Flask, render_template

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')


@app.route("/")
def index():
    return render_template("landing.html")

@app.route("/app")
def chat_app():
    return render_template("index.html")


@app.route("/health")
def health_check():
    return {"status": "healthy", "app": "Mamta", "version": "2.0.0"}


@app.after_request
def add_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response


@app.route("/log", methods=["POST"])
def log_error():
    from flask import request
    print(f"[CLIENT LOG] {request.json}")
    return {"status": "ok"}

if __name__ == "__main__":
    print()
    print("  Mamta v2 - Your Digital Dai")
    print("  " + "=" * 36)
    print("  Open: http://localhost:5000")
    print("  All AI runs locally in your browser")
    print("  " + "=" * 36)
    print()
    app.run(debug=True, port=5000, host="0.0.0.0")
