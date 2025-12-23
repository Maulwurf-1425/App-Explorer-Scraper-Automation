const gplay = require('google-play-scraper');
const { GoogleSpreadsheet } = require('google-spreadsheet');

async function startAutoScan() {
  // 1. Verbindung zum Google Sheet herstellen
  const doc = new GoogleSpreadsheet('DEINE_SHEET_ID');
  await doc.useServiceAccountAuth(require('./credentials.json'));
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  // 2. Alle Kategorien durchlaufen (z.B. FINANCE, GAME_ACTION, etc.)
  const categories = Object.values(gplay.category);
  
  for (let cat of categories) {
    console.log(`Scanne Kategorie: ${cat}`);
    
    // 3. Neue kostenlose Apps in dieser Kategorie abrufen
    const newApps = await gplay.list({
      category: cat,
      collection: gplay.collection.NEW_FREE,
      num: 20
    });

    for (let app of newApps) {
      // 4. Details scannen (FSK, Beschreibung, etc.)
      const details = await gplay.app({appId: app.appId});
      
      // 5. Check: Ist die App schon im Sheet? (Logik hier einfügen)
      // 6. Wenn neu: Zeile hinzufügen
      await sheet.addRow({
        Name: details.title,
        Entwickler: details.developer,
        Kategorie: details.genre,
        Kosten: details.free ? "Kostenlos" : details.priceText,
        Beschreibung: details.summary,
        FSK: details.contentRating,
        Icon: details.icon
      });
    }
  }
}
