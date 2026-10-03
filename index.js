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
    if (isLogged) return; 
    isLogged = true;
    
    console.log(`[${hesap.username}] Sunucuya katildi, bekliyor...`);
    
    setTimeout(() => {
      bot.chat('/login ' + hesap.pass);
      console.log(`[${hesap.username}] Sifre yazildi. Skyblock'a geciliyor...`);
      
      setTimeout(() => {
        // Zıplama KESİNLİKLE YOK! Put gibi durup komut atıyor:
        bot.chat('/skyblock');
        console.log(`[${hesap.username}] /skyblock komutu atildi.`);
        
        setTimeout(() => {
          bot.chat('/tpa Schxy'); 
          console.log(`[${hesap.username}] TPA istegi gonderildi.`);
        }, 10000); // 10 saniye skyblock'a bağlanmasını bekler
        
      }, 5000); // Şifre girdikten sonra 5 sn bekler
    }, 3000); // Oyuna girince 3 sn bekler
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

hesaplar.forEach((hesap, index) => {
  setTimeout(() => {
    console.log(`[BAŞLATILIYOR] ${hesap.username} oyuna sokuluyor...`);
    createBot(hesap);
  }, 10000 * index);
});
