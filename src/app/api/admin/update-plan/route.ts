import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const { uid, newPlan } = await request.json();

        if (!uid || !newPlan) {
            return NextResponse.json(
                { error: "UID and newPlan are required" },
                { status: 400 }
            );
        }

        if (!adminDb) {
            console.error("Firebase admin not initialized");
            return NextResponse.json(
                { error: "Database not initialized" },
                { status: 500 }
            );
        }

        if (!["free", "plus", "pro"].includes(newPlan)) {
            return NextResponse.json(
                { error: "Invalid plan type" },
                { status: 400 }
            );
        }

        await adminDb.collection("users").doc(uid).update({
            plan: newPlan,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user plan:", error);
        return NextResponse.json(
            { error: "Failed to update user plan" },
            { status: 500 }
        );
    }
}
