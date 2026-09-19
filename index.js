const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot aktif!'));
app.listen(3000, () => console.log('Web sunucusu calisiyor'));

process.on('uncaughtException', (err) => {
  console.log('Yoksayilan hata:', err.message);
});

function createBot() {
  const bot = mineflayer.createBot({ host: 'play.reborncraft.pw', port: 25565, username: 'AfkKralll', version: false });
  
  bot.on('error', (err) => console.log('Bot hatasi:', err.message));
  bot.on('kicked', (reason) => console.log('Atildi:', reason));
  
  bot.on('spawn', () => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    
    setTimeout(() => {
      bot.chat('/login Sifre12345');
      setTimeout(() => {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        bot.chat('/skyblock');
        setTimeout(() => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          bot.chat('/tpa Schxy');
        }, 8000);
      }, 3000);
    }, 2000);
  });

  bot.on('message', (message) => {
    const msg = message.toString();
    
    if (msg.includes('Schxy')) {
      if (msg.includes('!gel')) bot.chat('/tpa Schxy');
      if (msg.includes('!kabul')) bot.chat('/tpaccept');
      
      if (msg.includes('!zıpla')) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 1500);
      }
      
      if (msg.includes('!ver')) {
        // TPA atıp komutu aldığını belli etsin
        bot.chat('/tpa Schxy');
        
        const items = bot.inventory.items();
        if (items.length === 0) {
          bot.chat('Ustte atilacak hicbir sey yok!');
        } else {
          // Bizi duyduğunu chate de yazsın
          bot.chat('Insan gibi elime ala ala ' + items.length + ' esyayi atiyorum...');
          
          (async () => {
            for (const item of items) {
              try {
                // 1. ADIM: Eşyayı ana ele al (Gerçek insan gibi)
                await bot.equip(item, 'hand');
                await new Promise(r => setTimeout(r, 400)); // Eline gelmesini bekle
                
                // 2. ADIM: Eline aldıysa, elindeki yığını yere fırlat
                if (bot.heldItem) {
                  await bot.tossStack(bot.heldItem);
                  await new Promise(r => setTimeout(r, 600)); // Sunucu spam sanmasın diye bekle
                }
              } catch (e) {
                console.log("Firlatma hatasi:", e.message);
              }
            }
            bot.chat('Tum esyalari attim kanka!');
          })();
        }
      }
    }
  });

  bot.on('end', () => setTimeout(createBot, 10000));
}
createBot();
