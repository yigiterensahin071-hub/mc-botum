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

  bot.on('message', async (message) => {
    const msg = message.toString();
    
    // Yalnızca sen yazdığında çalışır
    if (msg.includes('Schxy')) {
      if (msg.includes('!gel')) bot.chat('/tpa Schxy');
      if (msg.includes('!kabul')) bot.chat('/tpaccept');
      
      if (msg.includes('!zıpla')) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 1500);
      }
      
      if (msg.includes('!ver')) {
        const items = bot.inventory.items();
        if (items.length === 0) {
          bot.chat('/msg Schxy Ustum bombos kanka!');
        } else {
          bot.chat('/msg Schxy ' + items.length + ' cesit esya buldum, firlatiyorum!');
          // Await olmadan seri seri fırlatma denemesi
          for (const item of items) {
            try {
              bot.toss(item.type, item.metadata, item.count);
            } catch (e) {}
          }
        }
      }
    }
  });

  bot.on('end', () => setTimeout(createBot, 10000));
}
createBot();
