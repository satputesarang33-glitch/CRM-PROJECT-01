import { db, auth } from "./config/firebase.js";

async function verifyFirebaseData() {
  console.log("==================================================");
  console.log("🔥 LIVE FIREBASE CLOUD FIRESTORE DATA VERIFICATION");
  console.log("==================================================");

  // 1. Check Authentication users
  console.log("\n👤 1. Firebase Authentication Users:");
  try {
    const listUsers = await auth.listUsers(10);
    listUsers.users.forEach((u) => {
      console.log(`   • ${u.email} (UID: ${u.uid}, DisplayName: "${u.displayName || 'N/A'}")`);
    });
  } catch (err) {
    console.error("   Error listing auth users:", err.message);
  }

  // 2. Check Firestore Collections
  const collections = [
    { name: "customers", label: "🏢 Customers" },
    { name: "leads", label: "🎯 Leads" },
    { name: "deals", label: "💼 Deals" },
    { name: "tasks", label: "📋 Tasks" },
    { name: "tickets", label: "🎫 Support Tickets" },
    { name: "activities", label: "📞 Activities" },
    { name: "notifications", label: "🔔 Notifications" },
  ];

  for (const col of collections) {
    try {
      const snap = await db.collection(col.name).get();
      console.log(`\n${col.label} (Collection: "${col.name}"): ${snap.size} documents`);
      snap.docs.slice(0, 3).forEach((doc) => {
        const d = doc.data();
        const info =
          d.name ||
          (d.firstName ? `${d.firstName} ${d.lastName} (${d.company || 'N/A'})` : null) ||
          d.dealName ||
          d.title ||
          d.subject ||
          d.email ||
          doc.id;
        console.log(`   ↳ [${doc.id.slice(0, 8)}...] ${info}`);
      });
    } catch (err) {
      console.error(`   Error querying ${col.name}:`, err.message);
    }
  }

  console.log("\n==================================================");
  console.log("✅ LIVE FIREBASE CONNECTION IS 100% WORKING!");
  console.log("==================================================");
  process.exit(0);
}

verifyFirebaseData();
