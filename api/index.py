"""
Mamta (ममता) — The Digital Dai / Maternal Companion
Flask application — main entry point.
"""
import os
import json
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'static'))
app.secret_key = os.environ.get("FLASK_SECRET", "mamta-secret-key-2026")

# Import after app creation to avoid circular imports
from agents.orchestrator import chat_with_mamta, get_diet_plan
from data.session_store import (
    get_or_create_user, update_profile, get_health_summary,
    add_supplement_log, add_vital_signs, add_kick_count, add_mood_log
)
from data.pregnancy_knowledge import (
    WEEK_MILESTONES, DAILY_CHECKLIST, EMERGENCY_CONTACTS,
    SUPPLEMENTS_GUIDE, REGIONAL_FOODS, WARNING_SIGNS
)


# ── Page Routes ──────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("landing.html")

@app.route("/app")
def chat_app():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    """Health tracking dashboard."""
    return render_template("dashboard.html")


@app.route("/clinic")
def clinic():
    """Clinic / ASHA worker portal."""
    return render_template("clinic.html")


# ── API Routes ───────────────────────────────────────────────────────

@app.route("/api/chat", methods=["POST"])
def api_chat():
    """Main chat endpoint — multi-agent orchestration."""
    data = request.get_json()
    message = data.get("message", "").strip()
    user_id = data.get("user_id", "default_user")
    image_data = data.get("image", None)

    if not message and not image_data:
        return jsonify({"error": "Message or image required"}), 400

    if not message and image_data:
        message = "Please analyze this image for me."

    result = chat_with_mamta(user_id, message, image_data)
    return jsonify(result)


@app.route("/api/profile", methods=["POST"])
def api_update_profile():
    """Update user profile."""
    data = request.get_json()
    user_id = data.get("user_id", "default_user")
    profile_data = data.get("profile", {})
    result = update_profile(user_id, profile_data)
    return jsonify({"status": "updated", "profile": result})


@app.route("/api/profile", methods=["GET"])
def api_get_profile():
    """Get user profile and data."""
    user_id = request.args.get("user_id", "default_user")
    user_data = get_or_create_user(user_id)
    return jsonify(user_data)


@app.route("/api/health-summary", methods=["GET"])
def api_health_summary():
    """Get health summary for dashboard."""
    user_id = request.args.get("user_id", "default_user")
    days = int(request.args.get("days", 30))
    summary = get_health_summary(user_id, days)
    return jsonify(summary)


@app.route("/api/week-info", methods=["GET"])
def api_week_info():
    """Get week-specific pregnancy info."""
    week = int(request.args.get("week", 20))
    week = max(1, min(42, week))
    milestone = WEEK_MILESTONES.get(week, WEEK_MILESTONES[40])

    trimester = 1 if week <= 13 else (2 if week <= 27 else 3)
    checklist_key = f"trimester_{trimester}"
    checklist = DAILY_CHECKLIST.get(checklist_key, [])

    return jsonify({
        "week": week,
        "trimester": trimester,
        "milestone": milestone,
        "checklist": checklist,
    })


@app.route("/api/diet-plan", methods=["POST"])
def api_diet_plan():
    """Get AI-generated diet plan."""
    data = request.get_json()
    user_id = data.get("user_id", "default_user")
    trimester = data.get("trimester", 2)
    condition = data.get("condition", "normal")
    result = get_diet_plan(user_id, trimester, condition)
    return jsonify(result)


@app.route("/api/emergency", methods=["GET"])
def api_emergency():
    """Get emergency contacts."""
    return jsonify(EMERGENCY_CONTACTS)


@app.route("/api/supplements", methods=["GET"])
def api_supplements():
    """Get supplement guide."""
    return jsonify(SUPPLEMENTS_GUIDE)


@app.route("/api/foods", methods=["GET"])
def api_foods():
    """Get regional food recommendations."""
    return jsonify(REGIONAL_FOODS)


@app.route("/api/quick-log", methods=["POST"])
def api_quick_log():
    """Quick log endpoint for supplements, vitals, kicks, mood."""
    data = request.get_json()
    user_id = data.get("user_id", "default_user")
    log_type = data.get("type")

    if log_type == "supplement":
        result = add_supplement_log(user_id, data.get("name", "supplement"), data.get("taken", True))
    elif log_type == "vitals":
        result = add_vital_signs(user_id, data.get("vitals", {}))
    elif log_type == "kicks":
        result = add_kick_count(user_id, data.get("count", 0), data.get("duration", 0))
    elif log_type == "mood":
        result = add_mood_log(user_id, data.get("mood", "okay"), data.get("notes", ""))
    else:
        return jsonify({"error": "Invalid log type"}), 400

    return jsonify({"status": "logged", "entry": result})


# ── Health check ─────────────────────────────────────────────────────

@app.route("/api/health")
def health_check():
    return jsonify({"status": "healthy", "app": "Mamta", "version": "1.0.0"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
