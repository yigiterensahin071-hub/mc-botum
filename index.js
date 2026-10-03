const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Botlar aktif! Çift char devrede.'));
app.listen(3000, () => console.log('Web sunucusu calisiyor'));

process.on('uncaughtException', (err) => {
  console.log('Yoksayilan hata:', err.message);
});

const hesaplar = [
  { username: 'AfkKralll', pass: 'Sifre12345' },
  { username: 'AfkKrallll', pass: 'Sifre12345' }
];

function createBot(hesap) {
  let isLogged = false;

  const bot = mineflayer.createBot({ 
    host: 'play.reborncraft.pw', 
    port: 25565, 
    username: hesap.username, 
    version: '1.16.5' 
  });
  
  bot.on('error', (err) => console.log(`[${hesap.username}] HATA:`, err.message));
  bot.on('kicked', (reason) => console.log(`[${hesap.username}] ATILDI:`, JSON.stringify(reason)));
  
  bot.on('spawn', () => {
    // Sadece ilk girişte şifre gir, sunucu değiştirince (skyblock) tekrar şifre yazmaya çalışma
    if (isLogged) return; 
    isLogged = true;
    
    console.log(`[${hesap.username}] Sunucuya katildi, sifre girilecek...`);
    
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    
    setTimeout(() => {
      bot.chat('/login ' + hesap.pass);
      console.log(`[${hesap.username}] Sifre yazildi. Skyblock'a gecilmesi bekleniyor...`);
      
      // Lag ihtimaline karşı süreyi 3 saniyeden 5 saniyeye çıkardık
      setTimeout(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        bot.chat('/skyblock');
        console.log(`[${hesap.username}] /skyblock komutu atildi.`);
        
        setTimeout(() => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          bot.chat('/tpa Schxy'); 
          console.log(`[${hesap.username}] TPA istegi gonderildi.`);
        }, 10000); // TPA süresi de uzatıldı ki ada iyice yüklensin
      }, 5000);
    }, 2000);
  });

  bot.on('message', (message) => {
    const msg = message.toString();
    
    let komutuVeren = '';
    if (msg.includes('Schxy')) komutuVeren = 'Schxy';
    else if (msg.includes('aForse')) komutuVeren = 'aForse';
    
    if (komutuVeren !== '') {
      if (msg.includes('!gel')) bot.chat('/tpa ' + komutuVeren);
      if (msg.includes('!kabul')) bot.chat('/tpaccept');
      if (msg.includes('!zıpla')) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 1500);
      }
    }
  });

  bot.on('end', () => setTimeout(() => createBot(hesap), 15000));
}

// 2. Botu 10 saniye arayla sokuyoruz ki anti-bot'a takılmasın
hesaplar.forEach((hesap, index) => {
  setTimeout(() => {
    console.log(`[BAŞLATILIYOR] ${hesap.username} oyuna sokuluyor...`);
    createBot(hesap);
  }, 10000 * index);
});
