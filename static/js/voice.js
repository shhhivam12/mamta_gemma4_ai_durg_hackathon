/**
 * Mamta — Voice Input/Output System
 * Speech-to-Text: Web Speech API with auto-detect (hi-IN / en-IN)
 * Text-to-Speech: Web Speech Synthesis with Hindi voice
 * Hold-to-speak (touch) + Spacebar-to-speak (desktop)
 */

const MamtaVoice = (() => {
  let recognition = null;
  let isListening = false;
  let isSpeaking = false;
  let currentUtterance = null;
  let onResultCallback = null;
  let onStateChangeCallback = null;
  let selectedLang = 'hi-IN';

  // Piper TTS variables
  let piperSession = null;
  let piperReady = false;
  let piperDownloading = false;
  let currentPiperAudio = null;

  // States: 'idle' | 'listening' | 'processing' | 'speaking'
  let currentState = 'idle';

  function _setState(state) {
    currentState = state;
    if (onStateChangeCallback) onStateChangeCallback(state);
  }

  // ── Piper TTS Initialization ──────────────────────────────────────────
  async function _initPiper() {
    if (piperDownloading || piperReady) return;
    piperDownloading = true;

    const voiceStatusText = document.getElementById('voiceStatusText');
    const voiceStatus = document.getElementById('voiceStatus');
    
    const setStatus = (msg, isReady = false) => {
      if (voiceStatusText) voiceStatusText.textContent = msg;
      if (voiceStatus) {
        if (isReady) {
          voiceStatus.classList.remove('fallback');
          voiceStatus.classList.add('ready');
        } else {
          voiceStatus.classList.remove('ready');
          voiceStatus.classList.add('fallback');
        }
      }
    };

    try {
      setStatus('आवाज़: इंजन लोड हो रहा है...');
      
      // Import our patched local library!
      const { TtsSession } = await import('./piper-tts.js');

      piperSession = await TtsSession.create({
        voiceId: 'hi_IN-priyamvada-medium',
        progress: (e) => {
           setStatus('आवाज़: डाउनलोडिंग (~50MB)...');
        }
      });
      
      piperReady = true;
      piperDownloading = false;
      setStatus('आवाज़: AI दाई सक्रिय', true);
      console.log('Piper TTS Initialized with hi_IN-priyamvada-medium');
    } catch (e) {
      console.error('Piper TTS failed to initialize:', e);
      piperDownloading = false;
      piperReady = false;
      setStatus('आवाज़: डिफ़ॉल्ट (ऑफ़लाइन)');
    }
  }

  async function _speakWithPiper(text, onDone) {
    if (!piperReady || !piperSession) return false;
    try {
      const blob = await piperSession.predict(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentPiperAudio = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        isSpeaking = false;
        currentPiperAudio = null;
        _setState('idle');
        if (onDone) onDone();
      };
      
      audio.play();
      isSpeaking = true;
      _setState('speaking');
      return true;
    } catch (e) {
      console.error("Piper TTS predict failed:", e);
      return false;
    }
  }

  // ── Speech Recognition Setup ──────────────────────────────────────────
  function _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = selectedLang;
    rec.maxAlternatives = 1;

    let finalTranscript = '';
    let silenceTimer = null;

    rec.onstart = () => {
      isListening = true;
      finalTranscript = '';
      _setState('listening');
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          // Auto-detect language from content
          if (/[\u0900-\u097F]/.test(transcript)) {
            selectedLang = 'hi-IN';
          } else {
            selectedLang = 'en-IN';
          }
        } else {
          interim = transcript;
        }
      }

      // Reset silence timer on each result
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        // If we have final text and silence, stop
        if (finalTranscript.trim()) {
          stopListening();
        }
      }, 2000);
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        isListening = false;
        _setState('idle');
      }
    };

    rec.onend = () => {
      isListening = false;
      if (finalTranscript.trim() && onResultCallback) {
        _setState('processing');
        onResultCallback(finalTranscript.trim());
      } else {
        _setState('idle');
      }
    };

    return rec;
  }

  // ── Speech Synthesis (TTS) ─────────────────────────────────────────────
  function _getHindiVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritized list of warm female voices (Windows, Chrome, Android, iOS)
    const femaleVoiceKeywords = ['swara', 'kalpana', 'heera', 'veena', 'zira', 'google हिन्दी', 'hi-in', 'en-in', 'female', 'natural'];

    // 1. Try finding Hindi female voice by name
    let voice = voices.find(v => (v.lang.startsWith('hi') || v.lang === 'hi-IN') && 
      femaleVoiceKeywords.some(kw => v.name.toLowerCase().includes(kw)));

    // 2. Try any Hindi voice
    if (!voice) voice = voices.find(v => v.lang.startsWith('hi') || v.lang === 'hi-IN');

    // 3. Try Indian English female voice (Heera/Veena/Zira)
    if (!voice) voice = voices.find(v => v.lang === 'en-IN' && 
      femaleVoiceKeywords.some(kw => v.name.toLowerCase().includes(kw)));

    // 4. Try any Indian English voice
    if (!voice) voice = voices.find(v => v.lang === 'en-IN');

    // 5. Try any female voice in the system
    if (!voice) voice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));

    // 6. Fallback to default
    if (!voice) voice = voices[0];
    
    console.log('Selected TTS Voice:', voice ? `${voice.name} (${voice.lang})` : 'Default');
    return voice;
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    /**
     * Initialize the voice system.
     * @param {Function} onResult — Called with recognized text when user stops speaking
     * @param {Function} onStateChange — Called with state string on state change
     */
    init(onResult, onStateChange) {
      onResultCallback = onResult;
      onStateChangeCallback = onStateChange;
      recognition = _initRecognition();

      // Preload voices
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }

      // Initialize Patched Piper AI Voice in background
      _initPiper();

      return !!recognition;
    },

    isSupported() {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    isTTSSupported() {
      return !!window.speechSynthesis;
    },

    getState() {
      return currentState;
    },

    startListening() {
      if (!recognition) {
        recognition = _initRecognition();
      }
      if (!recognition || isListening) return;

      try {
        // Update lang based on auto-detection
        recognition.lang = selectedLang;
        recognition.start();
      } catch (e) {
        console.warn('Failed to start recognition:', e);
        // Try reinitializing
        recognition = _initRecognition();
        if (recognition) {
          try { recognition.start(); } catch(e2) { console.error(e2); }
        }
      }
    },

    stopListening() {
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (e) {
          console.warn('Failed to stop recognition:', e);
        }
      }
    },

    /**
     * Speak text aloud using TTS.
     * @param {string} text — Text to speak
     * @param {Function} onDone — Called when speaking finishes
     */
    async speak(text, onDone) {
      if (!text) {
        if (onDone) onDone();
        return;
      }

      // Cancel any ongoing speech
      this.stopSpeaking();

      isSpeaking = true;
      _setState('speaking');

      // Try Piper Neural Voice First
      if (piperReady) {
        const success = await _speakWithPiper(text, onDone);
        if (success) return;
      }

      // Fallback to standard browser TTS if Piper isn't ready or fails
      if (!window.speechSynthesis) {
        if (onDone) onDone();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = _getHindiVoice();
      if (voice) utterance.voice = voice;

      // Detect language for proper pronunciation
      if (/[\u0900-\u097F]/.test(text)) {
        utterance.lang = 'hi-IN';
        // Adjust for a calmer, softer Hindi female voice
        utterance.rate = 0.85; 
        utterance.pitch = 1.2;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
      }

      utterance.volume = 1.0;

      utterance.onstart = () => {
        isSpeaking = true;
        _setState('speaking');
      };

      utterance.onend = () => {
        isSpeaking = false;
        currentUtterance = null;
        _setState('idle');
        if (onDone) onDone();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        isSpeaking = false;
        currentUtterance = null;
        _setState('idle');
        if (onDone) onDone();
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    },

    stopSpeaking() {
      if (currentPiperAudio) {
        currentPiperAudio.pause();
        currentPiperAudio = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isSpeaking = false;
      currentUtterance = null;
      _setState('idle');
    },

    /**
     * Bind hold-to-speak to a button element (touch + mouse).
     * @param {HTMLElement} button — The talk button
     */
    bindHoldToSpeak(button) {
      if (!button) return;

      let holdActive = false;

      const startHold = (e) => {
        e.preventDefault();
        if (isSpeaking) {
          this.stopSpeaking();
          return;
        }
        holdActive = true;
        this.startListening();
      };

      const endHold = (e) => {
        e.preventDefault();
        if (holdActive) {
          holdActive = false;
          // Small delay to capture final words
          setTimeout(() => this.stopListening(), 300);
        }
      };

      // Touch events (mobile)
      button.addEventListener('touchstart', startHold, { passive: false });
      button.addEventListener('touchend', endHold, { passive: false });
      button.addEventListener('touchcancel', endHold, { passive: false });

      // Mouse events (desktop fallback)
      button.addEventListener('mousedown', startHold);
      button.addEventListener('mouseup', endHold);
      button.addEventListener('mouseleave', (e) => {
        if (holdActive) endHold(e);
      });
    },

    /**
     * Bind spacebar press-and-hold to start/stop listening.
     */
    bindSpacebar() {
      let spaceHeld = false;

      document.addEventListener('keydown', (e) => {
        // Ignore if typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space' && !e.repeat && !spaceHeld) {
          e.preventDefault();
          spaceHeld = true;
          if (isSpeaking) {
            this.stopSpeaking();
          } else {
            this.startListening();
          }
        }
      });

      document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && spaceHeld) {
          e.preventDefault();
          spaceHeld = false;
          setTimeout(() => this.stopListening(), 300);
        }
      });
    },

    /**
     * Process a suggestion chip click (simulates voice input).
     * @param {string} text — The suggestion text
     */
    simulateInput(text) {
      if (isSpeaking) this.stopSpeaking();
      _setState('processing');
      if (onResultCallback) onResultCallback(text);
    }
  };

  // Export stopListening for internal use
  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch(e) {}
    }
  }
})();
