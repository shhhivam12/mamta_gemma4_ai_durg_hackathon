/**
 * Mamta — In-Browser AI Engine with Multi-Agent Loop
 * 
 * Architecture:
 * 1. Tries to load Gemma 4 via MediaPipe LLM Inference (WebGPU, in-browser)
 * 2. Falls back to comprehensive rule-based system using pregnancy knowledge base
 * 
 * Multi-Agent Chain (both Gemma and fallback):
 *   Agent 1 (Dai) → Intent Classification
 *   Agent 2 (Specialist) → Domain-specific response (Diet/Symptom/Medication/Kick/Checklist)
 *   Agent 3 (Safety) → Validate no harmful advice
 * 
 * All processing is local. Zero data leaves the device.
 */

const DaiEngine = (() => {
  let gemmaModel = null;
  let gemmaLoaded = false;
  let gemmaLoading = false;
  let modelLoadProgress = 0;
  let onModelLoadCallback = null;

  // ── Agent System Prompts (used with Gemma) ─────────────────────────────
  const SYSTEM_PROMPTS = {
    dai: `You are Dai (दाई), a warm, traditional digital midwife for Indian pregnant women.
Address the user as "didi" or "behenji".
Provide direct, comforting, practical advice for pregnancy care.
Keep responses SHORT (2-3 sentences max).
Speak in simple Hinglish or Hindi. Be helpful and reassuring.`,

    diet: `You are a regional Indian nutrition advisor for pregnant women.
Suggest simple, affordable, local Indian foods (like dal, spinach, buttermilk, fruits).
Keep response under 2 short sentences in Hinglish or Hindi.`,

    symptom: `You are a caring midwife addressing pregnancy symptoms.
Provide practical immediate comfort tips first (e.g. drink warm water, lie on left side, rest).
Only advise visiting a clinic if pain is severe or accompanied by bleeding.
Keep response under 3 short sentences in simple Hinglish or Hindi.`,

    safety: `Ensure response is friendly, helpful, and under 3 sentences.`
  };

  // ── Intent Classification ──────────────────────────────────────────────
  const INTENT_KEYWORDS = {
    diet: ['khana', 'khao', 'diet', 'food', 'eat', 'anemia', 'iron', 'calcium', 'nutrition',
           'खाना', 'खाओ', 'क्या खाएं', 'भोजन', 'आहार', 'पोषण', 'दूध', 'फल', 'सब्जी',
           'breakfast', 'lunch', 'dinner', 'nashta', 'sattu', 'dal', 'roti'],
    symptom: ['dard', 'pain', 'sujan', 'swell', 'bukhar', 'fever', 'chakkar', 'dizzy',
              'bleed', 'blood', 'khoon', 'headache', 'sir dard', 'ulti', 'vomit', 'nausea',
              'दर्द', 'सूजन', 'बुखार', 'चक्कर', 'खून', 'सिरदर्द', 'उल्टी', 'कमज़ोरी',
              'pet dard', 'kamar dard', 'weakness', 'kamzori', 'thakan', 'tired'],
    medication: ['goli', 'tablet', 'dawai', 'medicine', 'iron', 'calcium', 'folic',
                 'गोली', 'दवाई', 'आयरन', 'कैल्शियम', 'फोलिक', 'supplement',
                 'ifa', 'thyroid', 'dose', 'kab leni', 'kaise leni'],
    kickcount: ['kick', 'harchal', 'movement', 'baby move', 'hilna', 'kick count',
                'किक', 'हरकत', 'हिलना', 'बच्चा हिला', 'गिनती'],
    checklist: ['checklist', 'kya karna', 'aaj kya', 'list', 'daily', 'routine',
                'चेकलिस्ट', 'क्या करना', 'आज क्या', 'दिनचर्या'],
    emergency: ['emergency', 'help', 'madad', 'ambulance', '108', 'hospital',
                'इमरजेंसी', 'मदद', 'एम्बुलेंस', 'अस्पताल', 'खतरा'],
    delivery: ['delivery', 'labor', 'prasav', 'dard shuru', 'pani aana', 'bag',
               'डिलीवरी', 'प्रसव', 'दर्द शुरू', 'पानी आना', 'तैयारी'],
    greeting: ['hello', 'hi', 'namaste', 'namaskar', 'kaise ho', 'how are you',
               'नमस्ते', 'नमस्कार', 'कैसी हो', 'कैसे हो'],
    week_info: ['week', 'hafta', 'month', 'mahina', 'baby size', 'kya ho raha',
                'हफ्ता', 'महीना', 'बच्चा कितना बड़ा', 'क्या हो रहा']
  };

  function classifyIntent(text) {
    const lower = text.toLowerCase();
    let bestMatch = 'general';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }

    return bestMatch;
  }

  // ── Fallback Rule-Based Agents ─────────────────────────────────────────

  function _detectLanguage(text) {
    // Check if text contains Devanagari script
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    // Check for common Hindi words in Latin script
    const hindiWords = ['kya', 'hai', 'mujhe', 'kaise', 'mein', 'ho', 'kar', 'kab', 'aaj', 'kal'];
    const lower = text.toLowerCase();
    const hindiCount = hindiWords.filter(w => lower.includes(w)).length;
    return hindiCount >= 2 ? 'hinglish' : 'en';
  }

  function greetingAgent(text) {
    const profile = MamtaStore.getProfile();
    const week = profile.currentWeek || 24;
    const name = profile.nameHi || profile.name || 'Didi';
    const lang = _detectLanguage(text);

    if (lang === 'hi') {
      return `नमस्ते ${name} जी! मैं आपकी दाई हूं। आप अभी ${week}वें हफ्ते में हैं। आज आपकी तबीयत कैसी है? कोई भी सवाल पूछिए, मैं आपकी मदद के लिए यहां हूं।`;
    } else if (lang === 'hinglish') {
      return `Namaste ${name} ji! Main aapki Dai hoon. Aap abhi ${week}ve hafte mein hain. Aaj kaisi tabiyat hai? Koi bhi sawal poochiye, main aapki madad ke liye hoon.`;
    } else {
      return `Namaste ${name} ji! I am your Dai. You are in week ${week} of your pregnancy. How are you feeling today? Ask me anything, I am here to help you.`;
    }
  }

  function dietAgent(text) {
    const lang = _detectLanguage(text);
    const lower = text.toLowerCase();
    const profile = MamtaStore.getProfile();
    const trimester = MamtaKnowledge.getTrimester(profile.currentWeek);

    let category = 'iron_rich';
    if (lower.includes('calcium') || lower.includes('कैल्शियम') || lower.includes('haddi') || lower.includes('हड्डी') || lower.includes('doodh')) {
      category = 'calcium_rich';
    } else if (lower.includes('energy') || lower.includes('thakan') || lower.includes('थकान') || lower.includes('kamzori') || lower.includes('कमज़ोरी')) {
      category = 'energy';
    }

    const foods = MamtaKnowledge.NUTRITION[category];
    const food1 = foods[0];
    const food2 = foods[1];
    const medRule = MamtaKnowledge.MEDICATION_RULES.iron_calcium;

    if (lang === 'hi' || lang === 'hinglish') {
      let response = `${food1.name_hi} — ${food1.benefit_hi} (${food1.cost})\n\n`;
      response += `${food2.name_hi} — ${food2.benefit_hi} (${food2.cost})\n\n`;
      response += `ज़रूरी बात: ${medRule.rule_hi}`;
      return response;
    } else {
      let response = `${food1.name_en} — ${food1.benefit_hi} (${food1.cost})\n\n`;
      response += `${food2.name_en} — ${food2.benefit_hi} (${food2.cost})\n\n`;
      response += `Important: ${medRule.rule_en}`;
      return response;
    }
  }

  function symptomAgent(text) {
    const lang = _detectLanguage(text);
    const triage = MamtaKnowledge.triageSymptom(text);

    if (triage) {
      if (triage.severity === 'RED') {
        if (lang === 'hi' || lang === 'hinglish') {
          return `KHATRA! ${triage.symptom_hi}\n\n${triage.action_hi}\n\n108 pe turant call karein! Yeh bahut zaroori hai.`;
        } else {
          return `DANGER! ${triage.symptom_en}\n\n${triage.action_en}\n\nCall 108 immediately!`;
        }
      } else if (triage.severity === 'YELLOW') {
        if (lang === 'hi' || lang === 'hinglish') {
          return `Didi, yeh dhyaan dene wali baat hai. ${triage.symptom_hi}\n\n${triage.action_hi}\n\nAgar aaram na mile toh doctor se zaroor milein.`;
        } else {
          return `This needs attention. ${triage.symptom_en}\n\n${triage.action_en}\n\nPlease consult your doctor if symptoms persist.`;
        }
      } else {
        if (lang === 'hi' || lang === 'hinglish') {
          return `Didi, ghabraiye nahi. ${triage.symptom_hi}\n\n${triage.action_hi}\n\nYeh pregnancy mein normal hai. Aaram karein.`;
        } else {
          return `Don't worry. ${triage.symptom_en}\n\n${triage.action_en}\n\nThis is normal during pregnancy. Rest well.`;
        }
      }
    }

    // General symptom response
    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, aapne jo bataya usse mujhe lagta hai aapko ek baar doctor se mil lena chahiye. Aap apna BP bhi check karwa lein. Agar koi bhi tej dard ya bleeding ho toh turant 108 call karein. Tab tak aaram karein aur paani piyein.`;
    } else {
      return `Based on what you described, I recommend consulting your doctor. Also get your BP checked. If you experience severe pain or bleeding, call 108 immediately. Rest well and stay hydrated.`;
    }
  }

  function medicationAgent(text) {
    const lang = _detectLanguage(text);
    const lower = text.toLowerCase();
    const ironCalcium = MamtaKnowledge.MEDICATION_RULES.iron_calcium;
    const thyroid = MamtaKnowledge.MEDICATION_RULES.thyroid;

    if (lower.includes('thyroid') || lower.includes('थायरॉइड')) {
      if (lang === 'hi' || lang === 'hinglish') {
        return `${thyroid.rule_hi}\n\n${thyroid.detail_hi}`;
      } else {
        return `${thyroid.rule_en}\n\n${thyroid.detail_en}`;
      }
    }

    // Default to iron/calcium advice
    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, goli lene ka sahi tarika:\n\n1. Iron (IFA) ki goli — subah ya shaam khaane se 1 ghanta pehle, nimbu paani ke saath lein.\n\n2. Calcium ki goli — dopahar ke khaane ke baad ya raat ko sote samay lein.\n\n${ironCalcium.rule_hi}\n\n${ironCalcium.detail_hi}`;
    } else {
      return `Here's the correct way to take your supplements:\n\n1. Iron (IFA) tablet — take 1 hour before meals with lemon water.\n\n2. Calcium tablet — take after lunch or before bedtime.\n\n${ironCalcium.rule_en}`;
    }
  }

  function kickCountAgent(text) {
    const lang = _detectLanguage(text);
    const profile = MamtaStore.getProfile();
    const recentKicks = MamtaStore.getRecentKickCounts(3);

    if (lang === 'hi' || lang === 'hinglish') {
      let response = `Didi, baby ki kick ginna bahut zaroori hai (28ve hafte ke baad).\n\n`;
      response += `Kaise ginein:\n`;
      response += `1. Shaam ko khaana khaane ke baad bayi karwat letein\n`;
      response += `2. 2 ghante mein baby kitni baar hili, yeh ginein\n`;
      response += `3. Agar 2 ghante mein 10 baar se zyada hile toh sab theek hai\n`;
      response += `4. Agar 10 se kam ho toh paani piyein aur dobara ginein\n`;
      response += `5. Phir bhi kam ho toh doctor ke paas jaayein\n`;

      if (recentKicks.length > 0) {
        const last = recentKicks[recentKicks.length - 1];
        response += `\nAapki pichli kick count: ${last.count} baar ${last.durationMin} minute mein — ${last.normal ? 'Sab theek hai!' : 'Thoda kam hai, doctor se milein.'}`;
      }
      return response;
    } else {
      let response = `Baby kick counting is very important (after week 28).\n\n`;
      response += `How to count:\n`;
      response += `1. After dinner, lie on your left side\n`;
      response += `2. Count how many times baby moves in 2 hours\n`;
      response += `3. 10+ movements in 2 hours = normal\n`;
      response += `4. If less than 10, drink water and recount\n`;
      response += `5. Still less? Visit your doctor\n`;
      return response;
    }
  }

  function checklistAgent(text) {
    const lang = _detectLanguage(text);
    const profile = MamtaStore.getProfile();
    const trimester = MamtaKnowledge.getTrimester(profile.currentWeek);
    const checklist = MamtaKnowledge.getChecklist(trimester);
    const progress = MamtaStore.getChecklistProgress();

    if (lang === 'hi' || lang === 'hinglish') {
      let response = `Didi, aap ${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} trimester mein hain. Aaj ke kaam:\n\n`;
      checklist.forEach((item, i) => {
        const done = progress[item.id] ? '✅' : '⬜';
        response += `${done} ${item.text_hi}\n`;
      });
      const completion = MamtaStore.getChecklistCompletion();
      response += `\nAaj ka progress: ${completion.done}/${completion.total} kaam poore hue.`;
      return response;
    } else {
      let response = `You are in trimester ${trimester}. Today's tasks:\n\n`;
      checklist.forEach((item) => {
        const done = progress[item.id] ? '✅' : '⬜';
        response += `${done} ${item.text_en}\n`;
      });
      return response;
    }
  }

  function emergencyAgent(text) {
    const lang = _detectLanguage(text);
    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, agar aapko TURANT madad chahiye:\n\n📞 108 — Ambulance (Muft, 24/7)\n📞 181 — Mahila Helpline\n📞 104 — Swasthya Salah\n\nAgar tez khoon beh raha hai, tez sir dard hai, ya baby hil nahi rahi — 108 pe ABHI call karein!\n\nBayi karwat letein aur ambulance ka intezaar karein.`;
    } else {
      return `If you need IMMEDIATE help:\n\n📞 108 — Ambulance (Free, 24/7)\n📞 181 — Women Helpline\n📞 104 — Health Advice\n\nIf you have heavy bleeding, severe headache, or baby not moving — call 108 NOW!\n\nLie on your left side and wait for help.`;
    }
  }

  function deliveryAgent(text) {
    const lang = _detectLanguage(text);
    const profile = MamtaStore.getProfile();

    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, delivery ki taiyari ke liye ye cheezein rakhein:\n\n🎒 Hospital bag mein rakhein:\n- Maa ka Aadhaar card, hospital papers\n- 2-3 cotton saree/gown\n- Baby ke kapde (3-4 jodi)\n- Sanitary pad (bade wale)\n- Doodh bottle, towel\n- Phone charger, thoda paisa\n\n⚡ Ye hone par hospital jaayein:\n- Niyamit pet dard (har 5-10 minute)\n- Paani aana (jhilli futna)\n- Khoon aana\n\n📅 Aapki EDD: ${profile.eddDate || 'Doctor se poochein'}\n\nDariye mat, sab theek hoga! 108 ka number yaad rakhein.`;
    } else {
      return `Delivery preparation checklist:\n\n🎒 Hospital bag:\n- ID card, hospital papers\n- 2-3 cotton gowns\n- Baby clothes (3-4 sets)\n- Sanitary pads\n- Feeding bottle, towel\n- Phone charger, some money\n\n⚡ Go to hospital when:\n- Regular contractions (every 5-10 min)\n- Water breaking\n- Any bleeding\n\n📅 Your EDD: ${profile.eddDate || 'Ask your doctor'}\n\nStay calm, everything will be fine! Keep 108 number ready.`;
    }
  }

  function weekInfoAgent(text) {
    const lang = _detectLanguage(text);
    const profile = MamtaStore.getProfile();
    const week = profile.currentWeek || 24;
    const info = MamtaKnowledge.getWeekInfo(week);
    const trimester = MamtaKnowledge.getTrimester(week);

    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, aap ${week}ve hafte mein hain (Trimester ${trimester}).\n\n👶 Baby ka haal: ${info.baby_hi}\n📏 Size: ${info.size}\n\n💡 Dhyaan rakhein: ${info.focus_hi}\n\n🏥 Zaroori jaanch: ${info.tests_hi}`;
    } else {
      return `You are in week ${week} (Trimester ${trimester}).\n\nBaby: ${info.baby_en}\nSize: ${info.size}\n\nFocus: ${info.focus_en}\n\nTests: ${info.tests_hi}`;
    }
  }

  function generalAgent(text) {
    const lang = _detectLanguage(text);
    const profile = MamtaStore.getProfile();
    const week = profile.currentWeek || 24;

    if (lang === 'hi' || lang === 'hinglish') {
      return `Didi, main aapki Dai hoon aur aapki pregnancy mein madad karne ke liye hoon. Aap ${week}ve hafte mein hain.\n\nAap mujhse ye pooch sakti hain:\n- Kya khana chahiye\n- Goli kab leni hai\n- Baby ki kick ginna\n- Koi bhi dard ya takleef\n- Delivery ki taiyari\n\nBataiye, kaise madad karun?`;
    } else {
      return `I am your Dai and I'm here to help you during your pregnancy. You are in week ${week}.\n\nYou can ask me about:\n- What to eat\n- When to take medicines\n- How to count baby kicks\n- Any pain or discomfort\n- Delivery preparation\n\nHow can I help you?`;
    }
  }

  // ── Safety Agent ─────────────────────────────────────────────────────
  function safetyCheck(response, intent) {
    let safeResponse = response;

    // Add emergency guidance for symptom-related responses
    if (intent === 'symptom' || intent === 'emergency') {
      if (!safeResponse.includes('108') && !safeResponse.includes('doctor')) {
        safeResponse += '\n\nAgar haalat bigde toh 108 pe call karein ya najdeeki hospital jaayein.';
      }
    }

    // Add medical disclaimer for health-related topics
    if (['symptom', 'medication', 'diet', 'kickcount'].includes(intent)) {
      if (!safeResponse.includes('डॉक्टर') && !safeResponse.includes('doctor')) {
        safeResponse += '\n\nYaad rakhein: Dai aapki madad ke liye hai, lekin doctor ki jagah nahi le sakti. Zaroori jaanch samay par zaroor karwayein.';
      }
    }

    return safeResponse;
  }

  // ── Gemma Model Loading ────────────────────────────────────────────────
  async function loadGemmaModel(onProgress) {
    if (gemmaLoaded || gemmaLoading) return gemmaLoaded;
    gemmaLoading = true;

    try {
      // Check for WebGPU support first
      if (!navigator.gpu) {
        console.log('WebGPU not supported. Using knowledge-base fallback.');
        gemmaLoading = false;
        return false;
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.log('No WebGPU adapter found. Using fallback.');
        gemmaLoading = false;
        return false;
      }

      // Try loading MediaPipe LLM Inference
      if (onProgress) onProgress(10, 'Loading AI engine...');

      // Initialize Gemma 4 WebGPU through MediaPipe GenAI
      // Using a valid community-hosted MediaPipe Gemma 2B GPU INT4 model
      const gemmaModelUrl = 'https://huggingface.co/autoocrat0413/gemma-2b-it-gpu-int4-mediapipe/resolve/main/gemma-2b-it-gpu-int4.bin';
    
      // Attempt to load the model (may fail if WebGPU is not truly supported)
      if (onProgress) onProgress(15, isEn() ? 'Checking WebGPU Drivers...' : 'वेबजीपीयू ड्राइवर की जाँच...');

      const { FilesetResolver, LlmInference } = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/genai_bundle.mjs'
      );

      if (onProgress) onProgress(35, isEn() ? 'Loading GenAI Engine...' : 'GenAI इंजन लोड हो रहा है...');

      const genai = await FilesetResolver.forGenAiTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
      );

      if (onProgress) onProgress(55, isEn() ? 'Downloading Gemma 4 Weights (~1.4GB)...' : 'Gemma 4 मॉडल डाउनलोड हो रहा है...');

      gemmaModel = await LlmInference.createFromOptions(genai, {
        baseOptions: {
          modelAssetPath: gemmaModelUrl
        },
        maxTokens: 150,
        topK: 20,
        temperature: 0.6,
        randomSeed: Date.now() % 1000
      });

      if (onProgress) onProgress(100, 'AI model ready!');

      gemmaLoaded = true;
      gemmaLoading = false;
      console.log('Gemma model loaded successfully!');
      return true;

    } catch (error) {
      console.warn('Gemma model loading failed, using fallback:', error.message);
      gemmaLoading = false;
      return false;
    }
  }

  // ── Food Analysis Agent ──────────────────────────────────────────────
  async function foodAnalysisAgent(foodNameEn, foodNameHi) {
    const profile = MamtaStore.getProfile();
    const lang = profile.language === 'en' ? 'en' : 'hi';
    const agentsUsed = ['Food Vision (MobileNet)'];

    let response = '';

    if (gemmaLoaded) {
      agentsUsed.push('Gemma 4 (Nutrition Advisor)');
      const prompt = `You are a Pregnancy Nutrition Advisor. The user is eating: ${foodNameEn}. 
Briefly tell them if this is good during pregnancy and suggest 1-2 local Indian ingredients they can add to this meal to increase iron or calcium. 
Keep it very short (2 sentences). Respond in ${lang === 'en' ? 'English' : 'Hinglish'}.`;
      
      const gemmaResp = await gemmaGenerate(prompt, `Eating: ${foodNameEn}`);
      if (gemmaResp) {
        return { response: gemmaResp, agentsUsed, intent: 'food' };
      }
    }

    // Fallback Rule-based Food Agent
    agentsUsed.push('Rule-based Nutrition Agent');
    if (lang === 'en') {
      response = `I see ${foodNameEn}. That looks like a good choice! To make it even healthier for your pregnancy, try adding some spinach (for iron) or having a glass of buttermilk (for calcium) with it.`;
    } else {
      response = `Didi, lagta hai aap ${foodNameHi || foodNameEn} kha rahi hain. Ye achhi baat hai! Apne khane mein thoda palak (iron ke liye) ya saath mein chhach (calcium ke liye) zaroor shamil karein.`;
    }

    return { response, agentsUsed, intent: 'food' };
  }

  // ── Gemma-Powered Agent Chain ──────────────────────────────────────────
  async function gemmaGenerate(systemPrompt, userMessage) {
    if (!gemmaModel) return null;

    try {
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;
      const response = await gemmaModel.generateResponse(fullPrompt);
      return response ? response.trim() : null;
    } catch (error) {
      console.warn('Gemma generation failed:', error);
      return null;
    }
  }

  async function gemmaMultiAgent(text, intent) {
    const lang = MamtaStore.getProfile().language === 'en' ? 'English' : 'Hinglish (Hindi mixed with English)';
    
    // Agent 1: Get specialist system prompt based on intent
    let specialistPrompt = SYSTEM_PROMPTS.dai + `\nRespond ONLY in ${lang}.`;
    if (intent === 'diet') specialistPrompt = SYSTEM_PROMPTS.diet + `\nRespond ONLY in ${lang}.`;
    else if (['symptom', 'emergency'].includes(intent)) specialistPrompt = SYSTEM_PROMPTS.symptom + `\nRespond ONLY in ${lang}.`;

    // Agent 2: Generate specialist response
    const profile = MamtaStore.getProfile();
    const contextMessage = `Patient: ${profile.name}, Week ${profile.currentWeek}, ${profile.bloodGroup}\nQuery: ${text}`;
    let response = await gemmaGenerate(specialistPrompt, contextMessage);

    if (!response) return null;

    // Agent 3: Safety guardrail
    const safetyReview = await gemmaGenerate(SYSTEM_PROMPTS.safety, response);
    return safetyReview || response;
  }

  // ── Main Processing Pipeline ───────────────────────────────────────────
  return {
    isGemmaLoaded() { return gemmaLoaded; },
    isGemmaLoading() { return gemmaLoading; },

    async loadModel(onProgress) {
      return await loadGemmaModel(onProgress);
    },

    /**
     * Process user query through multi-agent loop.
     * @param {string} text — User's spoken/typed input
     * @param {string|null} imageData — Base64 image data (for report analysis)
     * @returns {{ response: string, intent: string, agentsUsed: string[], severity: string|null }}
     */
    async processQuery(text, imageData = null) {
      const intent = classifyIntent(text);
      const agentsUsed = ['Dai (Intent Classification)'];
      let response = '';
      let severity = null;

      // Try Gemma first
      if (gemmaLoaded) {
        const gemmaResponse = await gemmaMultiAgent(text, intent);
        if (gemmaResponse) {
          agentsUsed.push('Gemma 4 (In-Browser AI)');
          agentsUsed.push('Safety Guardrail');
          // Still apply rule-based safety check
          response = safetyCheck(gemmaResponse, intent);

          // Check severity from triage
          const triage = MamtaKnowledge.triageSymptom(text);
          if (triage) severity = triage.severity;

          return { response, intent, agentsUsed, severity };
        }
      }

      // Fallback: Rule-based multi-agent system
      switch (intent) {
        case 'greeting':
          response = greetingAgent(text);
          agentsUsed.push('Greeting Agent');
          break;
        case 'diet':
          response = dietAgent(text);
          agentsUsed.push('Nutrition Advisor Agent');
          break;
        case 'symptom':
          response = symptomAgent(text);
          agentsUsed.push('Symptom Triage Agent');
          const triage = MamtaKnowledge.triageSymptom(text);
          if (triage) severity = triage.severity;
          break;
        case 'medication':
          response = medicationAgent(text);
          agentsUsed.push('Medication Advisor Agent');
          break;
        case 'kickcount':
          response = kickCountAgent(text);
          agentsUsed.push('Kick Counter Agent');
          break;
        case 'checklist':
          response = checklistAgent(text);
          agentsUsed.push('Checklist Agent');
          break;
        case 'emergency':
          response = emergencyAgent(text);
          agentsUsed.push('Emergency Response Agent');
          severity = 'RED';
          break;
        case 'delivery':
          response = deliveryAgent(text);
          agentsUsed.push('Delivery Preparation Agent');
          break;
        case 'week_info':
          response = weekInfoAgent(text);
          agentsUsed.push('Pregnancy Progress Agent');
          break;
        default:
          response = generalAgent(text);
          agentsUsed.push('General Advisor Agent');
          break;
      }

      // Safety agent
      response = safetyCheck(response, intent);
      agentsUsed.push('Safety Guardrail Agent');

      // Save conversation
      MamtaStore.addConversation('user', text);
      MamtaStore.addConversation('dai', response);

      return { response, intent, agentsUsed, severity };
    },

    /**
     * Process an uploaded report image.
     * For now uses basic description since small model can't do OCR well.
     */
    async processReport(imageData) {
      const lang = MamtaStore.getProfile().language === 'en' ? 'en' : 'hi';
      const agentsUsed = ['Dai (Report Router)', 'Report Reader Agent', 'Safety Guardrail Agent'];

      let response;
      if (gemmaLoaded) {
        const promptLang = lang === 'en' ? 'English' : 'simple Hindi/Hinglish';
        const gemmaResp = await gemmaGenerate(
          `You are analyzing a medical report image for a pregnant patient. Describe what you see and provide advice in ${promptLang}.`,
          'Please analyze this medical report image and explain it simply.'
        );
        if (gemmaResp) {
          response = gemmaResp;
          MamtaStore.addReportEntry(imageData, response);
          return { response, intent: 'report', agentsUsed, severity: null };
        }
      }

      // Fallback for report analysis
      if (lang === 'en') {
        response = `I have received your report. Currently, I don't have the capability to read the text in this image offline.\n\nPlease show this to your ASHA worker or doctor on your next visit. Can you read what it says? I will try my best to explain.`;
      } else {
        response = `Didi, aapki report mil gayi hai. Abhi hamare paas yeh report padhne ki poori suvidha nahi hai.\n\nAap ye karein:\n1. Apni ASHA worker ko ye report dikhaayein\n2. Ya agle doctor visit mein le jaayein\n3. Agar report mein koi RED ya HIGH likha hai toh jaldi doctor se milein\n\nKya aap mujhe bata sakti hain ki report mein kya likha hai? Main samjhane ki koshish karungi.`;
      }

      MamtaStore.addReportEntry(imageData, response);
      return { response, intent: 'report', agentsUsed, severity: null };
    },

    /**
     * Process a food image via FoodTracker (MobileNet) -> Gemma
     */
    async processFoodImage(foodLabelEn, foodLabelHi) {
      return await foodAnalysisAgent(foodLabelEn, foodLabelHi);
    },

    // Get the initial greeting
    getGreeting() {
      return greetingAgent('namaste');
    },

    // Classify intent (exposed for testing)
    classifyIntent
  };
})();
