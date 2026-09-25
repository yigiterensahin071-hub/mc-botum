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
  
  // --- OTOMATİK KESE FABRİKASI DEĞİŞKENLERİ VE FONKSİYONLARI ---
  let otomatikKese = false;

  const bekle = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function menuBekle(kelime, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const zamanAsimi = setTimeout(() => {
        bot.removeListener('windowOpen', dinle);
        resolve(null);
      }, timeout);

      function dinle(window) {
        const baslik = window.title ? window.title.toString() : '';
        if (baslik.includes(kelime) || baslik.includes(kelime.toUpperCase())) {
          clearTimeout(zamanAsimi);
          bot.removeListener('windowOpen', dinle);
          resolve(window);
        }
      }
      bot.on('windowOpen', dinle);
    });
  }

  async function envanteriYereAt() {
    const esyalar = bot.inventory.items();
    for (const esya of esyalar) {
      try {
        await bot.tossStack(esya);
        await bekle(300);
      } catch (e) {}
    }
  }

  async function keseDongusu() {
    if (!otomatikKese) return;

    try {
      // 1. Çiftçiyi Aç
      bot.chat('/çiftçi menü');
      let ciftciMenu = await menuBekle('Çiftçi');
      if (ciftciMenu) {
        await bekle(500);
        // Buğdaya Shift + Sağ Tık
        await bot.clickWindow(19, 1, 1);
        await bekle(300);
        bot.closeWindow(ciftciMenu);
      }
      await bekle(500);

      if (!otomatikKese) return;
      if (bot.currentWindow) bot.closeWindow(bot.currentWindow);

      // 2. Ada Tüccarına SAĞ TIKLA
      const npc = bot.nearestEntity(e => e.id !== bot.entity.id && (e.type === 'player' || e.type === 'mob'));
      if (npc) {
        bot.activateEntity(npc);
      } else {
        console.log('Tıklanacak NPC bulunamadı!');
        bot.chat('/msg Schxy Etrafımda tüccar bulamadım kanka, döngü durdu.');
        otomatikKese = false;
        return;
      }

      // 3. Aşama Menüsü
      let asamaMenu = await menuBekle('Tüccar'); 
      if (asamaMenu) {
        await bekle(500);
        // 4. Aşama Zümrüte Sol Tık
        await bot.clickWindow(23, 0, 0); 
        
        // 4. Takas Eşyaları Menüsü
        let takasMenu = await menuBekle('Takas');
        if (takasMenu) {
          await bekle(500);
          // Buğday Kesesine Shift + Sağ Tık
          await bot.clickWindow(38, 1, 1);
          await bekle(400);

          // 2 Defa ESC (Çıkış)
          if (bot.currentWindow) bot.closeWindow(bot.currentWindow);
          await bekle(400); 
          if (bot.currentWindow) bot.closeWindow(bot.currentWindow); 
          await bekle(200); 
          
          // Keseleri (ve varsa kalanları) yere at
          await envanteriYereAt();

        } else {
          if (bot.currentWindow) bot.closeWindow(bot.currentWindow);
        }
      }

      await bekle(1000); 

      // Sonsuz Döngü
      if (otomatikKese) {
        keseDongusu();
      }

    } catch (err) {
      console.log('Hata oldu, baştan deneniyor...', err.message);
      if (bot.currentWindow) bot.closeWindow(bot.currentWindow);
      if (otomatikKese) setTimeout(keseDongusu, 2000);
    }
  }
  // -------------------------------------------------------------

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

      // YENİ EKLENEN KOMUTLAR: !basla ve !dur
      if (msg.includes('!basla')) {
        if (!otomatikKese) {
          otomatikKese = true;
          bot.chat('/msg Schxy Otomatik bugday kesesi fabrikasi calistirildi! Altima hunileri koymayi unutma.');
          keseDongusu();
        } else {
          bot.chat('/msg Schxy Zaten calisiyorum kanka!');
        }
      }

      if (msg.includes('!dur')) {
        otomatikKese = false;
        bot.chat('/msg Schxy Fabrikayi durdurdum.');
      }
      
      if (msg.includes('!ver')) {
        bot.chat('/tpa Schxy');
        
        const items = bot.inventory.items();
        if (items.length === 0) {
          bot.chat('Ustte atilacak hicbir sey yok kanka!');
        } else {
          bot.chat('Hareket edip ' + items.length + ' esyayi atiyorum...');
          
          (async () => {
            // 1. ADIM: 1 Blok İleri yürü
            bot.setControlState('forward', true);
            await new Promise(r => setTimeout(r, 400));
            bot.setControlState('forward', false);
            
            // 2. ADIM: 1 Blok Geri yürü (Havuzdan düşmemek için eski yerine dön)
            bot.setControlState('back', true);
            await new Promise(r => setTimeout(r, 400));
            bot.setControlState('back', false);
            
            // 3. ADIM: Anti-Cheat'i atlattık, şimdi eşyaları at
            for (const item of items) {
              try {
                await bot.equip(item, 'hand');
                await new Promise(r => setTimeout(r, 400)); 
                
                if (bot.heldItem) {
                  await bot.tossStack(bot.heldItem);
                  await new Promise(r => setTimeout(r, 600)); 
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
