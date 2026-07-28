"""
Mamta - Clinical Session Store & Telemetry Engine
Manages longitudinal patient profiles, obstetric vitals (including automated
Mean Arterial Pressure calculation), medication adherence spacing intervals,
and Cardiff Count-to-Ten fetal surveillance logs.
Zero emojis used; structured JSON storage for serverless execution.
"""
import json
import os
import uuid
from datetime import datetime, date, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "store")
os.makedirs(DATA_DIR, exist_ok=True)


def _get_user_file(user_id):
    return os.path.join(DATA_DIR, f"{user_id}.json")


def _default_user_profile():
    now = datetime.now()
    return {
        "user_id": str(uuid.uuid4()),
        "created_at": now.isoformat(),
        "profile": {
            "name": "Priya Sharma",
            "age": 26,
            "lmp_date": (date.today() - timedelta(weeks=24)).isoformat(),
            "edd": (date.today() + timedelta(weeks=16)).isoformat(),
            "current_week": 24,
            "blood_group": "B Positive",
            "language": "hinglish",
            "high_risk_flag": False,
            "clinical_risk_factors": []
        },
        "vital_signs_log": [
            {"id": "v1", "timestamp": (now - timedelta(days=5)).isoformat(), "date": (date.today() - timedelta(days=5)).isoformat(), "bp_systolic": 118, "bp_diastolic": 76, "map_value": 90.0, "weight_kg": 60.5},
            {"id": "v2", "timestamp": (now - timedelta(days=4)).isoformat(), "date": (date.today() - timedelta(days=4)).isoformat(), "bp_systolic": 120, "bp_diastolic": 78, "map_value": 92.0, "weight_kg": 60.7},
            {"id": "v3", "timestamp": (now - timedelta(days=3)).isoformat(), "date": (date.today() - timedelta(days=3)).isoformat(), "bp_systolic": 119, "bp_diastolic": 75, "map_value": 89.6, "weight_kg": 60.9},
            {"id": "v4", "timestamp": (now - timedelta(days=2)).isoformat(), "date": (date.today() - timedelta(days=2)).isoformat(), "bp_systolic": 122, "bp_diastolic": 79, "map_value": 93.3, "weight_kg": 61.1},
            {"id": "v5", "timestamp": (now - timedelta(days=1)).isoformat(), "date": (date.today() - timedelta(days=1)).isoformat(), "bp_systolic": 121, "bp_diastolic": 80, "map_value": 93.6, "weight_kg": 61.3}
        ],
        "medication_log": [
            {"id": "m1", "medication": "Iron-Folic Acid (IFA)", "dosage": "1 tablet", "taken": True, "timestamp": (now - timedelta(days=1, hours=8)).isoformat(), "date": (date.today() - timedelta(days=1)).isoformat()},
            {"id": "m2", "medication": "Calcium Carbonate", "dosage": "1 tablet", "taken": True, "timestamp": (now - timedelta(days=1, hours=2)).isoformat(), "date": (date.today() - timedelta(days=1)).isoformat()}
        ],
        "kick_count_log": [
            {"id": "k1", "timestamp": (now - timedelta(days=3)).isoformat(), "date": (date.today() - timedelta(days=3)).isoformat(), "movement_count": 12, "duration_minutes": 60, "velocity_normal": True},
            {"id": "k2", "timestamp": (now - timedelta(days=2)).isoformat(), "date": (date.today() - timedelta(days=2)).isoformat(), "movement_count": 14, "duration_minutes": 60, "velocity_normal": True},
            {"id": "k3", "timestamp": (now - timedelta(days=1)).isoformat(), "date": (date.today() - timedelta(days=1)).isoformat(), "movement_count": 11, "duration_minutes": 60, "velocity_normal": True}
        ],
        "symptom_triage_log": [],
        "conversation_history": [],
        "clinical_alerts": [],
        "diagnostic_vault": []
    }


def get_or_create_user(user_id=None):
    if not user_id:
        user_id = "default_patient_01"

    filepath = _get_user_file(user_id)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return data
            except Exception:
                pass

    profile = _default_user_profile()
    profile["user_id"] = user_id
    save_user(user_id, profile)
    return profile


def save_user(user_id, data):
    filepath = _get_user_file(user_id)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def calculate_map(systolic, diastolic):
    """Calculate Mean Arterial Pressure (MAP) = (2 * diastolic + systolic) / 3."""
    if not systolic or not diastolic:
        return None
    try:
        return round((2 * float(diastolic) + float(systolic)) / 3.0, 1)
    except (ValueError, TypeError):
        return None


def add_vital_signs(user_id, vitals_dict):
    """Log obstetric vital signs and automatically compute MAP and clinical alerts."""
    data = get_or_create_user(user_id)
    
    systolic = vitals_dict.get("bp_systolic")
    diastolic = vitals_dict.get("bp_diastolic")
    map_val = calculate_map(systolic, diastolic)
    
    entry = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat(),
        "bp_systolic": systolic,
        "bp_diastolic": diastolic,
        "map_value": map_val,
        "weight_kg": vitals_dict.get("weight_kg"),
        "temperature_f": vitals_dict.get("temperature_f"),
        "blood_glucose_mg_dl": vitals_dict.get("blood_glucose"),
        "hemoglobin_g_dl": vitals_dict.get("hemoglobin")
    }
    
    data["vital_signs_log"].append(entry)
    
    # Automated Clinical Alerting based on obstetric thresholds
    alerts_generated = []
    if systolic and diastolic:
        if float(systolic) >= 140 or float(diastolic) >= 90 or (map_val and map_val >= 105):
            alert = {
                "id": str(uuid.uuid4())[:8],
                "severity": "RED",
                "category": "Obstetric Hypertension / Preeclampsia Risk",
                "message": f"Critical BP {systolic}/{diastolic} mmHg (MAP: {map_val} mmHg). Immediate blood pressure evaluation required.",
                "timestamp": datetime.now().isoformat()
            }
            data["clinical_alerts"].append(alert)
            alerts_generated.append(alert)
        elif float(systolic) >= 130 or float(diastolic) >= 85 or (map_val and map_val >= 98):
            alert = {
                "id": str(uuid.uuid4())[:8],
                "severity": "YELLOW",
                "category": "Elevated Arterial Pressure",
                "message": f"Elevated BP {systolic}/{diastolic} mmHg (MAP: {map_val} mmHg). Recommend 24-hour surveillance and rest in left lateral position.",
                "timestamp": datetime.now().isoformat()
            }
            data["clinical_alerts"].append(alert)
            alerts_generated.append(alert)

    if vitals_dict.get("hemoglobin") and float(vitals_dict.get("hemoglobin")) < 10.0:
        alert = {
            "id": str(uuid.uuid4())[:8],
            "severity": "YELLOW" if float(vitals_dict["hemoglobin"]) >= 7.0 else "RED",
            "category": "Anemia Triage",
            "message": f"Hemoglobin level {vitals_dict['hemoglobin']} g/dL indicates clinical anemia. Require IFA supplementation evaluation.",
            "timestamp": datetime.now().isoformat()
        }
        data["clinical_alerts"].append(alert)
        alerts_generated.append(alert)

    save_user(user_id, data)
    return {"entry": entry, "alerts": alerts_generated}


def add_medication_log(user_id, medication_name, dosage, taken=True):
    """Log medication intake and check for Iron-Calcium spacing conflicts."""
    data = get_or_create_user(user_id)
    now = datetime.now()
    
    entry = {
        "id": str(uuid.uuid4())[:8],
        "medication": medication_name,
        "dosage": dosage,
        "taken": taken,
        "timestamp": now.isoformat(),
        "date": date.today().isoformat()
    }
    
    # Check spacing interval with recent medication logs
    spacing_warning = None
    med_lower = medication_name.lower()
    is_calcium = "calcium" in med_lower
    is_iron = "iron" in med_lower or "ifa" in med_lower or "folic" in med_lower
    
    if is_calcium or is_iron:
        for prev_log in reversed(data.get("medication_log", [])):
            try:
                prev_time = datetime.fromisoformat(prev_log["timestamp"])
                time_diff_hours = (now - prev_time).total_seconds() / 3600.0
                if time_diff_hours < 2.0:
                    prev_med = prev_log["medication"].lower()
                    if (is_calcium and ("iron" in prev_med or "ifa" in prev_med)) or \
                       (is_iron and "calcium" in prev_med):
                        spacing_warning = {
                            "warning_type": "Pharmacological Spacing Conflict",
                            "message": f"Alert: {medication_name} logged within {round(time_diff_hours * 60)} minutes of {prev_log['medication']}. Calcium inhibits iron absorption by up to 50%. Recommend spacing doses by at least 2 hours.",
                            "timestamp": now.isoformat()
                        }
                        break
            except Exception:
                continue

    data["medication_log"].append(entry)
    save_user(user_id, data)
    return {"entry": entry, "spacing_warning": spacing_warning}


def add_kick_count_log(user_id, movement_count, duration_minutes):
    """Log Cardiff Count-to-Ten fetal movement surveillance."""
    data = get_or_create_user(user_id)
    
    velocity_normal = movement_count >= 10 or (duration_minutes > 0 and (movement_count / duration_minutes) >= (10.0 / 120.0))
    entry = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat(),
        "movement_count": movement_count,
        "duration_minutes": duration_minutes,
        "velocity_normal": velocity_normal
    }
    
    data["kick_count_log"].append(entry)
    
    alert_generated = None
    if not velocity_normal:
        alert_generated = {
            "id": str(uuid.uuid4())[:8],
            "severity": "YELLOW",
            "category": "Reduced Fetal Velocity",
            "message": f"Fetal movement count ({movement_count} movements in {duration_minutes} mins) falls below Cardiff threshold (10 movements in 2 hours). Recommend left lateral rest and re-evaluation.",
            "timestamp": datetime.now().isoformat()
        }
        data["clinical_alerts"].append(alert_generated)
        
    save_user(user_id, data)
    return {"entry": entry, "alert": alert_generated}


def add_conversation(user_id, role, content):
    data = get_or_create_user(user_id)
    entry = {
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    data["conversation_history"].append(entry)
    if len(data["conversation_history"]) > 60:
        data["conversation_history"] = data["conversation_history"][-60:]
    save_user(user_id, data)
    return entry


def get_clinical_summary(user_id, days=30):
    data = get_or_create_user(user_id)
    cutoff = datetime.now() - timedelta(days=days)
    
    recent_vitals = [v for v in data.get("vital_signs_log", []) if datetime.fromisoformat(v["timestamp"]) > cutoff]
    recent_meds = [m for m in data.get("medication_log", []) if datetime.fromisoformat(m["timestamp"]) > cutoff]
    recent_kicks = [k for k in data.get("kick_count_log", []) if datetime.fromisoformat(k["timestamp"]) > cutoff]
    
    return {
        "profile": data.get("profile", {}),
        "period_days": days,
        "vitals_count": len(recent_vitals),
        "recent_vitals": recent_vitals[-10:],
        "medication_doses_logged": len(recent_meds),
        "recent_medications": recent_meds[-10:],
        "kick_surveillance_sessions": len(recent_kicks),
        "recent_kick_logs": recent_kicks[-10:],
        "active_clinical_alerts": data.get("clinical_alerts", [])[-5:]
    }


def update_profile(user_id, profile_updates):
    data = get_or_create_user(user_id)
    data["profile"].update(profile_updates)
    
    if data["profile"].get("lmp_date"):
        try:
            lmp = date.fromisoformat(data["profile"]["lmp_date"][:10])
            weeks = (date.today() - lmp).days // 7
            data["profile"]["current_week"] = min(max(weeks, 1), 42)
            edd = lmp + timedelta(days=280)
            data["profile"]["edd"] = edd.isoformat()
        except Exception:
            pass
            
    save_user(user_id, data)
    return data["profile"]


# Compatibility aliases for API routes and frontend hooks
get_health_summary = get_clinical_summary
add_supplement_log = add_medication_log
add_kick_count = add_kick_count_log

def add_mood_log(user_id, mood, notes=""):
    """Log emotional wellbeing check-in."""
    data = get_or_create_user(user_id)
    entry = {
        "id": str(uuid.uuid4())[:8],
        "mood": mood,
        "notes": notes,
        "timestamp": datetime.now().isoformat(),
        "date": date.today().isoformat()
    }
    if "mood_entries" not in data:
        data["mood_entries"] = []
    data["mood_entries"].append(entry)
    save_user(user_id, data)
    return entry

