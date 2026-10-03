const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Botlar aktif!'));
app.listen(process.env.PORT || 3000, () => console.log('Web sunucusu calisiyor'));

process.on('uncaughtException', (err) => {
  console.log('Yoksayilan hata:', err.message);
});

// "Ignoring block entities as chunk failed to load" spamini loglardan temizle (zararsiz uyari)
for (const fn of ['log', 'warn']) {
  const orig = console[fn].bind(console);
  console[fn] = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('Ignoring block entities')) return;
    orig(...args);
  };
}

// --- AYARLAR ---
const HOST = 'play.reborncraft.pw';
const PORT = 25565;
const VERSION = '1.16.5';
const OWNERS = ['Schxy', 'aForse'];      // !gel diyebilecek kisiler
const FIRST_TPA_TARGET = 'Schxy';        // oyuna girince ilk TPA atilacak kisi

const hesaplar = [
  { username: 'AfkKralll',  pass: 'Sifre12345' },
  { username: 'AfkKrallll', pass: 'Sifre12345' }
];

const START_GAP_MS = 20000;              // botlar arasi giris araligi (anti-bot icin)
const RECONNECT_MS = 20000;              // normal yeniden baglanma
const GHOST_RECONNECT_MS = 60000;        // "zaten baglandiniz" hatasinda bekleme
const SKYBLOCK_RETRY_MS = 15000;         // /skyblock tekrar deneme araligi
const SKYBLOCK_MAX_TRY = 4;

function createBot(hesap) {
  const tag = `[${hesap.username}]`;
  const log = (...a) => console.log(tag, ...a);

  let alive = true;
  let state = 'connecting';   // connecting -> auth -> toSkyblock -> ready
  let authDone = false;
  let lastAuthAt = 0;
  let skyblockTry = 0;
  let reconnectDelay = RECONNECT_MS;
  const timers = new Set();

  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (alive) fn();
    }, ms);
    timers.add(t);
    return t;
  };

  const say = (text) => {
    if (!alive) return;
    try { bot.chat(text); } catch (e) { log('chat hatasi:', e.message); }
  };

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: hesap.username,
    version: VERSION
  });

  bot.on('error', (err) => log('HATA:', err.message));

  bot.on('kicked', (reason) => {
    let text = typeof reason === 'string' ? reason : JSON.stringify(reason);
    log('ATILDI:', text);
    // Onceki baglanti sunucuda hayalet olarak kaldiysa daha uzun bekle
    if (/zaten ba/i.test(text) || /already/i.test(text)) reconnectDelay = GHOST_RECONNECT_MS;
  });

  // ---- GIRIS (login / register) ----
  function authenticate(kind) {
    const now = Date.now();
    if (now - lastAuthAt < 3000) return;   // ayni anda iki kez yazma
    lastAuthAt = now;
    if (kind === 'register') {
      log('Kayit gerekiyor, /register yaziliyor...');
      say(`/register ${hesap.pass} ${hesap.pass}`);
    } else {
      log('/login yaziliyor...');
      say(`/login ${hesap.pass}`);
    }
    if (!authDone) {
      authDone = true;
      state = 'toSkyblock';
      later(goSkyblock, 6000);
    }
  }

  // ---- SKYBLOCK'A GECIS ----
  function goSkyblock() {
    if (state !== 'toSkyblock') return;
    skyblockTry++;
    if (skyblockTry > SKYBLOCK_MAX_TRY) {
      // Sunucu degisim sinyali gelmediyse de devam et
      log('Skyblock gecisi dogrulanamadi, yine de devam ediliyor.');
      arrivedSkyblock();
      return;
    }
    log(`/skyblock yaziliyor (deneme ${skyblockTry}/${SKYBLOCK_MAX_TRY})`);
    say('/skyblock');
    later(goSkyblock, SKYBLOCK_RETRY_MS);
  }

  function arrivedSkyblock() {
    if (state === 'ready') return;
    state = 'ready';
    log('Skyblock\'a gecildi, TPA atilacak...');
    later(() => {
      say(`/tpa ${FIRST_TPA_TARGET}`);
      log('TPA istegi gonderildi.');
    }, 8000);
  }

  bot.on('spawn', () => {
    if (state === 'connecting') {
      state = 'auth';
      log('Sunucuya katildi, giris bekleniyor...');
      // Sunucu /login istemezse (mesaj gelmezse) yine de dene
      later(() => { if (!authDone) authenticate('login'); }, 5000);
      return;
    }
    // /skyblock yazildiktan sonra gelen yeni spawn = dunya/sunucu degisti
    if (state === 'toSkyblock' && skyblockTry > 0) {
      arrivedSkyblock();
    }
  });

  bot.on('respawn', () => {
    if (state === 'toSkyblock' && skyblockTry > 0) arrivedSkyblock();
  });

  bot.on('message', (message) => {
    const msg = message.toString();
    const lower = msg.toLowerCase();

    // Kurulum asamasinda sunucu mesajlarini logla (sorun tespiti icin)
    if (state !== 'ready' && msg.trim()) log('SUNUCU:', msg.trim().slice(0, 150));

    // Sunucu bizden kayit / giris istiyorsa
    if (!authDone || state === 'auth') {
      if (lower.includes('/register') && !lower.includes('/login')) return authenticate('register');
      if (lower.includes('/login')) return authenticate('login');
    }

    // Komutlar
    const komutuVeren = OWNERS.find((o) => msg.includes(o));
    if (!komutuVeren) return;

    if (msg.includes('!gel')) say(`/tpa ${komutuVeren}`);
    if (msg.includes('!kabul')) say('/tpaccept');
    if (msg.includes('!zıpla')) {
      bot.setControlState('jump', true);
      later(() => bot.setControlState('jump', false), 1500);
    }
  });

  bot.on('end', () => {
    alive = false;
    timers.forEach(clearTimeout);
    timers.clear();
    log(`Baglanti koptu, ${reconnectDelay / 1000} sn sonra tekrar denenecek.`);
    setTimeout(() => createBot(hesap), reconnectDelay);
  });
}

// Botlari aralikli sok (ayni anda girip anti-bot'a takilmasinlar)
hesaplar.forEach((hesap, i) => {
  setTimeout(() => {
    console.log(`[BASLATILIYOR] ${hesap.username}`);
    createBot(hesap);
  }, START_GAP_MS * i);
});
