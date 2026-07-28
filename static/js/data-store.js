/**
 * Mamta — Client-Side Data Store (localStorage)
 * Manages user profile, checklist progress, conversation history,
 * kick counter, and all pregnancy tracking data.
 * All data stays on-device — zero cloud dependency.
 */

const MamtaStore = (() => {
  const STORAGE_KEY = 'mamta_user_data';

  // ── Default Mock User ──────────────────────────────────────────────────
  function _createDefaultUser() {
    const now = new Date();
    const lmpDate = new Date(now);
    lmpDate.setDate(lmpDate.getDate() - (24 * 7)); // 24 weeks ago
    const eddDate = new Date(lmpDate);
    eddDate.setDate(eddDate.getDate() + 280); // 40 weeks from LMP

    return {
      userId: 'priya_sharma_01',
      createdAt: now.toISOString(),
      profile: {
        name: 'Priya Sharma',
        nameHi: 'प्रिया शर्मा',
        age: 26,
        lmpDate: lmpDate.toISOString().split('T')[0],
        eddDate: eddDate.toISOString().split('T')[0],
        currentWeek: 24,
        bloodGroup: 'B+',
        language: 'hi-IN',
        highRisk: false,
        riskFactors: []
      },
      vitalSigns: [
        { id: 'v1', date: _daysAgo(5), bpSystolic: 118, bpDiastolic: 76, map: 90.0, weightKg: 60.5 },
        { id: 'v2', date: _daysAgo(4), bpSystolic: 120, bpDiastolic: 78, map: 92.0, weightKg: 60.7 },
        { id: 'v3', date: _daysAgo(3), bpSystolic: 119, bpDiastolic: 75, map: 89.7, weightKg: 60.9 },
        { id: 'v4', date: _daysAgo(2), bpSystolic: 122, bpDiastolic: 79, map: 93.3, weightKg: 61.1 },
        { id: 'v5', date: _daysAgo(1), bpSystolic: 121, bpDiastolic: 80, map: 93.7, weightKg: 61.3 }
      ],
      medications: [
        { id: 'm1', name: 'Iron-Folic Acid (IFA)', taken: true, date: _daysAgo(1), time: '08:30' },
        { id: 'm2', name: 'Calcium Carbonate', taken: true, date: _daysAgo(1), time: '13:30' }
      ],
      kickCounts: [
        { id: 'k1', date: _daysAgo(3), count: 12, durationMin: 60, normal: true },
        { id: 'k2', date: _daysAgo(2), count: 14, durationMin: 55, normal: true },
        { id: 'k3', date: _daysAgo(1), count: 11, durationMin: 65, normal: true }
      ],
      conversations: [],
      checklistProgress: {},
      reportHistory: [],
      alerts: []
    };
  }

  function _daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  function _today() {
    return new Date().toISOString().split('T')[0];
  }

  function _generateId() {
    return Math.random().toString(36).substring(2, 10);
  }

  // ── Core CRUD ──────────────────────────────────────────────────────────
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('MamtaStore: Failed to load data, creating fresh profile.');
    }
    const newUser = _createDefaultUser();
    _save(newUser);
    return newUser;
  }

  function _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('MamtaStore: Failed to save data:', e);
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────
  return {
    // Profile
    getProfile() {
      return _load().profile;
    },

    updateProfile(updates) {
      const data = _load();
      Object.assign(data.profile, updates);
      if (updates.lmpDate) {
        const lmp = new Date(updates.lmpDate);
        const now = new Date();
        data.profile.currentWeek = Math.min(42, Math.max(1, Math.floor((now - lmp) / (7 * 24 * 60 * 60 * 1000))));
        const edd = new Date(lmp);
        edd.setDate(edd.getDate() + 280);
        data.profile.eddDate = edd.toISOString().split('T')[0];
      }
      _save(data);
      return data.profile;
    },

    getCurrentWeek() {
      return _load().profile.currentWeek || 24;
    },

    // Conversations
    addConversation(role, text) {
      const data = _load();
      const entry = {
        id: _generateId(),
        role: role,
        text: text,
        timestamp: new Date().toISOString()
      };
      data.conversations.push(entry);
      if (data.conversations.length > 100) {
        data.conversations = data.conversations.slice(-100);
      }
      _save(data);
      return entry;
    },

    getConversations(limit = 20) {
      return _load().conversations.slice(-limit);
    },

    clearConversations() {
      const data = _load();
      data.conversations = [];
      _save(data);
    },

    // Checklist
    getChecklistProgress(date) {
      date = date || _today();
      const data = _load();
      return data.checklistProgress[date] || {};
    },

    toggleChecklistItem(itemId, date) {
      date = date || _today();
      const data = _load();
      if (!data.checklistProgress[date]) {
        data.checklistProgress[date] = {};
      }
      data.checklistProgress[date][itemId] = !data.checklistProgress[date][itemId];
      _save(data);
      return data.checklistProgress[date][itemId];
    },

    getChecklistCompletion(date) {
      date = date || _today();
      const data = _load();
      const progress = data.checklistProgress[date] || {};
      const checked = Object.values(progress).filter(Boolean).length;
      const trimester = MamtaKnowledge.getTrimester(data.profile.currentWeek);
      const checklist = MamtaKnowledge.getChecklist(trimester);
      return {
        done: checked,
        total: checklist.length,
        percent: checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0
      };
    },

    // Kick Counter
    addKickCount(count, durationMin) {
      const data = _load();
      const normal = count >= 10 || (durationMin > 0 && (count / durationMin) >= (10 / 120));
      const entry = {
        id: _generateId(),
        date: _today(),
        count: count,
        durationMin: durationMin,
        normal: normal,
        timestamp: new Date().toISOString()
      };
      data.kickCounts.push(entry);

      if (!normal) {
        data.alerts.push({
          id: _generateId(),
          severity: 'YELLOW',
          message_hi: `बच्चे की हरकत कम है (${count} बार ${durationMin} मिनट में)। बाईं करवट लेटें और दोबारा गिनें।`,
          message_en: `Low fetal movement (${count} in ${durationMin} min). Lie on left side and recount.`,
          timestamp: new Date().toISOString()
        });
      }

      _save(data);
      return entry;
    },

    getRecentKickCounts(limit = 7) {
      return _load().kickCounts.slice(-limit);
    },

    // Vitals
    addVitalSigns(bpSystolic, bpDiastolic, weightKg) {
      const data = _load();
      const map = bpDiastolic && bpSystolic ? Math.round(((2 * bpDiastolic) + bpSystolic) / 3 * 10) / 10 : null;
      const entry = {
        id: _generateId(),
        date: _today(),
        bpSystolic: bpSystolic,
        bpDiastolic: bpDiastolic,
        map: map,
        weightKg: weightKg,
        timestamp: new Date().toISOString()
      };
      data.vitalSigns.push(entry);

      if (map && map >= 105) {
        data.alerts.push({
          id: _generateId(),
          severity: 'RED',
          message_hi: `खतरा! ब्लड प्रेशर ${bpSystolic}/${bpDiastolic} बहुत ज़्यादा है। तुरंत डॉक्टर से मिलें।`,
          message_en: `DANGER! BP ${bpSystolic}/${bpDiastolic} is critically high. Seek immediate care.`,
          timestamp: new Date().toISOString()
        });
      }

      _save(data);
      return entry;
    },

    // Medications
    logMedication(name, taken = true) {
      const data = _load();
      const entry = {
        id: _generateId(),
        name: name,
        taken: taken,
        date: _today(),
        time: new Date().toTimeString().substring(0, 5),
        timestamp: new Date().toISOString()
      };
      data.medications.push(entry);
      _save(data);
      return entry;
    },

    // Reports
    addReportEntry(imageDataUrl, analysis) {
      const data = _load();
      const entry = {
        id: _generateId(),
        date: _today(),
        imagePreview: imageDataUrl ? imageDataUrl.substring(0, 200) : null,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      data.reportHistory.push(entry);
      _save(data);
      return entry;
    },

    getReports(limit = 10) {
      return _load().reportHistory.slice(-limit);
    },

    // Alerts
    getAlerts(limit = 5) {
      return _load().alerts.slice(-limit);
    },

    clearAlerts() {
      const data = _load();
      data.alerts = [];
      _save(data);
    },

    // Full data access
    getAllData() {
      return _load();
    },

    // Reset
    resetAllData() {
      localStorage.removeItem(STORAGE_KEY);
      return _load();
    }
  };
})();
