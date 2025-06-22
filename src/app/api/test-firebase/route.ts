import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
    try {
        console.log("Testing Firebase connection...");

        // Check if admin DB is initialized
        if (!adminDb) {
            return NextResponse.json(
                {
                    error: "Firebase admin not initialized",
                    env: {
                        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
                            ? "present"
                            : "missing",
                        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
                            ? "present"
                            : "missing",
                        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
                            ? "present"
                            : "missing",
                    },
                },
                { status: 500 }
            );
        }

        // Try to read from a collection
        const testRef = adminDb.collection("youtube-english");
        const snapshot = await testRef.limit(1).get();

        return NextResponse.json({
            success: true,
            message: "Firebase connection successful",
            collectionExists: !snapshot.empty,
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        });
    } catch (error) {
        console.error("Firebase test error:", error);
        return NextResponse.json(
            {
                error: "Firebase connection failed",
                details:
                    error instanceof Error ? error.message : "Unknown error",
                env: {
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
                        ? "present"
                        : "missing",
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
                        ? "present"
                        : "missing",
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
                        ? "present"
                        : "missing",
                },
            },
            { status: 500 }
        );
    }
}
