const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function loadDataset() {
  const snapshot = await db.collection('farmers').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function saveEntry(entry) {
  const { id, ...data } = entry;
  const docRef = await db.collection('farmers').add(data);
  return { ...data, id: docRef.id };
}

module.exports = { loadDataset, saveEntry, db };
