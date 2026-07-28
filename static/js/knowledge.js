/**
 * Mamta — Pregnancy Knowledge Base (Client-Side)
 * Comprehensive obstetric data: week milestones, triage matrix, nutrition,
 * medication rules, emergency contacts, daily checklists.
 * All content bilingual (Hindi + English).
 */

const MamtaKnowledge = (() => {

  // ── Week-by-Week Milestones ──────────────────────────────────────────
  const WEEK_MILESTONES = {
    4: {
      baby_hi: "शिशु की नसों का विकास शुरू हो गया है।",
      baby_en: "Neural tube closure initiated. Gestational sac forming.",
      size: "1 mm (खसखस के दाने जितना)",
      focus_hi: "फोलिक एसिड की गोली रोज़ लें (400-800 mcg)।",
      focus_en: "Folic acid supplementation (400-800 mcg daily) is critical.",
      tests_hi: "पेशाब का टेस्ट, खून की जांच, ब्लड ग्रुप।",
      trimester: 1
    },
    8: {
      baby_hi: "बच्चे का दिल धड़कने लगा है। हाथ-पैर बनने शुरू हो गए हैं।",
      baby_en: "Cardiac pulsations detectible. Limb buds differentiated.",
      size: "1.6 cm (राजमा के दाने जितना)",
      focus_hi: "उल्टी-मतली का ध्यान रखें। थायरॉइड की जांच करवाएं।",
      focus_en: "Management of morning sickness. Thyroid monitoring.",
      tests_hi: "डेटिंग अल्ट्रासाउंड, ब्लड शुगर टेस्ट।",
      trimester: 1
    },
    12: {
      baby_hi: "बच्चे के सभी अंग बन चुके हैं। गुर्दे काम करने लगे हैं।",
      baby_en: "Primary organ systems established. Renal function begins.",
      size: "5.4 cm (नींबू जितना)",
      focus_hi: "आयरन और कैल्शियम की गोली शुरू करें।",
      focus_en: "Initiate oral iron and calcium supplementation.",
      tests_hi: "NT स्कैन (11-13 हफ्ते में), ड्यूल मार्कर टेस्ट।",
      trimester: 1
    },
    16: {
      baby_hi: "बच्चे की हड्डियां मजबूत हो रही हैं। सुनने की क्षमता विकसित हो रही है।",
      baby_en: "Skeletal ossification advancing. Auditory structures developing.",
      size: "11.5 cm (एवोकाडो जितना)",
      focus_hi: "हीमोग्लोबिन जांच करवाएं। ब्लड प्रेशर नापें।",
      focus_en: "Hemoglobin surveillance. Blood pressure tracking.",
      tests_hi: "क्वाड्रूपल मार्कर टेस्ट, पेशाब की जांच।",
      trimester: 2
    },
    20: {
      baby_hi: "बच्चा हिलने-डुलने लगा है! आप उसकी हरकत महसूस कर सकती हैं।",
      baby_en: "Quickening — maternal perception of fetal movement begins.",
      size: "16.5 cm (केले जितना)",
      focus_hi: "एनॉमली स्कैन करवाएं (18-22 हफ्ते में)।",
      focus_en: "TIFFA / Level-2 Anomaly Scan at 18-22 weeks.",
      tests_hi: "TIFFA स्कैन (विस्तृत अल्ट्रासाउंड)।",
      trimester: 2
    },
    24: {
      baby_hi: "बच्चे के फेफड़ों का विकास शुरू हो गया है।",
      baby_en: "Alveolar duct formation in lungs initiated. Viability threshold.",
      size: "21 cm (भुट्टे जितना)",
      focus_hi: "सूजन और सिरदर्द पर ध्यान दें। शुगर टेस्ट करवाएं।",
      focus_en: "Monitor for preeclampsia symptoms. OGTT screening.",
      tests_hi: "शुगर टेस्ट (OGTT), टिटनेस का टीका।",
      trimester: 2
    },
    28: {
      baby_hi: "बच्चा तेज़ी से बढ़ रहा है। दिमाग का विकास हो रहा है।",
      baby_en: "Rapid brain development and fat deposition.",
      size: "25 cm (बैंगन जितना)",
      focus_hi: "रोज़ बच्चे की किक गिनें (कम से कम 10 बार 2 घंटे में)।",
      focus_en: "Initiate daily Cardiff kick count. Anti-D if Rh negative.",
      tests_hi: "हीमोग्लोबिन जांच, ग्रोथ स्कैन।",
      trimester: 3
    },
    32: {
      baby_hi: "बच्चा सांस लेने की प्रैक्टिस कर रहा है। आंखें खुल-बंद कर सकता है।",
      baby_en: "Breathing movements detectible. Pupillary reflex functional.",
      size: "29 cm (कद्दू जितना)",
      focus_hi: "बच्चे की ग्रोथ चेक करें। वज़न ठीक से बढ़ रहा है या नहीं।",
      focus_en: "Monitor for growth restriction. Weight velocity check.",
      tests_hi: "ग्रोथ और डॉपलर अल्ट्रासाउंड, NST।",
      trimester: 3
    },
    36: {
      baby_hi: "बच्चे का सिर नीचे आ गया है। फेफड़े लगभग तैयार हैं।",
      baby_en: "Fetal head engagement. Pulmonary maturity nearing completion.",
      size: "34 cm (तरबूज़ जितना)",
      focus_hi: "हर हफ्ते डॉक्टर से मिलें। डिलीवरी की तैयारी करें।",
      focus_en: "Weekly consultations. Birth preparedness planning.",
      tests_hi: "GBS स्क्रीनिंग, CTG मॉनिटरिंग।",
      trimester: 3
    },
    40: {
      baby_hi: "बच्चा पूरी तरह तैयार है! किसी भी समय आ सकता है।",
      baby_en: "Full term. Optimal maturity for extrauterine transition.",
      size: "39 cm (तरबूज़)",
      focus_hi: "प्रसव पीड़ा के लक्षण पहचानें। अस्पताल बैग तैयार रखें।",
      focus_en: "Watch for labor signs. Hospital bag ready.",
      tests_hi: "BPP और AFI जांच (अगर तारीख निकल गई हो)।",
      trimester: 3
    }
  };

  // Fill missing weeks by nearest milestone
  for (let w = 1; w <= 42; w++) {
    if (!WEEK_MILESTONES[w]) {
      const closest = Object.keys(WEEK_MILESTONES)
        .map(Number)
        .reduce((prev, curr) => Math.abs(curr - w) < Math.abs(prev - w) ? curr : prev);
      WEEK_MILESTONES[w] = { ...WEEK_MILESTONES[closest] };
    }
  }

  // ── Triage Matrix ─────────────────────────────────────────────────────
  const TRIAGE_MATRIX = {
    red_emergency: [
      {
        symptom_hi: "तेज़ खून बहना या भारी ब्लीडिंग",
        symptom_en: "Heavy vaginal bleeding or hemorrhage",
        action_hi: "तुरंत 108 एम्बुलेंस बुलाएं। बाईं करवट लेटें।",
        action_en: "Call 108 ambulance immediately. Lie on left side.",
        keywords: ["bleed", "blood", "khoon", "bled", "hemorrhage", "खून"]
      },
      {
        symptom_hi: "तेज़ सिरदर्द और आंखों के आगे अंधेरा",
        symptom_en: "Severe headache with visual disturbances",
        action_hi: "यह प्रीक्लेम्पसिया (ब्लड प्रेशर बढ़ना) का संकेत है। तुरंत अस्पताल जाएं।",
        action_en: "Signs of preeclampsia. Seek immediate hospital care.",
        keywords: ["headache", "vision", "blur", "sar dard", "sir dard", "सिरदर्द", "aankhon", "आंख"]
      },
      {
        symptom_hi: "बच्चे की हरकत 12 घंटे से नहीं हुई (28वें हफ्ते के बाद)",
        symptom_en: "No fetal movement for 12+ hours after week 28",
        action_hi: "तुरंत अस्पताल जाएं। यह गंभीर है।",
        action_en: "Seek emergency obstetric evaluation immediately.",
        keywords: ["no movement", "nahi hil", "harchal nahi", "kick nahi", "हरकत नहीं"]
      },
      {
        symptom_hi: "दौरे या बेहोशी",
        symptom_en: "Seizures or loss of consciousness",
        action_hi: "यह एक्लेम्पसिया हो सकता है। 108 कॉल करें। मुंह में कुछ न डालें।",
        action_en: "Eclampsia. Call 108. Do not put anything in mouth.",
        keywords: ["seizure", "behosh", "convulsion", "बेहोश", "दौरा"]
      },
      {
        symptom_hi: "37 हफ्ते से पहले पानी आना",
        symptom_en: "Premature rupture of membranes before 37 weeks",
        action_hi: "तुरंत अस्पताल जाएं। लेट कर जाएं।",
        action_en: "Immediate hospital transfer.",
        keywords: ["water", "paani", "pani aana", "jhilli", "पानी आ"]
      }
    ],
    yellow_warning: [
      {
        symptom_hi: "ब्लड प्रेशर 140/90 से ज़्यादा",
        symptom_en: "BP >= 140/90 on two readings",
        action_hi: "24 घंटे में डॉक्टर से मिलें। आराम करें।",
        action_en: "Schedule clinical consultation within 24 hours.",
        keywords: ["bp", "blood pressure", "140", "ब्लड प्रेशर"]
      },
      {
        symptom_hi: "चेहरे, हाथों या पैरों में अचानक सूजन",
        symptom_en: "Sudden swelling of face, hands, or feet",
        action_hi: "बाईं करवट लेटें। 24-48 घंटे में डॉक्टर से मिलें।",
        action_en: "Consult doctor within 24-48 hours.",
        keywords: ["swell", "sujan", "edema", "सूजन", "sooj"]
      },
      {
        symptom_hi: "100.4°F से ज़्यादा बुखार",
        symptom_en: "Fever exceeding 100.4°F with chills",
        action_hi: "24 घंटे में डॉक्टर को दिखाएं। पानी खूब पिएं।",
        action_en: "Medical evaluation within 24 hours.",
        keywords: ["fever", "bukhar", "temperature", "बुखार", "ठंड"]
      },
      {
        symptom_hi: "बच्चे की किक 2 घंटे में 10 से कम",
        symptom_en: "Fewer than 10 movements in 2 hours",
        action_hi: "पानी पिएं, बाईं करवट लेटें, फिर दोबारा गिनें। अगर फिर भी कम हो तो अस्पताल जाएं।",
        action_en: "Hydrate, lie on left side, recount. If still low, visit hospital.",
        keywords: ["kam kick", "less movement", "कम किक", "कम हरकत"]
      },
      {
        symptom_hi: "24 घंटे से लगातार उल्टी, कुछ भी नहीं रुक रहा",
        symptom_en: "Persistent vomiting for 24+ hours",
        action_hi: "डॉक्टर से मिलें। पानी की कमी हो सकती है।",
        action_en: "Consult doctor for antiemetic therapy and rehydration.",
        keywords: ["vomit", "ulti", "उल्टी", "nahi ruk"]
      }
    ],
    green_routine: [
      {
        symptom_hi: "हल्की सुबह की मतली (पहले 3 महीने में)",
        symptom_en: "Mild morning nausea in first trimester",
        action_hi: "थोड़ा-थोड़ा सूखा खाना खाएं। अदरक वाली चाय पिएं।",
        action_en: "Eat frequent small dry meals. Try ginger tea.",
        keywords: ["nausea", "matli", "morning sick", "मतली", "जी मिचलाना"]
      },
      {
        symptom_hi: "टखनों में हल्की सूजन जो आराम करने पर ठीक हो जाए",
        symptom_en: "Mild ankle swelling that resolves with elevation",
        action_hi: "यह सामान्य है। पैर ऊपर रखकर आराम करें।",
        action_en: "Normal. Elevate legs when resting.",
        keywords: ["ankle swell", "pair sujan", "पैर सूजन"]
      },
      {
        symptom_hi: "पेट में हल्का खिंचाव (ब्रेक्सटन हिक्स)",
        symptom_en: "Irregular, painless tightenings (Braxton Hicks)",
        action_hi: "यह सामान्य है। पानी पिएं और आराम करें।",
        action_en: "Normal. Hydrate and rest.",
        keywords: ["tightening", "khichav", "braxton", "खिंचाव"]
      }
    ]
  };

  // ── Medication Rules ───────────────────────────────────────────────────
  const MEDICATION_RULES = {
    iron_calcium: {
      rule_hi: "आयरन (IFA) और कैल्शियम की गोली में कम से कम 2 घंटे का अंतर रखें।",
      rule_en: "Maintain 2-3 hour gap between Iron-Folic Acid and Calcium supplements.",
      detail_hi: "कैल्शियम आयरन को सोखने से रोकता है (50% तक)। आयरन को नींबू पानी के साथ खाएं।",
      detail_en: "Calcium inhibits iron absorption by 50%. Take iron with lemon water (Vitamin C)."
    },
    thyroid: {
      rule_hi: "थायरॉइड की गोली सुबह खाली पेट लें, नाश्ते से 45 मिनट पहले।",
      rule_en: "Take thyroid tablet on empty stomach, 45 min before breakfast.",
      detail_hi: "खाना, आयरन, कैल्शियम सब थायरॉइड की दवा को कमज़ोर करते हैं।",
      detail_en: "Food, iron, calcium impair levothyroxine absorption."
    }
  };

  // ── Regional Nutrition ─────────────────────────────────────────────────
  const NUTRITION = {
    iron_rich: [
      {
        name_hi: "चुकंदर और अनार का रायता",
        name_en: "Beetroot and Pomegranate Raita",
        benefit_hi: "खून बढ़ाता है। विटामिन C अनार से आयरन को सोखने में मदद करता है।",
        cost: "₹15-25/दिन"
      },
      {
        name_hi: "गुड़ और तिल की चिक्की (गजक)",
        name_en: "Jaggery and Sesame Chikki",
        benefit_hi: "लोहे के बर्तन में बना गुड़ खून बढ़ाने में बहुत कारगर है।",
        cost: "₹10-15/दिन"
      },
      {
        name_hi: "पालक मूंग दाल + नींबू",
        name_en: "Spinach Moong Dal with Lemon",
        benefit_hi: "नींबू निचोड़ने से आयरन 3 गुना ज़्यादा सोखा जाता है।",
        cost: "₹20-30/दिन"
      },
      {
        name_hi: "अंकुरित काला चना चाट",
        name_en: "Sprouted Kala Chana Salad",
        benefit_hi: "अंकुरित करने से प्रोटीन और आयरन दोनों बढ़ जाते हैं।",
        cost: "₹15-20/दिन"
      }
    ],
    calcium_rich: [
      {
        name_hi: "रागी का दोसा या माल्ट",
        name_en: "Ragi (Finger Millet) Dosa or Malt",
        benefit_hi: "रागी में सबसे ज़्यादा कैल्शियम होता है। हड्डियां मजबूत करता है।",
        cost: "₹15-20/दिन"
      },
      {
        name_hi: "ताज़ा पनीर भुर्जी",
        name_en: "Fresh Paneer Bhurji",
        benefit_hi: "बच्चे की हड्डियों और मांसपेशियों के लिए ज़रूरी है।",
        cost: "₹30-40/दिन"
      },
      {
        name_hi: "छाछ / लस्सी",
        name_en: "Buttermilk / Lassi",
        benefit_hi: "कैल्शियम और प्रोबायोटिक दोनों मिलते हैं। पेट भी ठीक रहता है।",
        cost: "₹10-15/दिन"
      }
    ],
    energy: [
      {
        name_hi: "सत्तू का शरबत",
        name_en: "Sattu Beverage",
        benefit_hi: "तुरंत ऊर्जा मिलती है। मतली में भी राहत देता है।",
        cost: "₹10-15/दिन"
      },
      {
        name_hi: "मूंग दाल चीला + पुदीने की चटनी",
        name_en: "Moong Dal Cheela with Mint Chutney",
        benefit_hi: "हल्का और पौष्टिक। प्रोटीन और फोलेट से भरपूर।",
        cost: "₹15-25/दिन"
      },
      {
        name_hi: "भुने मखाने",
        name_en: "Roasted Makhana (Fox Nuts)",
        benefit_hi: "हल्का स्नैक। कैल्शियम और प्रोटीन दोनों मिलते हैं।",
        cost: "₹10-20/दिन"
      }
    ]
  };

  // ── Emergency Contacts ─────────────────────────────────────────────────
  const EMERGENCY_CONTACTS = [
    { name_hi: "एम्बुलेंस", name_en: "Ambulance", number: "108", desc_hi: "24/7 मुफ्त सेवा" },
    { name_hi: "महिला हेल्पलाइन", name_en: "Women Helpline", number: "181", desc_hi: "24/7 मदद" },
    { name_hi: "स्वास्थ्य सलाह", name_en: "Health Advice", number: "104", desc_hi: "डॉक्टर से बात करें" },
    { name_hi: "विष नियंत्रण", name_en: "Poison Control", number: "1800-116-117", desc_hi: "24/7 मुफ्त" }
  ];

  // ── Daily Checklists ───────────────────────────────────────────────────
  const DAILY_CHECKLISTS = {
    trimester_1: [
      { id: "t1_folic", text_hi: "फोलिक एसिड की गोली खाई?", text_en: "Took Folic Acid tablet?", icon: "💊" },
      { id: "t1_water", text_hi: "3 लीटर पानी पिया?", text_en: "Drank 3 liters of water?", icon: "💧" },
      { id: "t1_walk", text_hi: "20 मिनट टहलना हुआ?", text_en: "20 minute gentle walk?", icon: "🚶‍♀️" },
      { id: "t1_food", text_hi: "अच्छा खाना खाया?", text_en: "Ate nutritious food?", icon: "🍽️" },
      { id: "t1_rest", text_hi: "अच्छे से आराम किया?", text_en: "Got proper rest?", icon: "😴" }
    ],
    trimester_2: [
      { id: "t2_iron", text_hi: "आयरन (IFA) की गोली खाई?", text_en: "Took Iron (IFA) tablet?", icon: "💊" },
      { id: "t2_calcium", text_hi: "कैल्शियम की गोली खाई? (आयरन से 2 घंटे बाद)", text_en: "Took Calcium? (2hrs after iron)", icon: "💊" },
      { id: "t2_water", text_hi: "3 लीटर पानी पिया?", text_en: "Drank 3 liters of water?", icon: "💧" },
      { id: "t2_swelling", text_hi: "सूजन तो नहीं है?", text_en: "Checked for swelling?", icon: "👀" },
      { id: "t2_rest", text_hi: "बाईं करवट लेटकर 45 मिनट आराम किया?", text_en: "Left-side rest for 45 min?", icon: "🛏️" },
      { id: "t2_walk", text_hi: "हल्की सैर की?", text_en: "Gentle walk?", icon: "🚶‍♀️" }
    ],
    trimester_3: [
      { id: "t3_kick", text_hi: "बच्चे की किक गिनी? (2 घंटे में 10+)", text_en: "Counted baby kicks? (10+ in 2hrs)", icon: "👶" },
      { id: "t3_iron", text_hi: "आयरन की गोली खाई?", text_en: "Took Iron tablet?", icon: "💊" },
      { id: "t3_calcium", text_hi: "कैल्शियम की गोली खाई?", text_en: "Took Calcium tablet?", icon: "💊" },
      { id: "t3_bp", text_hi: "ब्लड प्रेशर चेक किया?", text_en: "Checked blood pressure?", icon: "❤️" },
      { id: "t3_bag", text_hi: "हॉस्पिटल बैग तैयार है?", text_en: "Hospital bag ready?", icon: "🎒" },
      { id: "t3_water", text_hi: "खूब पानी पिया?", text_en: "Drank enough water?", icon: "💧" }
    ]
  };

  // ── Dai Suggestion Prompts (Hindi) ─────────────────────────────────────
  const SUGGESTIONS = [
    { text_hi: "मुझे पेट में दर्द हो रहा है", text_en: "I have stomach pain", icon: "🤰" },
    { text_hi: "आज क्या खाना चाहिए?", text_en: "What should I eat today?", icon: "🍲" },
    { text_hi: "बच्चे की किक कैसे गिनें?", text_en: "How to count baby kicks?", icon: "👶" },
    { text_hi: "आयरन की गोली कब लेनी है?", text_en: "When to take iron tablet?", icon: "💊" },
    { text_hi: "मुझे चक्कर आ रहे हैं", text_en: "I am feeling dizzy", icon: "😵" },
    { text_hi: "डिलीवरी की तैयारी कैसे करें?", text_en: "How to prepare for delivery?", icon: "🏥" }
  ];

  // ── Danger Signs for Emergency Tab ─────────────────────────────────────
  const DANGER_SIGNS = [
    { sign_hi: "तेज़ खून बहना", sign_en: "Heavy bleeding", severity: "red" },
    { sign_hi: "तेज़ सिरदर्द + धुंधला दिखना", sign_en: "Severe headache + blurred vision", severity: "red" },
    { sign_hi: "बच्चे की हरकत बंद होना", sign_en: "No fetal movement", severity: "red" },
    { sign_hi: "दौरे या बेहोशी", sign_en: "Seizures or unconsciousness", severity: "red" },
    { sign_hi: "चेहरे/हाथों में सूजन", sign_en: "Swelling of face/hands", severity: "yellow" },
    { sign_hi: "तेज़ बुखार", sign_en: "High fever", severity: "yellow" },
    { sign_hi: "लगातार उल्टी (24 घंटे+)", sign_en: "Continuous vomiting (24hrs+)", severity: "yellow" },
    { sign_hi: "पेशाब में जलन/दर्द", sign_en: "Painful urination", severity: "yellow" }
  ];

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    WEEK_MILESTONES,
    TRIAGE_MATRIX,
    MEDICATION_RULES,
    NUTRITION,
    EMERGENCY_CONTACTS,
    DAILY_CHECKLISTS,
    SUGGESTIONS,
    DANGER_SIGNS,

    getWeekInfo(week) {
      week = Math.max(1, Math.min(42, week));
      return WEEK_MILESTONES[week];
    },

    getTrimester(week) {
      if (week <= 13) return 1;
      if (week <= 27) return 2;
      return 3;
    },

    getChecklist(trimester) {
      const key = `trimester_${trimester}`;
      return DAILY_CHECKLISTS[key] || DAILY_CHECKLISTS.trimester_2;
    },

    triageSymptom(text) {
      const lower = text.toLowerCase();
      for (const item of TRIAGE_MATRIX.red_emergency) {
        if (item.keywords.some(k => lower.includes(k))) {
          return { severity: "RED", ...item };
        }
      }
      for (const item of TRIAGE_MATRIX.yellow_warning) {
        if (item.keywords.some(k => lower.includes(k))) {
          return { severity: "YELLOW", ...item };
        }
      }
      for (const item of TRIAGE_MATRIX.green_routine) {
        if (item.keywords.some(k => lower.includes(k))) {
          return { severity: "GREEN", ...item };
        }
      }
      return null;
    }
  };
})();
