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
    const [analysisData, setAnalysisData] =
        useState(`Analyze the provided video content and generate a structured JSON output. The JSON must contain two main fields: 'analysis' and 'transcript_text'.

The 'analysis' field must be an object containing:
- 'summary': A very concise summary of the video content (1-2 sentences) in Koraen.
- 'keywords': An array of 5 key terms that English learners might not know or find challenging.
- 'slang_expressions': An array of objects, where each object has 'expression' and 'meaning (meaning in Korean)'.
- 'main_questions': An array of 2 main questions based on the video content.

The 'transcript_text' field must contain a detailed transcript of the video, adhering strictly to the following segmentation rules:
1. Each segment must begin with a timestamp in the EXACT format [MM:SS], followed immediately by the text. Example: '[00:05] This is the text at 5 seconds.'
2. Create a new timestamped segment for every change in speaker.
3. If a single person speaks for an extended period, create a new timestamped segment after a natural pause or a shift in topic.
4. Crucially, ensure that no single segment represents more than 20 seconds of video time. Aim for shorter, more frequent segments (ideally every 10-15 seconds) for better readability.
5. Do NOT include any other timestamps or time ranges within the transcript text itself.

Ensure the entire output is a single, strictly valid JSON object."
{
"analysis": {
"summary": "여기에 영상 내용 요약 (1-2 문장)을 입력하세요.",
"keywords": [
"키워드1",
"키워드2",
"키워드3",
"키워드4",
"키워드5"
],
"slang_expressions": [
{
"expression": "슬랭표현1",
"meaning": "의미1"
},
{
"expression": "슬랭표현2",
"meaning": "의미2"
}
],
"main_questions": [
"주요 질문1",
"주요 질문2"
]
},
"transcript_text": "[00:00] 영상 스크립트가 타임스탬프와 함께 여기에 들어갑니다.\n[00:15] 새로운 스피커 또는 주제 변경 시 새로운 세그먼트를 시작합니다.\n[00:30] 각 세그먼트는 20초를 넘지 않도록 짧게 유지합니다. (10-15초가 Best)"
}`);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);
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

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(analysisData);
            setCopyStatus("Copied!");
            setTimeout(() => setCopyStatus(null), 2000); // Clear message after 2 seconds
        } catch (err) {
            console.error("Failed to copy text: ", err);
            setCopyStatus("Failed to copy!");
            setTimeout(() => setCopyStatus(null), 2000);
        }
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
                            rows={15}
                            // --- 수정된 부분 ---
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900 placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleCopyPrompt}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Copy Prompt
                        </button>
                        {copyStatus && (
                            <span className="ml-2 text-sm text-green-600">
                                {copyStatus}
                            </span>
                        )}
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
