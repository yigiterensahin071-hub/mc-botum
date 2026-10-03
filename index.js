const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Botlar aktif! Çift char devrede.'));
app.listen(3000, () => console.log('Web sunucusu calisiyor'));

process.on('uncaughtException', (err) => {
  console.log('Yoksayilan hata:', err.message);
});

// --- OYUNA GİRECEK HESAPLARIN LİSTESİ ---
const hesaplar = [
  { username: 'AfkKralll', pass: 'Sifre12345' },
  { username: 'AfkKrallll', pass: 'Sifre12345' }
];

function createBot(hesap) {
  const bot = mineflayer.createBot({ 
    host: 'play.reborncraft.pw', 
    port: 25565, 
    username: hesap.username, 
    version: false 
  });
  
  bot.on('error', (err) => console.log(`[${hesap.username}] Bot hatasi:`, err.message));
  bot.on('kicked', (reason) => console.log(`[${hesap.username}] Atildi:`, reason));
  
  bot.on('spawn', () => {
    console.log(`[${hesap.username}] Sunucuya katildi!`);
    
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    
    setTimeout(() => {
      bot.chat('/login ' + hesap.pass);
      setTimeout(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        bot.chat('/skyblock');
        setTimeout(() => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          bot.chat('/tpa Schxy'); // Sunucuya girince ilk iş patrona (sana) tpa atar
        }, 8000);
      }, 3000);
    }, 2000);
  });

  bot.on('message', (message) => {
    const msg = message.toString();
    
    // Komutu patronlardan (Schxy veya aForse) hangisi verdiğini tespit eder
    let komutuVeren = '';
    if (msg.includes('Schxy')) komutuVeren = 'Schxy';
    else if (msg.includes('aForse')) komutuVeren = 'aForse';
    
    // Eğer mesaj bizden biri tarafından yazıldıysa işlem yap
    if (komutuVeren !== '') {
      
      // Kim "gel" dediyse ona TPA atarlar
      if (msg.includes('!gel')) {
        bot.chat('/tpa ' + komutuVeren);
      }
      
      if (msg.includes('!kabul')) {
        bot.chat('/tpaccept');
      }
      
      if (msg.includes('!zıpla')) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 1500);
      }
    }
  });

  // Atılırsa 10 saniye sonra yeniden bağlanmayı dener
  bot.on('end', () => setTimeout(() => createBot(hesap), 10000));
}

// Listedeki botları 5'er saniye arayla oyuna sokar (Ban yememek için)
hesaplar.forEach((hesap, index) => {
  setTimeout(() => {
    createBot(hesap);
  }, 5000 * index);
});
