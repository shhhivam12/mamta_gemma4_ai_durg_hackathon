"""
Mamta - Native Gemma 4 Function Calling Tools & Clinical Implementations
Defines strict JSON schemas and execution handlers for obstetric telemetry,
pharmacological spacing rules, Cardiff kick surveillance, and clinical triage.
Zero emojis used; high clinical rigor.
"""
from google.genai import types
from data.session_store import (
    add_vital_signs, add_medication_log, add_kick_count_log,
    get_clinical_summary, update_profile
)
from data.pregnancy_knowledge import (
    WEEK_MILESTONES, TRIAGE_MATRIX, MEDICATION_RULES,
    REGIONAL_NUTRITION, EMERGENCY_CONTACTS
)

# Define native function schemas for Google GenAI SDK
TOOL_SCHEMAS = [
    types.Tool(function_declarations=[
        types.FunctionDeclaration(
            name="log_vital_signs",
            description="Log maternal vital signs including blood pressure, weight, blood glucose, and hemoglobin. Automatically computes Mean Arterial Pressure (MAP) and screens for preeclampsia and anemia risk.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "user_id": types.Schema(type=types.Type.STRING, description="Unique patient identifier"),
                    "bp_systolic": types.Schema(type=types.Type.NUMBER, description="Systolic blood pressure in mmHg"),
                    "bp_diastolic": types.Schema(type=types.Type.NUMBER, description="Diastolic blood pressure in mmHg"),
                    "weight_kg": types.Schema(type=types.Type.NUMBER, description="Maternal body weight in kilograms"),
                    "blood_glucose": types.Schema(type=types.Type.NUMBER, description="Blood glucose level in mg/dL"),
                    "hemoglobin": types.Schema(type=types.Type.NUMBER, description="Hemoglobin level in g/dL")
                },
                required=["user_id"]
            )
        ),
        types.FunctionDeclaration(
            name="log_medication_intake",
            description="Log ingestion of prenatal supplements or medications (Iron-Folic Acid, Calcium, Levothyroxine). Automatically checks pharmacological spacing rules to prevent absorption antagonism (e.g., Calcium taken within 2 hours of Iron).",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "user_id": types.Schema(type=types.Type.STRING, description="Unique patient identifier"),
                    "medication_name": types.Schema(type=types.Type.STRING, description="Name of medication or supplement (e.g., Iron-Folic Acid, Calcium, Thyroxine)"),
                    "dosage": types.Schema(type=types.Type.STRING, description="Dosage taken (e.g., 1 tablet, 500mg)"),
                    "taken": types.Schema(type=types.Type.BOOLEAN, description="Whether dose was successfully consumed")
                },
                required=["user_id", "medication_name"]
            )
        ),
        types.FunctionDeclaration(
            name="log_kick_count",
            description="Log standardized Cardiff Count-to-Ten fetal movement surveillance. Identifies reduced fetal movement velocity requiring clinical evaluation.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "user_id": types.Schema(type=types.Type.STRING, description="Unique patient identifier"),
                    "movement_count": types.Schema(type=types.Type.INTEGER, description="Number of distinct fetal movements perceived"),
                    "duration_minutes": types.Schema(type=types.Type.INTEGER, description="Duration of counting session in minutes")
                },
                required=["user_id", "movement_count", "duration_minutes"]
            )
        ),
        types.FunctionDeclaration(
            name="get_week_clinical_guidance",
            description="Retrieve obstetric week-by-week developmental milestones, clinical surveillance focus, and mandatory diagnostic screening schedules (e.g., NT Scan, TIFFA Anomaly Scan, OGTT).",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "week": types.Schema(type=types.Type.INTEGER, description="Gestational week (1 to 42)")
                },
                required=["week"]
            )
        ),
        types.FunctionDeclaration(
            name="get_regional_nutrition_plan",
            description="Retrieve regional Indian meal recommendations formulated for bioavailable iron absorption, calcium density, and protein enhancement.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "category": types.Schema(
                        type=types.Type.STRING,
                        description="Nutritional focus category: 'iron_rich', 'calcium_rich', or 'protein_energy'"
                    )
                },
                required=["category"]
            )
        ),
        types.FunctionDeclaration(
            name="check_symptom_triage",
            description="Evaluate reported maternal symptoms against the obstetric emergency triage matrix to categorize severity as RED (Emergency), YELLOW (Warning), or GREEN (Routine).",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "symptom_description": types.Schema(type=types.Type.STRING, description="Detailed description of patient symptoms")
                },
                required=["symptom_description"]
            )
        ),
        types.FunctionDeclaration(
            name="get_emergency_directory",
            description="Retrieve critical emergency medical contact numbers including National Ambulance (108) and Women Emergency Helpline (181).",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={},
            )
        )
    ])
]


# Execution handler functions
def execute_tool(name, args):
    if name == "log_vital_signs":
        user_id = args.get("user_id", "default_patient_01")
        vitals = {
            "bp_systolic": args.get("bp_systolic"),
            "bp_diastolic": args.get("bp_diastolic"),
            "weight_kg": args.get("weight_kg"),
            "blood_glucose": args.get("blood_glucose"),
            "hemoglobin": args.get("hemoglobin")
        }
        res = add_vital_signs(user_id, vitals)
        return {
            "status": "success",
            "message": "Vital signs logged successfully in patient telemetry store.",
            "data": res
        }

    elif name == "log_medication_intake":
        user_id = args.get("user_id", "default_patient_01")
        med_name = args.get("medication_name", "Supplement")
        dosage = args.get("dosage", "1 tablet")
        taken = args.get("taken", True)
        res = add_medication_log(user_id, med_name, dosage, taken)
        return {
            "status": "success",
            "message": "Medication logged in pharmacological tracking vault.",
            "data": res
        }

    elif name == "log_kick_count":
        user_id = args.get("user_id", "default_patient_01")
        count = args.get("movement_count", 0)
        duration = args.get("duration_minutes", 60)
        res = add_kick_count_log(user_id, count, duration)
        return {
            "status": "success",
            "message": "Fetal surveillance kick count session recorded.",
            "data": res
        }

    elif name == "get_week_clinical_guidance":
        week = args.get("week", 24)
        week = max(1, min(42, int(week)))
        milestone = WEEK_MILESTONES.get(week, WEEK_MILESTONES[24])
        return {
            "status": "success",
            "gestational_week": week,
            "clinical_guidance": milestone
        }

    elif name == "get_regional_nutrition_plan":
        cat = args.get("category", "iron_rich")
        mapping = {
            "iron_rich": "iron_rich_anemia_management",
            "calcium_rich": "calcium_rich_bone_health",
            "protein_energy": "protein_and_energy_density"
        }
        key = mapping.get(cat, "iron_rich_anemia_management")
        return {
            "status": "success",
            "category": cat,
            "recommendations": REGIONAL_NUTRITION.get(key, REGIONAL_NUTRITION["iron_rich_anemia_management"]),
            "pharmacological_rule": MEDICATION_RULES["iron_calcium_interaction"]
        }

    elif name == "check_symptom_triage":
        symptom = args.get("symptom_description", "").lower()
        matched_alerts = []
        
        for item in TRIAGE_MATRIX["red_emergency"]:
            if any(w in symptom for w in ["bleed", "blood", "headache", "vision", "blur", "seizure", "convul", "water", "no movement", "pain"]):
                matched_alerts.append({"severity": "RED", "details": item})
                break
                
        if not matched_alerts:
            for item in TRIAGE_MATRIX["yellow_warning"]:
                if any(w in symptom for w in ["swell", "edema", "fever", "chill", "vomit", "nausea", "less movement", "kick", "burn"]):
                    matched_alerts.append({"severity": "YELLOW", "details": item})
                    break
                    
        if not matched_alerts:
            matched_alerts.append({"severity": "GREEN", "details": TRIAGE_MATRIX["green_routine"][0]})
            
        return {
            "status": "success",
            "triage_assessment": matched_alerts
        }

    elif name == "get_emergency_directory":
        return {
            "status": "success",
            "emergency_services": EMERGENCY_CONTACTS
        }

    else:
        return {"error": f"Unknown tool: {name}"}


TOOL_FUNCTIONS = {
    "log_vital_signs": execute_tool,
    "log_medication_intake": execute_tool,
    "log_kick_count": execute_tool,
    "get_week_clinical_guidance": execute_tool,
    "get_regional_nutrition_plan": execute_tool,
    "check_symptom_triage": execute_tool,
    "get_emergency_directory": execute_tool
}
