const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { saveEntry } = require('../utils/firebaseDB');
const data = require('../data/community_dataset.json');

async function run() {
  console.log(`Importing ${data.length} entries...`);
  for (const entry of data) {
    await saveEntry(entry);
    console.log(`✅ Imported: ${entry.id}`);
  }
  console.log('Done!');
  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
