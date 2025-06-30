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
    const [uploadedSubtitleText, setUploadedSubtitleText] = useState("");
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const parseSrtContent = (srtContent: string): string => {
        const lines = srtContent.split(/\r?\n/);
        let formattedTranscript = "";
        let currentTextLines: string[] = [];
        let currentTimestamp = "";

        const formatTime = (timeStr: string): string => {
            // Handles both HH:MM:SS,ms and HH:MM:SS.ms formats
            const parts = timeStr.split(/[:,.]/);
            const minutes = parseInt(parts[1] || "0", 10);
            const seconds = parseInt(parts[2] || "0", 10);
            return `[${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}]`;
        };

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Check for timestamp pattern (e.g., 00:00:00,000 --> 00:00:00,000)
            if (
                trimmedLine.match(
                    /^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}$/
                )
            ) {
                if (currentTextLines.length > 0) {
                    const combinedText = currentTextLines.join(" ").trim();
                    if (combinedText) {
                        formattedTranscript += `${currentTimestamp} ${combinedText}\n`;
                    }
                    currentTextLines = []; // Reset for next block
                }
                const [startTime] = trimmedLine.split(" --> ");
                currentTimestamp = formatTime(startTime);
            } else if (trimmedLine === "" || /^[0-9]+$/.test(trimmedLine)) {
                // Ignore empty lines or sequence numbers (like '1', '2', etc.)
                continue;
            } else if (!trimmedLine.match(/^(\[[^\]]+\]|\(.*?\)|\{.*?\})$/i)) {
                // Add non-empty lines that are not directives like [Music]
                currentTextLines.push(trimmedLine);
            }
        }

        // Add any remaining text after the last timestamp
        if (currentTextLines.length > 0) {
            const combinedText = currentTextLines.join(" ").trim();
            if (combinedText) {
                formattedTranscript += `${currentTimestamp} ${combinedText}\n`;
            }
        }

        return formattedTranscript.trim();
    };

    const fetchYouTubeDetails = async () => {
        if (!youtubeUrl.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }

        setSubmitting(true);
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

    const handleSubtitleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const srtContent = e.target?.result as string;
                const parsedContent = parseSrtContent(srtContent);
                setUploadedSubtitleText(parsedContent);
            };
            reader.readAsText(file);
        }
    };

    const analyzeSubtitle = async () => {
        if (!uploadedSubtitleText.trim()) {
            setError("Please upload a subtitle file.");
            return;
        }

        setAnalysisLoading(true);
        setError("");
        try {
            const response = await fetch("/api/analyze-transcript", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transcript_text: uploadedSubtitleText,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisData(JSON.stringify(data, null, 2));
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to analyze subtitle.");
            }
        } catch (err) {
            setError("Error analyzing subtitle.");
            console.error("Analysis Error:", err);
        } finally {
            setAnalysisLoading(false);
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
                analysis: parsedAnalysis.analysis || parsedAnalysis || {},
                transcript_text: uploadedSubtitleText,
            };

            const response = await fetch("/api/admin/register-video", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(videoData),
            });

            if (response.ok) {
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                        onClick={fetchYouTubeDetails}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? "Loading..." : "Fetch Details"}
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Subtitle File
                        </label>
                        <input
                            type="file"
                            accept=".txt,.srt,.vtt"
                            onChange={handleSubtitleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                        {uploadedSubtitleText && (
                            <p className="mt-2 text-sm text-gray-500">
                                File loaded. Click 'Analyze Subtitle' to
                                process.
                            </p>
                        )}
                        <button
                            onClick={analyzeSubtitle}
                            disabled={!uploadedSubtitleText || analysisLoading}
                            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            {analysisLoading
                                ? "Analyzing..."
                                : "Analyze Subtitle"}
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gemini Analysis Result (JSON format)
                        </label>
                        <textarea
                            value={analysisData}
                            onChange={(e) => setAnalysisData(e.target.value)}
                            rows={15}
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
