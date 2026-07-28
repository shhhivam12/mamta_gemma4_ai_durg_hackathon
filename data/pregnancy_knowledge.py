"""
Mamta - Maternal Health Knowledge Base & Obstetric Clinical Protocols
Comprehensive week-by-week clinical milestones, obstetric screening schedules,
bioavailable nutrition data, and emergency triage protocols.
Zero emojis used; clean clinical and conversational terminology.
"""

# Obstetric week-by-week milestones and mandatory diagnostic screening schedule
WEEK_MILESTONES = {
    4: {
        "baby": "Embryonic neural tube closure initiated. Gestational sac forming.",
        "size": "1 mm (Poppy Seed scale)",
        "clinical_focus": "Folic acid supplementation (400-800 mcg daily) is critical to prevent neural tube defects.",
        "diagnostic_screenings": "Urine beta-hCG confirmation; Baseline complete blood count (CBC), blood grouping, and Rh typing."
    },
    8: {
        "baby": "Organogenesis underway. Cardiac pulsations detectible via ultrasound. Upper and lower limb buds differentiated.",
        "size": "1.6 cm (Kidney Bean scale)",
        "clinical_focus": "Management of hyperemesis gravidarum. Thyroid stimulating hormone (TSH) monitoring.",
        "diagnostic_screenings": "Dating and viability ultrasound scan; Fasting plasma glucose for early gestational diabetes screening."
    },
    12: {
        "baby": "Primary organ systems established. Renal excretion of urine into amniotic fluid begins.",
        "size": "5.4 cm (Lime scale)",
        "clinical_focus": "Transition from first to second trimester. Initiation of oral iron and calcium supplementation.",
        "diagnostic_screenings": "Nuchal Translucency (NT) ultrasound scan (Weeks 11-13); Dual marker serum screening (PAPP-A, free beta-hCG)."
    },
    16: {
        "baby": "Musculoskeletal ossification advancing. Auditory structures developing.",
        "size": "11.5 cm (Avocado scale)",
        "clinical_focus": "Hemoglobin surveillance for anemia. Maternal blood pressure tracking to establish baseline.",
        "diagnostic_screenings": "Quadruple marker serum screen (if indicated); Urine routine and microscopic examination for asymptomatic bacteriuria."
    },
    20: {
        "baby": "Fetal anatomy fully differentiated. Quickening (maternal perception of fetal movement) typically perceived.",
        "size": "16.5 cm (Banana scale)",
        "clinical_focus": "Mid-pregnancy structural evaluation. Assessment of cervical length and placental localization.",
        "diagnostic_screenings": "Targeted Imaging for Fetal Anomalies (TIFFA / Level-2 Anomaly Scan) at 18-22 weeks."
    },
    24: {
        "baby": "Alveolar duct formation in lungs initiated. Viability threshold approached in tertiary care settings.",
        "size": "21.0 cm (Ear of Corn scale)",
        "clinical_focus": "Surveillance for gestational hypertension and preeclampsia symptoms (swelling, headache).",
        "diagnostic_screenings": "75g Oral Glucose Tolerance Test (OGTT) for Gestational Diabetes Mellitus (GDM) screening; Tetanus Toxoid / Tdap vaccination."
    },
    28: {
        "baby": "Rapid pulmonary surfactant production. Rapid subcutaneous fat deposition and brain gyration.",
        "size": "25.0 cm (Eggplant scale)",
        "clinical_focus": "Initiation of standardized fetal movement counting (Cardiff Count-to-Ten protocol). Anti-D prophylaxis if Rh negative.",
        "diagnostic_screenings": "Repeat hemoglobin assessment; Obstetric growth ultrasound scan; Prophylactic Anti-D immunoglobulin injection if maternal Rh negative."
    },
    32: {
        "baby": "Rhythmic breathing movements detectible on ultrasound. Pupillary light reflex functional.",
        "size": "29.0 cm (Squash scale)",
        "clinical_focus": "Surveillance for intrauterine growth restriction (IUGR) via fundal height and weight velocity.",
        "diagnostic_screenings": "Third trimester obstetric growth and Doppler ultrasound scan; Non-Stress Test (NST) if obstetric risk factors present."
    },
    36: {
        "baby": "Fetal head engagement into maternal pelvis (lightening). Pulmonary maturity nearing completion.",
        "size": "34.0 cm (Honeydew scale)",
        "clinical_focus": "Weekly obstetric consultations. Birth preparedness and emergency transport planning to healthcare facility.",
        "diagnostic_screenings": "Group B Streptococcus (GBS) vaginal swab screening; Baseline cardiotocography (CTG) monitoring."
    },
    40: {
        "baby": "Full term gestation achieved. Optimal physical maturity for neonatal extrauterine transition.",
        "size": "39.0 cm (Watermelon scale)",
        "clinical_focus": "Surveillance for spontaneous onset of labor (regular painful uterine contractions, rupture of membranes).",
        "diagnostic_screenings": "Biophysical Profile (BPP) and amniotic fluid index (AFI) assessment if post-dates."
    }
}

# Populate missing weeks by interpolation from nearest clinical milestone
for week in range(1, 43):
    if week not in WEEK_MILESTONES:
        closest = min(WEEK_MILESTONES.keys(), key=lambda x: abs(x - week))
        WEEK_MILESTONES[week] = WEEK_MILESTONES[closest].copy()

# Clinical triage matrix for symptom surveillance
TRIAGE_MATRIX = {
    "red_emergency": [
        {
            "symptom": "Heavy vaginal bleeding or hemorrhage",
            "clinical_significance": "Placenta previa or placental abruption",
            "action": "Immediate emergency medical transfer to hospital. Do not attempt digital vaginal examination.",
            "protocol": "Call 108 Ambulance immediately. Place patient in left lateral recumbent position."
        },
        {
            "symptom": "Severe persistent headache with visual disturbances (blurring, flashing lights)",
            "clinical_significance": "Severe preeclampsia / impending eclampsia",
            "action": "Urgent obstetric emergency consultation. Require blood pressure assessment and magnesium sulfate readiness.",
            "protocol": "Call 108 Ambulance. Keep environment quiet and dark to minimize seizure risk."
        },
        {
            "symptom": "Epigastric or right upper quadrant abdominal pain",
            "clinical_significance": "HELLP syndrome or hepatic capsule distension in severe preeclampsia",
            "action": "Immediate transfer to tertiary healthcare center.",
            "protocol": "Call 108 Ambulance immediately."
        },
        {
            "symptom": "Absence of fetal movement for over 12 hours after week 28",
            "clinical_significance": "Severe fetal compromise or intrauterine hypoxia",
            "action": "Immediate emergency obstetric evaluation for cardiotocography (CTG) and Doppler scan.",
            "protocol": "Go to nearest hospital labor room without delay."
        },
        {
            "symptom": "Seizures, convulsions, or loss of consciousness",
            "clinical_significance": "Eclampsia",
            "action": "Medical emergency. Maintain airway and prevent aspiration.",
            "protocol": "Call 108 Ambulance immediately. Do not place objects in mouth."
        },
        {
            "symptom": "Sudden watery discharge or rupture of membranes prior to 37 weeks",
            "clinical_significance": "Preterm Premature Rupture of Membranes (PPROM) / cord prolapse risk",
            "action": "Immediate hospital transfer in recumbent position.",
            "protocol": "Go to hospital emergency room immediately."
        }
    ],
    "yellow_warning": [
        {
            "symptom": "Systolic BP >= 140 mmHg or Diastolic BP >= 90 mmHg on two readings",
            "clinical_significance": "Gestational hypertension or developing preeclampsia",
            "action": "Schedule clinical consultation within 24 hours. Monitor urine protein and Mean Arterial Pressure (MAP)."
        },
        {
            "symptom": "Sudden edema or swelling of face, hands, and lower extremities",
            "clinical_significance": "Fluid retention associated with preeclampsia or renal burden",
            "action": "Consult doctor within 24-48 hours. Record blood pressure and rest in left lateral position."
        },
        {
            "symptom": "Fever exceeding 100.4 F (38.0 C) with chills or dysuria",
            "clinical_significance": "Urinary tract infection (UTI) or systemic pyelonephritis",
            "action": "Medical evaluation within 24 hours for urine routine/culture and safe antibiotic initiation."
        },
        {
            "symptom": "Reduced fetal kick velocity (fewer than 10 movements in 2 hours during active period)",
            "clinical_significance": "Potential fetal placental insufficiency",
            "action": "Drink oral fluids, consume a light meal, lie on left side, and repeat 2-hour Cardiff kick count. If still < 10, visit hospital."
        },
        {
            "symptom": "Persistent nausea and vomiting precluding fluid retention for > 24 hours",
            "clinical_significance": "Dehydration, electrolyte imbalance, ketosis",
            "action": "Consult doctor for antiemetic therapy and potential intravenous rehydration."
        }
    ],
    "green_routine": [
        {
            "symptom": "Mild morning nausea without dehydration in first trimester",
            "clinical_significance": "Physiological hCG elevation",
            "action": "Consume frequent small dry meals, ginger extracts, and vitamin B6 supplementation as advised by physician."
        },
        {
            "symptom": "Mild physiological dependent edema in ankles resolving after elevation",
            "clinical_significance": "Normal uterine venous compression",
            "action": "Elevate lower extremities when resting. Avoid prolonged standing."
        },
        {
            "symptom": "Irregular, painless uterine tightenings lasting under 45 seconds (Braxton Hicks)",
            "clinical_significance": "Physiological myometrial preparation",
            "action": "Maintain oral hydration and rest in lateral recumbent position."
        }
    ]
}

# Medication spacing and clinical pharmacology rules
MEDICATION_RULES = {
    "iron_calcium_interaction": {
        "rule_name": "Iron and Calcium Absorption Antagonism",
        "clinical_rationale": "Calcium ions inhibit ferrous iron absorption across the duodenal mucosa by up to 50% when ingested simultaneously.",
        "spacing_protocol": "Maintain a minimum spacing interval of 2 to 3 hours between Iron-Folic Acid (IFA) tablets and Calcium supplementation or dairy intake.",
        "optimal_timing": "Take Iron tablet 1 hour before meal or 2 hours after meal with citrus (Vitamin C source). Take Calcium tablet after lunch or before bedtime."
    },
    "thyroid_spacing": {
        "rule_name": "Levothyroxine Fasting Requirement",
        "clinical_rationale": "Food, iron, calcium, and antacids bind levothyroxine and severely impair gastrointestinal absorption.",
        "spacing_protocol": "Take thyroid tablet early morning on an empty stomach with water, at least 45 to 60 minutes before breakfast and tea."
    }
}

# Regional Indian nutritional database with exact bioavailability enhancements
REGIONAL_NUTRITION = {
    "iron_rich_anemia_management": [
        {
            "item_name": "Beetroot and Pomegranate Raita with Roasted Cumin",
            "hindi_name": "Chukandar aur Anaar ka Raita",
            "nutritional_profile": "Bioavailable Iron, Vitamin C, Calcium, Probiotic Lactobacilli",
            "bioavailability_note": "Vitamin C from pomegranate enhances iron absorption from beetroot by converting ferric to ferrous iron.",
            "estimated_cost_inr": "15 - 25"
        },
        {
            "item_name": "Jaggery and Sesame Seed Chikki (Gajak)",
            "hindi_name": "Gud aur Til ki Chikki",
            "nutritional_profile": "High elemental Iron, Calcium, Zinc, Energy dense",
            "bioavailability_note": "Natural jaggery prepared in iron vessels provides significant elemental iron for hemoglobin synthesis.",
            "estimated_cost_inr": "10 - 15"
        },
        {
            "item_name": "Spinach and Moong Dal with Lemon Juice",
            "hindi_name": "Palak Moong Dal with Nimbu",
            "nutritional_profile": "Non-heme Iron, Plant Protein, Folic Acid",
            "bioavailability_note": "Squeezing fresh lemon juice (ascorbic acid) onto cooked spinach dal increases non-heme iron absorption threefold.",
            "estimated_cost_inr": "20 - 30"
        },
        {
            "item_name": "Sprouted Kala Chana (Black Chickpea) Salad",
            "hindi_name": "Ankurit Kala Chana Chaat",
            "nutritional_profile": "Protein, Iron, Dietary Fiber, B-Complex Vitamins",
            "bioavailability_note": "Sprouting reduces phytic acid content in chickpeas, significantly increasing mineral absorption.",
            "estimated_cost_inr": "15 - 20"
        }
    ],
    "calcium_rich_bone_health": [
        {
            "item_name": "Ragi (Finger Millet) Malt or Dosa",
            "hindi_name": "Ragi ka Dosa ya Malt",
            "nutritional_profile": "Highest grain Calcium content (344 mg per 100g), Dietary Fiber",
            "bioavailability_note": "Fermenting ragi batter for dosas neutralizes phytates and maximizes bioavailable calcium.",
            "estimated_cost_inr": "15 - 20"
        },
        {
            "item_name": "Fresh Paneer (Cottage Cheese) Bhurji",
            "hindi_name": "Fresh Paneer Bhurji",
            "nutritional_profile": "High Biological Value Protein, Calcium, Phosphorus",
            "bioavailability_note": "Provides complete amino acid profile essential for fetal skeletal and muscle tissue deposition.",
            "estimated_cost_inr": "30 - 40"
        }
    ],
    "protein_and_energy_density": [
        {
            "item_name": "Roasted Barley and Chickpea Sattu Beverage",
            "hindi_name": "Sattu ka Sharbat",
            "nutritional_profile": "Instant Complex Carbohydrates, Plant Protein, Cooling Electrolytes",
            "bioavailability_note": "Highly digestible protein beverage ideal for mitigating morning sickness and fatigue.",
            "estimated_cost_inr": "10 - 15"
        },
        {
            "item_name": "Moong Dal Cheela with Mint Chutney",
            "hindi_name": "Moong Dal Cheela",
            "nutritional_profile": "Easily digestible plant protein, Folate, Potassium",
            "bioavailability_note": "Mint and coriander chutney provides additional micronutrients and aids digestive transit.",
            "estimated_cost_inr": "15 - 25"
        }
    ]
}

# Emergency clinical contact directory
EMERGENCY_CONTACTS = {
    "national_ambulance": {"service": "National Emergency Ambulance", "number": "108", "availability": "24/7 Toll Free Across India"},
    "women_helpline": {"service": "Women Emergency & Distress Helpline", "number": "181", "availability": "24/7 Support"},
    "maternal_health": {"service": "Janani Suraksha Yojana & Health Helpline", "number": "104", "availability": "Medical Advice & Triage"},
    "aiims_poison_control": {"service": "National Poison & Drug Emergency", "number": "1800-116-117", "availability": "24/7 Clinical Reference"}
}

# Compatibility aliases
WARNING_SIGNS = TRIAGE_MATRIX
REGIONAL_FOODS = REGIONAL_NUTRITION
SUPPLEMENTS_GUIDE = MEDICATION_RULES

# Zero-emoji clinical daily checklist by trimester
DAILY_CHECKLIST = {
    "trimester_1": [
        {"item": "Take Folic Acid (400-800 mcg) tablet after meal", "hindi": "Folic acid ki goli lijiye", "category": "Supplement"},
        {"item": "Consume 3 liters of filtered water", "hindi": "3 liter paani pijiye", "category": "Hydration"},
        {"item": "Take 20-minute gentle evening walk", "hindi": "20 minute halki tehelna", "category": "Activity"},
        {"item": "Log morning nausea or dietary intake", "hindi": "Khaane ka hisaab likhein", "category": "Telemetry"}
    ],
    "trimester_2": [
        {"item": "Take Iron-Folic Acid (IFA) tablet 2 hours apart from calcium", "hindi": "Iron ki goli (calcium se 2 ghante door)", "category": "Supplement"},
        {"item": "Take Calcium tablet after lunch or before bedtime", "hindi": "Calcium ki goli lijiye", "category": "Supplement"},
        {"item": "Check for lower extremity edema or swelling", "hindi": "Pairon mein sujan check karein", "category": "Vitals"},
        {"item": "Practice left-lateral side resting for 45 minutes", "hindi": "Bayi karwat let kar aaram karein", "category": "Circulation"}
    ],
    "trimester_3": [
        {"item": "Perform 2-hour Cardiff Kick Count surveillance", "hindi": "Baby ki harchal (kick count) check karein", "category": "Fetal"},
        {"item": "Take IFA and Calcium tablets (spaced 2 hours apart)", "hindi": "Iron aur Calcium ki goli samay par lijiye", "category": "Supplement"},
        {"item": "Record blood pressure reading or check for headaches", "hindi": "Blood pressure check karein", "category": "Vitals"},
        {"item": "Verify emergency hospital transport readiness", "hindi": "Emergency number aur bag taiyaar rakhein", "category": "Safety"}
    ]
}

