"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface YouTubeDetails {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: number;
    channelTitle: string;
}

export default function NewVideoPage() {
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeDetails, setYoutubeDetails] = useState<YouTubeDetails | null>(
        null
    );
    const [analysisData, setAnalysisData] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const fetchYouTubeDetails = async () => {
        if (!youtubeUrl.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/admin/youtube-details?url=${encodeURIComponent(
                    youtubeUrl
                )}`
            );

            if (response.ok) {
                const details = await response.json();
                setYoutubeDetails(details);
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to fetch video details");
            }
        } catch {
            setError("Error fetching video details");
        } finally {
            setLoading(false);
        }
    };

    const registerVideo = async () => {
        if (!youtubeDetails || !analysisData.trim()) {
            setError("Please complete all fields");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            let parsedAnalysis;
            try {
                parsedAnalysis = JSON.parse(analysisData);
            } catch {
                setError("Invalid JSON format in analysis data");
                setSubmitting(false);
                return;
            }

            const videoData = {
                videoId: youtubeDetails.videoId,
                title: youtubeDetails.title,
                description: youtubeDetails.description,
                thumbnailUrl: youtubeDetails.thumbnailUrl,
                duration: youtubeDetails.duration,
                analysis: parsedAnalysis.analysis || {},
                transcript_text: parsedAnalysis.transcript_text || "",
            };

            const response = await fetch("/api/admin/register-video", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(videoData),
            });

            if (response.ok) {
                alert("Video registered successfully!");
                router.push("/admin/videos");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to register video");
            }
        } catch {
            setError("Error registering video");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Video
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Step 1: YouTube URL Input */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Step 1: YouTube Video Information
                </h2>

                <div className="flex gap-4">
                    <input
                        type="url"
                        placeholder="Enter YouTube URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        // --- 수정된 부분 ---
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                        onClick={fetchYouTubeDetails}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Fetch Details"}
                    </button>
                </div>
            </div>

            {/* Step 2: Video Details and Analysis Input */}
            {youtubeDetails && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Step 2: Video Details & Analysis
                    </h2>

                    {/* YouTube Video Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Video Information
                            </h3>
                            <div className="space-y-2 text-sm text-gray-800">
                                <div>
                                    <strong>Title:</strong>{" "}
                                    {youtubeDetails.title}
                                </div>
                                <div>
                                    <strong>Channel:</strong>{" "}
                                    {youtubeDetails.channelTitle}
                                </div>
                                <div>
                                    <strong>Duration:</strong>{" "}
                                    {formatDuration(youtubeDetails.duration)}
                                </div>
                                <div>
                                    <strong>Video ID:</strong>{" "}
                                    {youtubeDetails.videoId}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">
                                Thumbnail
                            </h3>
                            {youtubeDetails.thumbnailUrl && (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={youtubeDetails.thumbnailUrl}
                                        alt="Video thumbnail"
                                        className="w-full max-w-xs rounded"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Analysis Data Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gemini Analysis Result (JSON format)
                        </label>
                        <textarea
                            value={analysisData}
                            onChange={(e) => setAnalysisData(e.target.value)}
                            placeholder={`{
  "analysis": {
    "summary": "Video summary here...",
    "keywords": ["keyword1", "keyword2"],
    "slang_expressions": [
      {"expression": "slang1", "meaning": "meaning1"}
    ],
    "main_questions": ["question1", "question2"]
  },
  "transcript_text": "Full transcript with timestamps..."
}`}
                            rows={15}
                            // --- 수정된 부분 ---
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={registerVideo}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {submitting ? "Registering..." : "Register Video"}
                        </button>
                        <button
                            onClick={() => router.push("/admin/videos")}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
