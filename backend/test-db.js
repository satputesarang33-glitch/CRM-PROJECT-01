import { db } from "./config/firebase.js";

async function testConnection() {
  console.log("Testing Firebase Firestore connection...");
  try {
    const snapshot = await db.collection("customers").limit(5).get();
    console.log("✅ Firebase Firestore connected successfully!");
    console.log(`Customers found in test query: ${snapshot.size}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Firebase Firestore connection error:", error.message);
    process.exit(1);
  }
}

testConnection();
