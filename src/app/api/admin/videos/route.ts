import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json(
                { error: "Database not initialized" },
                { status: 500 }
            );
        }

        const videosSnapshot = await adminDb
            .collection("videoAnalyses")
            .orderBy("timestamp", "desc")
            .get();
        const videos = videosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ videos });
    } catch (error) {
        console.error("Error fetching videos:", error);
        return NextResponse.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        if (!adminDb) {
            return NextResponse.json(
                { error: "Database not initialized" },
                { status: 500 }
            );
        }

        const videoData = await request.json();
        const { videoId, ...updateData } = videoData;

        if (!videoId) {
            return NextResponse.json(
                { error: "Video ID is required" },
                { status: 400 }
            );
        }

        // Update timestamp
        updateData.timestamp = new Date().toISOString();

        await adminDb
            .collection("videoAnalyses")
            .doc(videoId)
            .update(updateData);
        console.log("Video updated successfully:", videoId);

        return NextResponse.json({ success: true, videoId });
    } catch (error) {
        console.error("Error updating video:", error);
        return NextResponse.json(
            {
                error: "Failed to update video",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        if (!adminDb) {
            return NextResponse.json(
                { error: "Database not initialized" },
                { status: 500 }
            );
        }

        const url = new URL(request.url);
        const videoId = url.searchParams.get("videoId");

        if (!videoId) {
            return NextResponse.json(
                { error: "Video ID is required" },
                { status: 400 }
            );
        }

        await adminDb.collection("videoAnalyses").doc(videoId).delete();
        console.log("Video deleted successfully:", videoId);

        return NextResponse.json({ success: true, videoId });
    } catch (error) {
        console.error("Error deleting video:", error);
        return NextResponse.json(
            {
                error: "Failed to delete video",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
