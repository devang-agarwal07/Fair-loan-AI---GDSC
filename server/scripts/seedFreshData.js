/**
 * Seed script — Truncates all existing data and inserts 200 realistic Indian farmer entries.
 * Run: node scripts/seedFreshData.js
 */
require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();
const COLLECTION = 'farmers';  // Must match firebaseDB.js

// Helper: random int between min and max (inclusive)
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper: random float with 1 decimal
const randFloat = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
// Helper: pick random from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper: pick N random from array
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
};

// Regional profiles — realistic ranges based on actual Indian agricultural data
const REGIONAL_PROFILES = [
  {
    region: 'Vidarbha, Maharashtra',
    land: [0.5, 8], income: [30000, 200000], savings: [0, 40000],
    livestock: [5000, 80000], equipment: [0, 50000], crops: ['cotton', 'pulses', 'other'],
    irrigated: 0.25, expenses: [4000, 12000], yield: [2, 8],
  },
  {
    region: 'Amravati, Maharashtra',
    land: [1, 10], income: [40000, 250000], savings: [5000, 60000],
    livestock: [10000, 100000], equipment: [5000, 80000], crops: ['cotton', 'pulses', 'sugarcane'],
    irrigated: 0.35, expenses: [5000, 14000], yield: [3, 10],
  },
  {
    region: 'Yavatmal, Maharashtra',
    land: [0.5, 6], income: [25000, 180000], savings: [0, 30000],
    livestock: [5000, 60000], equipment: [0, 40000], crops: ['cotton', 'pulses'],
    irrigated: 0.2, expenses: [3500, 10000], yield: [2, 7],
  },
  {
    region: 'Ludhiana, Punjab',
    land: [3, 25], income: [200000, 1200000], savings: [30000, 300000],
    livestock: [20000, 200000], equipment: [50000, 500000], crops: ['wheat', 'rice'],
    irrigated: 0.95, expenses: [10000, 35000], yield: [15, 45],
  },
  {
    region: 'Amritsar, Punjab',
    land: [2, 20], income: [180000, 1000000], savings: [20000, 250000],
    livestock: [15000, 180000], equipment: [40000, 400000], crops: ['wheat', 'rice'],
    irrigated: 0.92, expenses: [8000, 30000], yield: [12, 40],
  },
  {
    region: 'Bathinda, Punjab',
    land: [4, 30], income: [220000, 1500000], savings: [40000, 400000],
    livestock: [20000, 250000], equipment: [60000, 600000], crops: ['wheat', 'rice', 'cotton'],
    irrigated: 0.9, expenses: [10000, 40000], yield: [14, 42],
  },
  {
    region: 'Muzaffarpur, Bihar',
    land: [0.3, 4], income: [20000, 120000], savings: [0, 20000],
    livestock: [5000, 40000], equipment: [0, 20000], crops: ['rice', 'wheat', 'vegetables'],
    irrigated: 0.4, expenses: [3000, 8000], yield: [3, 12],
  },
  {
    region: 'Patna, Bihar',
    land: [0.5, 5], income: [30000, 160000], savings: [2000, 30000],
    livestock: [5000, 50000], equipment: [5000, 30000], crops: ['rice', 'wheat', 'vegetables'],
    irrigated: 0.5, expenses: [3500, 10000], yield: [4, 15],
  },
  {
    region: 'Darbhanga, Bihar',
    land: [0.2, 3], income: [15000, 90000], savings: [0, 15000],
    livestock: [3000, 30000], equipment: [0, 15000], crops: ['rice', 'wheat'],
    irrigated: 0.3, expenses: [2500, 7000], yield: [3, 10],
  },
  {
    region: 'Guntur, Andhra Pradesh',
    land: [1, 12], income: [60000, 450000], savings: [10000, 100000],
    livestock: [10000, 120000], equipment: [10000, 150000], crops: ['rice', 'cotton', 'pulses'],
    irrigated: 0.65, expenses: [5000, 18000], yield: [6, 25],
  },
  {
    region: 'East Godavari, Andhra Pradesh',
    land: [1, 10], income: [80000, 500000], savings: [15000, 120000],
    livestock: [10000, 100000], equipment: [15000, 200000], crops: ['rice', 'sugarcane'],
    irrigated: 0.8, expenses: [6000, 20000], yield: [8, 30],
  },
  {
    region: 'Kurnool, Andhra Pradesh',
    land: [1, 8], income: [40000, 280000], savings: [5000, 60000],
    livestock: [8000, 80000], equipment: [5000, 100000], crops: ['cotton', 'pulses', 'rice'],
    irrigated: 0.45, expenses: [4000, 14000], yield: [4, 15],
  },
  {
    region: 'Indore, Madhya Pradesh',
    land: [2, 15], income: [80000, 500000], savings: [10000, 100000],
    livestock: [10000, 120000], equipment: [20000, 200000], crops: ['wheat', 'pulses', 'sugarcane'],
    irrigated: 0.6, expenses: [6000, 20000], yield: [6, 22],
  },
  {
    region: 'Jabalpur, Madhya Pradesh',
    land: [1, 10], income: [50000, 300000], savings: [5000, 60000],
    livestock: [8000, 90000], equipment: [10000, 120000], crops: ['wheat', 'rice', 'pulses'],
    irrigated: 0.5, expenses: [5000, 15000], yield: [5, 18],
  },
  {
    region: 'Jaipur, Rajasthan',
    land: [2, 20], income: [60000, 400000], savings: [5000, 80000],
    livestock: [15000, 150000], equipment: [10000, 150000], crops: ['wheat', 'pulses', 'other'],
    irrigated: 0.35, expenses: [5000, 18000], yield: [3, 12],
  },
  {
    region: 'Jodhpur, Rajasthan',
    land: [3, 25], income: [40000, 300000], savings: [0, 50000],
    livestock: [20000, 200000], equipment: [5000, 100000], crops: ['pulses', 'wheat', 'other'],
    irrigated: 0.15, expenses: [4000, 15000], yield: [1.5, 8],
  },
  {
    region: 'Thanjavur, Tamil Nadu',
    land: [1, 8], income: [80000, 400000], savings: [15000, 100000],
    livestock: [5000, 60000], equipment: [15000, 180000], crops: ['rice', 'sugarcane'],
    irrigated: 0.85, expenses: [7000, 22000], yield: [10, 35],
  },
  {
    region: 'Coimbatore, Tamil Nadu',
    land: [1, 10], income: [100000, 500000], savings: [20000, 150000],
    livestock: [5000, 50000], equipment: [20000, 250000], crops: ['vegetables', 'sugarcane', 'cotton'],
    irrigated: 0.7, expenses: [8000, 25000], yield: [8, 28],
  },
  {
    region: 'Warangal, Telangana',
    land: [1, 10], income: [50000, 350000], savings: [5000, 80000],
    livestock: [10000, 100000], equipment: [10000, 150000], crops: ['rice', 'cotton', 'pulses'],
    irrigated: 0.55, expenses: [5000, 16000], yield: [5, 20],
  },
  {
    region: 'Gorakhpur, Uttar Pradesh',
    land: [0.5, 5], income: [30000, 180000], savings: [2000, 30000],
    livestock: [5000, 60000], equipment: [5000, 40000], crops: ['rice', 'wheat', 'sugarcane'],
    irrigated: 0.55, expenses: [4000, 12000], yield: [4, 15],
  },
  {
    region: 'Lucknow, Uttar Pradesh',
    land: [1, 8], income: [50000, 300000], savings: [5000, 60000],
    livestock: [8000, 80000], equipment: [10000, 100000], crops: ['wheat', 'rice', 'sugarcane'],
    irrigated: 0.6, expenses: [5000, 15000], yield: [5, 20],
  },
  {
    region: 'Belgaum, Karnataka',
    land: [1, 10], income: [60000, 400000], savings: [10000, 80000],
    livestock: [10000, 100000], equipment: [10000, 150000], crops: ['sugarcane', 'rice', 'vegetables'],
    irrigated: 0.55, expenses: [5000, 18000], yield: [6, 22],
  },
  {
    region: 'Mysuru, Karnataka',
    land: [1, 8], income: [70000, 350000], savings: [10000, 90000],
    livestock: [8000, 80000], equipment: [15000, 180000], crops: ['rice', 'sugarcane', 'other'],
    irrigated: 0.6, expenses: [6000, 20000], yield: [7, 25],
  },
  {
    region: 'Malda, West Bengal',
    land: [0.3, 4], income: [25000, 150000], savings: [0, 25000],
    livestock: [5000, 40000], equipment: [0, 30000], crops: ['rice', 'wheat', 'vegetables'],
    irrigated: 0.45, expenses: [3000, 9000], yield: [4, 14],
  },
  {
    region: 'Burdwan, West Bengal',
    land: [0.5, 5], income: [35000, 200000], savings: [3000, 40000],
    livestock: [5000, 50000], equipment: [5000, 50000], crops: ['rice', 'wheat', 'vegetables'],
    irrigated: 0.55, expenses: [3500, 11000], yield: [5, 18],
  },
];

function generateEntry(profile) {
  const land = randFloat(profile.land[0], profile.land[1]);
  const income = randInt(profile.income[0], profile.income[1]);
  const irrigated = Math.random() < profile.irrigated;
  const household = randInt(2, 8);
  const loanCount = randInt(0, 3);

  return {
    id: `seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    submitted_at: new Date(Date.now() - randInt(0, 90 * 86400000)).toISOString(),
    region: profile.region,
    land_size_acres: land,
    land_ownership: pick(['owned', 'owned', 'owned', 'leased', 'shared']),
    crop_types: pickN(profile.crops, randInt(1, Math.min(3, profile.crops.length))),
    annual_income_inr: income,
    income_regularity: pick(['seasonal', 'seasonal', 'year-round', 'irregular']),
    off_season_income: Math.random() < 0.4 ? randInt(5000, Math.min(income * 0.3, 100000)) : 0,
    total_savings_inr: randInt(profile.savings[0], profile.savings[1]),
    assets: {
      livestock_value_inr: randInt(profile.livestock[0], profile.livestock[1]),
      equipment_value_inr: randInt(profile.equipment[0], profile.equipment[1]),
      vehicle_value_inr: Math.random() < 0.3 ? randInt(20000, 300000) : 0,
      gold_value_inr: Math.random() < 0.4 ? randInt(10000, 200000) : 0,
      property_other_inr: Math.random() < 0.15 ? randInt(50000, 500000) : 0,
    },
    monthly_expenses_inr: randInt(profile.expenses[0], profile.expenses[1]),
    household_size: household,
    existing_loans: {
      count: loanCount,
      total_outstanding_inr: loanCount > 0 ? randInt(10000, Math.min(income * 2, 500000)) : 0,
      sources: loanCount > 0 ? pickN(['bank', 'microfinance', 'moneylender', 'family'], randInt(1, 2)) : [],
    },
    past_defaults: Math.random() < 0.08,
    irrigation_access: irrigated,
    market_distance_km: randInt(2, 50),
    average_yield_quintals_per_acre: irrigated
      ? randFloat(profile.yield[0] * 1.5, profile.yield[1])
      : randFloat(profile.yield[0], profile.yield[1] * 0.6),
  };
}

async function truncateCollection() {
  // Delete from the main 'farmers' collection
  console.log('Truncating farmers collection...');
  const snapshot = await db.collection(COLLECTION).get();
  if (snapshot.size > 0) {
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted ${snapshot.size} entries from '${COLLECTION}'.`);
  } else {
    console.log(`'${COLLECTION}' was already empty.`);
  }

  // Also clean up the orphaned 'community_dataset' collection if it exists
  console.log('Cleaning up orphaned community_dataset collection...');
  const oldSnapshot = await db.collection('community_dataset').get();
  if (oldSnapshot.size > 0) {
    // Firestore batch limit is 500, split if needed
    const docs = oldSnapshot.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = db.batch();
      docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    console.log(`Deleted ${oldSnapshot.size} entries from 'community_dataset'.`);
  } else {
    console.log(`'community_dataset' was already empty.`);
  }
}

async function seedData() {
  console.log('Generating 200 realistic entries...\n');
  const entries = [];

  // Distribute entries across regions (total = 200)
  const distribution = [
    12, 10, 8,    // Vidarbha, Amravati, Yavatmal (Maharashtra — cotton belt, high distress)
    10, 10, 8,    // Ludhiana, Amritsar, Bathinda (Punjab — Green Revolution belt)
    10, 8, 8,     // Muzaffarpur, Patna, Darbhanga (Bihar — small holdings)
    8, 8, 8,      // Guntur, East Godavari, Kurnool (Andhra Pradesh)
    8, 8,         // Indore, Jabalpur (MP)
    8, 6,         // Jaipur, Jodhpur (Rajasthan)
    8, 6,         // Thanjavur, Coimbatore (Tamil Nadu)
    6,            // Warangal (Telangana)
    8, 8,         // Gorakhpur, Lucknow (UP)
    8, 6,         // Belgaum, Mysuru (Karnataka)
    6, 6,         // Malda, Burdwan (West Bengal)
  ];

  for (let i = 0; i < REGIONAL_PROFILES.length; i++) {
    const count = distribution[i] || 6;
    for (let j = 0; j < count; j++) {
      entries.push(generateEntry(REGIONAL_PROFILES[i]));
    }
  }

  // Trim to exactly 200
  const finalEntries = entries.slice(0, 200);

  console.log(`Generated ${finalEntries.length} entries across ${REGIONAL_PROFILES.length} regions.`);
  console.log('Uploading to Firestore...\n');

  // Upload in batches of 20 (Firestore batch limit is 500)
  for (let i = 0; i < finalEntries.length; i += 20) {
    const batch = db.batch();
    const chunk = finalEntries.slice(i, i + 20);
    chunk.forEach(entry => {
      const ref = db.collection(COLLECTION).doc(entry.id);
      batch.set(ref, entry);
    });
    await batch.commit();
    console.log(`  Uploaded ${Math.min(i + 20, finalEntries.length)}/${finalEntries.length}`);
  }

  // Print summary
  const regionCounts = {};
  finalEntries.forEach(e => {
    regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
  });

  console.log('\n✅ Seeding complete! Distribution:');
  Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      const avgIncome = Math.round(
        finalEntries.filter(e => e.region === region)
          .reduce((sum, e) => sum + e.annual_income_inr, 0) / count
      );
      console.log(`  ${region}: ${count} entries (avg income: ₹${avgIncome.toLocaleString()})`);
    });
}

async function main() {
  try {
    await truncateCollection();
    await seedData();
    console.log('\n🎉 Done! 200 fresh entries are now in Firestore.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();
