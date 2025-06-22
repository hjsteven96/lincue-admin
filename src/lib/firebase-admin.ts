import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

console.log("Initializing Firebase Admin...");
console.log("Environment check:", {
    projectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
});

let adminDb: Firestore | null = null;

try {
    if (!getApps().length) {
        console.log("Creating new Firebase app...");
        const app = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
                    /\\n/g,
                    "\n"
                ),
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            }),
            // Explicitly specify the database URL for youtube-english
            databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}-default-rtdb.firebaseio.com/`,
        });
        console.log("Firebase app created successfully");

        // Initialize Firestore with specific database
        adminDb = getFirestore(app, "youtube-english");
        console.log(
            "Firestore initialized successfully with youtube-english database"
        );
    } else {
        console.log("Using existing Firebase app...");
        adminDb = getFirestore(getApps()[0], "youtube-english");
    }
} catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    adminDb = null;
}

export { adminDb };
