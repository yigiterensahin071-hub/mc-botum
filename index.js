const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot aktif!'));
app.listen(3000, () => console.log('Web sunucusu calisiyor'));

function createBot() {
  const bot = mineflayer.createBot({ host: 'play.reborncraft.pw', port: 25565, username: 'AfkKralll', version: false });
  
  bot.on('spawn', () => {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    bot.chat('/register Sifre12345 Sifre12345');
    
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

  // İSİM KONTROLÜ KALDIRILMIŞ DİNLEYİCİ
  bot.on('message', async (message) => {
    const msg = message.toString();
    
    if (msg.includes('!gel')) {
      bot.chat('/tpa Schxy');
    }
    
    if (msg.includes('!zıpla')) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 1500);
    }
    
    if (msg.includes('!kabul')) {
      bot.chat('/tpaccept');
    }
    
    if (msg.includes('!ver')) {
      bot.chat('Esyalar atiliyor...'); // Atmadan önce chate yazar
      try {
        const items = bot.inventory.items();
        for (const item of items) {
          try { await bot.tossStack(item); } catch (e) {}
        }
      } catch (err) {}
    }
  });

  bot.on('end', () => setTimeout(createBot, 10000));
}
createBot();
