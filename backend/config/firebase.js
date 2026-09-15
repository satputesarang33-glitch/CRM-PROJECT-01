import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

// Import your service account JSON file
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

dotenv.config();

// Step 1: Initialize Firebase Admin App (check if already initialized)
const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
      });

// Step 2: Initialize the 3 main Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const bucket = storage.bucket(
  `${serviceAccount.project_id}.firebasestorage.app`,
);

console.log("✅ Firebase initialized successfully");

// Step 3: Export services for routes and controllers to use
export { app, db, auth, storage, bucket, FieldValue };
export default db;
