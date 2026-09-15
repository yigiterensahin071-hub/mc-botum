const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// --- AYARLAR (BURALARI KENDİNE GÖRE DÜZENLE) ---
const SERVER_IP = 'sunucu_adresi_buraya.com'; // Oynadığın sunucunun IP adresi
const SERVER_PORT = 25565; // Genelde 25565'tir, farklıysa değiştir
const BOT_USERNAME = 'AfkKral'; // Botun oyundaki adı
// ----------------------------------------------

// Web Sunucusu (UptimeRobot'un botu uyanık tutması için)
app.get('/', (req, res) => {
  res.send('Bot aktif ve çalışıyor!');
});
app.listen(3000, () => {
  console.log('Web sunucusu başlatıldı.');
});

// Minecraft Bot Bağlantısı
function createBot() {
  const bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_USERNAME
  });

  bot.on('login', () => {
    console.log(`${bot.username} sunucuya başarıyla giriş yaptı!`);
  });

  bot.on('end', () => {
    console.log('Bot sunucudan düştü. 10 saniye sonra tekrar bağlanılıyor...');
    setTimeout(createBot, 10000); // Düşerse 10 saniye sonra otomatik tekrar girer
  });

  bot.on('error', (err) => {
    console.log('Bir hata oluştu:', err);
  });
}

createBot();
