// Shared course data: the learner's stated objection, and how each module answers it.
window.RWND_OBJECTIONS = [
  { key: 'seat', label: 'The empty seat itself' },
  { key: 'nobody', label: 'Having no one to ask if something happens' },
  { key: 'unexpected', label: 'The car doing something unexpected' },
  { key: 'control', label: 'Not being in control' },
  { key: 'trust', label: 'Not trusting the technology' }
];

window.RWND_CALLBACK = {
  2: {
    seat: 'You said the empty seat is the part. Here\u2019s who that seat is empty for.',
    nobody: 'You said it\u2019s having no one to ask. Start with the people who have no one to drive them.',
    unexpected: 'You said it\u2019s the car doing something unexpected. Before that \u2014 who\u2019s waiting on it.',
    control: 'You said it\u2019s not being in control. Some people have already lost that choice.',
    trust: 'You said it\u2019s trusting the technology. First, what\u2019s riding on it.'
  },
  3: {
    seat: 'The seat is empty because the driving moved somewhere else. Here\u2019s where.',
    nobody: 'No one to ask \u2014 so it\u2019s worth knowing exactly what the car is doing on its own.',
    unexpected: 'You worried about the unexpected. This is the part of the car built for it.',
    control: 'Something is in control the whole time. This is what it\u2019s doing.',
    trust: 'You said you don\u2019t trust the technology. Judge it on what it actually does.'
  },
  4: {
    seat: 'An empty seat only matters if it drives worse. Here\u2019s the record.',
    nobody: 'You aren\u2019t the safety mechanism in this car. This is what is.',
    unexpected: 'The unexpected is exactly what this gets measured on.',
    control: 'Here\u2019s what the thing in control has actually done, on real streets.',
    trust: 'You said trust. Trust should come from evidence, so here it is.'
  },
  5: {
    seat: 'Here\u2019s that seat \u2014 and everything else around it.',
    nobody: 'You said no one to ask. Watch where the person you can reach turns up.',
    unexpected: 'And if something does go wrong \u2014 that\u2019s in here too.',
    control: 'Here\u2019s what you do control, start to finish.',
    trust: 'Nothing to take on faith here. Just what happens, step by step.'
  },
  6: {
    seat: 'You said the empty seat. Let\u2019s look at it one more time.',
    nobody: 'You said no one to ask. You\u2019ve now met the person you\u2019d reach.',
    unexpected: 'You said the unexpected. You know what it does when it\u2019s unsure.',
    control: 'You said control. You know what stays yours.',
    trust: 'You said trust. You\u2019ve seen what it\u2019s built on.'
  }
};

window.RWND_OBJ_LABEL = function (key) {
  const m = (window.RWND_OBJECTIONS || []).filter(function (o) { return o.key === key; })[0];
  return m ? m.label : '';
};

window.RWND_CALLBACK_LINE = function (moduleNum, key) {
  if (!key) return '';
  const set = (window.RWND_CALLBACK || {})[moduleNum] || {};
  return set[key] || '';
};


// ---- Narration -------------------------------------------------------------
// Browser speech synthesis, made as listenable as it gets: pick the best voice
// the device actually has, normalise typography that TTS mispronounces, and
// speak sentence groups rather than one long block.
(function () {
  var PREFERRED = [
    'Joelle', 'Noelle', 'Zoe', 'Ava', 'Nicky', 'Allison', 'Samantha', 'Susan',
    'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Michelle', 'Microsoft Guy', 'Microsoft Ana',
    'Google US English', 'Google UK English Female',
    'Karen', 'Moira', 'Tessa', 'Serena', 'Daniel', 'Fiona'
  ];
  // Arthur is macOS-only. On Windows and Android, fall through to the closest
  // equivalent: a warm British male, then a US male neural voice.
  var DEFAULT_CHAIN = [
    'Arthur', 'Oliver', 'Daniel',
    'Microsoft Ryan', 'Microsoft Thomas', 'Microsoft George',
    'Google UK English Male',
    'Microsoft Andrew', 'Microsoft Brian', 'Microsoft Guy',
    'Google US English', 'Alex', 'Aaron'
  ];
  var chosen = null;
  var override = null;

  function storedVoice() {
    if (override !== null) return override;
    try { return localStorage.getItem('rwnd.voice') || ''; } catch (err) { return ''; }
  }

  // The handful of macOS/Windows voices that read as a person rather than a
  // machine. Everything else the OS ships is novelty or a robot.
  var REALISTIC = /^(Samantha|Nicky|Aaron|Karen|Catherine|Gordon|Moira|Martha|Arthur|Daniel|Tessa|Rishi|Joelle|Noelle|Zoe|Ava|Allison|Susan|Microsoft (Aria|Jenny|Michelle|Guy|Ana)|Google (US|UK) English)/i;

  window.RWND_VOICE_LIST = function () {
    if (!window.speechSynthesis) return [];
    var all = window.speechSynthesis.getVoices() || [];
    var en = all.filter(function (v) { return /^en([-_]|$)/i.test(v.lang); });
    var good = en.filter(function (v) { return REALISTIC.test(v.name) || /premium|enhanced|neural|natural|online/i.test(v.name); });
    return (good.length ? good : en).map(function (v) { return v.name; });
  };

  window.RWND_SET_VOICE = function (name) {
    override = name || '';
    chosen = null;
    try { if (name) localStorage.setItem('rwnd.voice', name); else localStorage.removeItem('rwnd.voice'); } catch (err) {}
    pickVoice();
  };

  function num(key, dflt) {
    try { var v = parseFloat(localStorage.getItem(key)); return isFinite(v) ? v : dflt; } catch (err) { return dflt; }
  }
  window.RWND_GET_RATE = function () { return num('rwnd.rate', 0.74); };
  window.RWND_GET_PITCH = function () { return num('rwnd.pitch', 1.12); };
  window.RWND_SET_RATE = function (v) { try { localStorage.setItem('rwnd.rate', String(v)); } catch (err) {} };
  window.RWND_SET_PITCH = function (v) { try { localStorage.setItem('rwnd.pitch', String(v)); } catch (err) {} };

  function pickVoice() {
    if (!window.speechSynthesis) return null;
    var all = window.speechSynthesis.getVoices() || [];
    // Resolve nothing until the OS has actually handed over its voice list,
    // otherwise a stored pick can never be matched and gets replaced by a default.
    if (!all.length) return null;
    var want = storedVoice();
    if (want) {
      var hit = all.filter(function (v) { return v.name === want; })[0];
      if (hit) { chosen = hit; return chosen; }
    }
    if (chosen) return chosen;
    var en = all.filter(function (v) { return /^en([-_]|$)/i.test(v.lang); });
    if (!en.length) en = all;
    // Try the authored default chain before anything else, so every platform
    // lands on the same character of voice rather than its own house default.
    for (var d = 0; d < DEFAULT_CHAIN.length; d++) {
      var seek = DEFAULT_CHAIN[d].toLowerCase();
      var found = en.filter(function (v) { return v.name.toLowerCase().indexOf(seek) > -1; });
      if (found.length) {
        // Prefer the enhanced/natural build of that voice when the OS ships both.
        chosen = found.filter(function (v) { return /premium|enhanced|neural|natural/i.test(v.name); })[0] || found[0];
        return chosen;
      }
    }
    // A Premium / Enhanced / Neural voice, if the device has one installed,
    // beats anything in the list below by a wide margin.
    var upgraded = en.filter(function (v) { return /premium|enhanced|neural/i.test(v.name); });
    if (upgraded.length) {
      chosen = upgraded.filter(function (v) { return /en[-_]US/i.test(v.lang); })[0] || upgraded[0];
      return chosen;
    }
    for (var i = 0; i < PREFERRED.length; i++) {
      var want = PREFERRED[i].toLowerCase();
      var hit = en.filter(function (v) { return v.name.toLowerCase().indexOf(want) > -1; })[0];
      if (hit) { chosen = hit; return chosen; }
    }
    // Fall back to any voice that isn't one of the tinny compact ones.
    var NOVELTY = /compact|eloquence|espeak|whisper|organ|bells|bubbles|zarvox|trinoids|bad news|good news|jester|superstar|wobble|boing|bahh|cellos|albert|fred|ralph|junior|kathy|grandma|grandpa|rocko|sandy|shelley|reed|eddy|flo|deranged|hysterical|bruce|agnes|princess|trinoid/i;
    var decent = en.filter(function (v) { return !NOVELTY.test(v.name); });
    chosen = decent.filter(function (v) { return /en[-_]US/i.test(v.lang); })[0] || decent[0] || en[0];
    return chosen;
  }

  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.addEventListener('voiceschanged', function () { chosen = null; pickVoice(); });
    } catch (err) {
      window.speechSynthesis.onvoiceschanged = function () { chosen = null; pickVoice(); };
    }
    pickVoice();
  }

  function speakable(text) {
    return String(text || '')
      .replace(/[\u201c\u201d]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\u2026/g, ', ')
      .replace(/\s*[\u2014\u2013]\s*/g, ', ')
      .replace(/360\u00b0/g, '360 degree')
      .replace(/(\d)\s*%/g, '$1 percent')
      .replace(/\bU\.S\.\b/g, 'US')
      .replace(/\b0?(\d)\s*\/\s*0?(\d)\b/g, 'Step $1 of $2')
      .replace(/\bADAS\b/g, 'A D A S')
      .replace(/\bNHTSA\b/g, 'N H T S A')
      .replace(/\b(\d+)\.(\d+) million\b/g, '$1 point $2 million')
      .replace(/[\u2192\u2190\u2191\u2193]/g, '')
      .replace(/\s*\u00b7\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Read the prose, not the chrome: links and anything marked data-no-speak
  // (end cards, decorative labels) are dropped before the text is extracted.
  window.RWND_TEXT_FROM = function (el) {
    if (!el) return '';
    var clone = el.cloneNode(true);
    var drop = clone.querySelectorAll('[data-no-speak], a');
    for (var i = 0; i < drop.length; i++) drop[i].parentNode.removeChild(drop[i]);
    return clone.innerText || clone.textContent || '';
  };

  // Group sentences into utterances of a comfortable length. One giant
  // utterance is what makes synthesis sound flat; one per clause is choppy.
  function chunks(text) {
    var parts = text.match(/[^.!?]+[.!?]*/g) || [text];
    var out = [], buf = '';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      if (!p) continue;
      if (buf && (buf + ' ' + p).length <= 105) buf += ' ' + p;
      else { if (buf) out.push(buf); buf = p; }
    }
    if (buf) out.push(buf);
    return out;
  }

  // ---- Recorded narration ------------------------------------------------
  // Drop an mp3 at assets/audio/<key>.mp3 (e.g. assets/audio/m4-03.mp3) and it
  // plays instead of the synthesiser. Missing files fall back silently.
  var current = null;
  var missing = {};

  function pad(n) { return String(n).length < 2 ? '0' + n : String(n); }
  window.RWND_AUDIO_KEY = function (mod, beat) { return 'm' + mod + '-' + pad(beat); };

  function playRecorded(key, onFail) {
    if (!key || missing[key]) { onFail(); return; }
    var a = new Audio('assets/audio/' + key + '.mp3');
    a.volume = 0.95;
    a.addEventListener('error', function () { missing[key] = true; onFail(); });
    current = a;
    var p = a.play();
    if (p && p.catch) p.catch(function () { missing[key] = true; current = null; onFail(); });
  }

  window.RWND_STOP = function () {
    try { window.speechSynthesis.cancel(); } catch (err) {}
    if (current) { try { current.pause(); current.currentTime = 0; } catch (err) {} current = null; }
  };

  window.RWND_SPEAK = function (text, key) {
    window.RWND_STOP();
    var synth = function () { window.RWND_SYNTH(text); };
    if (key) playRecorded(key, synth); else synth();
  };

  window.RWND_SYNTH = function (text) {
    if (!window.speechSynthesis) return;
    try { window.speechSynthesis.cancel(); } catch (err) {}
    var t = speakable(text);
    if (!t) return;
    var v = pickVoice();
    var list = chunks(t);
    for (var i = 0; i < list.length; i++) {
      var u = new SpeechSynthesisUtterance(list[i]);
      if (v) { u.voice = v; u.lang = v.lang || 'en-US'; }
      u.rate = window.RWND_GET_RATE();
      u.pitch = window.RWND_GET_PITCH();
      u.volume = 0.92;
      try { window.speechSynthesis.speak(u); } catch (err) {}
    }
  };

  window.RWND_VOICE_NAME = function () { var v = pickVoice(); return v ? v.name : ''; };
})();
