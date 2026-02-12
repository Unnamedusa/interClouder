/* ══════════════════════════════════════
   interClouder — Auto-Translate Module
   ══════════════════════════════════════ */
window.IC_Translate = {
  enabled: true,
  targetLang: navigator.language?.split('-')[0] || 'en',
  supportedLangs: [
    { code:'en', name:'English', flag:'🇬🇧' }, { code:'es', name:'Español', flag:'🇪🇸' },
    { code:'fr', name:'Français', flag:'🇫🇷' }, { code:'de', name:'Deutsch', flag:'🇩🇪' },
    { code:'pt', name:'Português', flag:'🇧🇷' }, { code:'ja', name:'日本語', flag:'🇯🇵' },
    { code:'ko', name:'한국어', flag:'🇰🇷' }, { code:'zh', name:'中文', flag:'🇨🇳' },
    { code:'ru', name:'Русский', flag:'🇷🇺' }, { code:'ar', name:'العربية', flag:'🇸🇦' },
    { code:'it', name:'Italiano', flag:'🇮🇹' }, { code:'nl', name:'Nederlands', flag:'🇳🇱' },
  ],

  // Client-side: call server endpoint (which would call Google Translate API)
  async translate(text, targetLang) {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: targetLang || this.targetLang })
      });
      const data = await res.json();
      return data.translated || text;
    } catch {
      return text; // Fallback: return original
    }
  },

  detectLanguage(text) {
    // Simple heuristic (in production: use API)
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
    if (/[àâçéèêëïîôùûüÿœæ]/i.test(text)) return 'fr';
    if (/[äöüß]/i.test(text)) return 'de';
    return 'en';
  }
};
