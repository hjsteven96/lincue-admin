import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
    try {
        const videoData = await request.json();
        console.log("Received video data:", videoData);

        if (!videoData.videoId) {
            return NextResponse.json(
                { error: "Video ID is required" },
                { status: 400 }
            );
        }

        // Check if Firebase admin is properly initialized
        if (!adminDb) {
            console.error("Firebase admin not initialized");
            return NextResponse.json(
                { error: "Database not initialized" },
                { status: 500 }
            );
        }

        const docData = {
            videoId: videoData.videoId,
            youtubeTitle: videoData.title || "",
            youtubeDescription: videoData.description || "",
            thumbnailUrl: videoData.thumbnailUrl || "",
            duration: videoData.duration || 0,
            timestamp: new Date().toISOString(),
            analysis: videoData.analysis || {},
            transcript_text: videoData.transcript_text || "",
        };

        console.log("Attempting to save to Firestore:", docData);
        await adminDb
            .collection("videoAnalyses")
            .doc(videoData.videoId)
            .set(docData);
        console.log("Successfully saved to Firestore");

        return NextResponse.json({ success: true, videoId: videoData.videoId });
    } catch (error) {
        console.error("Error registering video:", error);
        let errorMessage = "An unknown error occurred.";
        let errorStack = undefined;
        if (error instanceof Error) {
            errorMessage = error.message;
            errorStack = error.stack;
        }
        console.error("Error details:", errorMessage);
        console.error("Error stack:", errorStack);
        return NextResponse.json(
            {
                error: "Failed to register video",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
