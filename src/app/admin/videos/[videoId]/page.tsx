"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Video {
    id: string;
    videoId: string;
    youtubeTitle: string;
    youtubeDescription: string;
    thumbnailUrl: string;
    duration: number;
    timestamp: string;
    analysis: {
        summary: string;
        keywords: string[];
        slang_expressions: Array<{ expression: string; meaning: string }>;
        main_questions: string[];
    };
    transcript_text: string | string[];
}

export default function VideoEditPage({
    params,
}: {
    params: Promise<{ videoId: string }>;
}) {
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [videoId, setVideoId] = useState<string>("");
    const router = useRouter();

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(0);
    const [summary, setSummary] = useState("");
    const [keywords, setKeywords] = useState("");
    const [slangExpressions, setSlangExpressions] = useState("");
    const [mainQuestions, setMainQuestions] = useState("");
    const [transcript, setTranscript] = useState("");

    useEffect(() => {
        const initializeParams = async () => {
            const resolvedParams = await params;
            setVideoId(resolvedParams.videoId);
        };
        initializeParams();
    }, [params]);

    useEffect(() => {
        if (videoId) {
            fetchVideo();
        }
    }, [videoId]);

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/admin/videos/${videoId}`);
            if (response.ok) {
                const data = await response.json();
                const videoData = data.video;
                setVideo(videoData);

                // Populate form fields
                setTitle(videoData.youtubeTitle || "");
                setDescription(videoData.youtubeDescription || "");
                setDuration(videoData.duration || 0);
                setSummary(videoData.analysis?.summary || "");
                setKeywords(videoData.analysis?.keywords?.join(", ") || "");
                setSlangExpressions(
                    JSON.stringify(
                        videoData.analysis?.slang_expressions || [],
                        null,
                        2
                    )
                );
                setMainQuestions(
                    videoData.analysis?.main_questions?.join("\n") || ""
                );

                // Handle transcript (array or string)
                if (Array.isArray(videoData.transcript_text)) {
                    setTranscript(videoData.transcript_text.join("\n"));
                } else {
                    setTranscript(videoData.transcript_text || "");
                }
            } else {
                setError("영상을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("Error fetching video:", error);
            setError("영상을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            // Parse and validate slang expressions
            let parsedSlangExpressions;
            try {
                parsedSlangExpressions = JSON.parse(slangExpressions);
                if (!Array.isArray(parsedSlangExpressions)) {
                    throw new Error("Slang expressions must be an array");
                }
            } catch {
                setError("슬랭 표현이 올바른 JSON 형식이 아닙니다.");
                setSaving(false);
                return;
            }

            const updateData = {
                videoId: videoId,
                youtubeTitle: title,
                youtubeDescription: description,
                duration: Number(duration),
                analysis: {
                    summary,
                    keywords: keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k),
                    slang_expressions: parsedSlangExpressions,
                    main_questions: mainQuestions
                        .split("\n")
                        .map((q) => q.trim())
                        .filter((q) => q),
                },
                transcript_text: transcript
                    .split("\n")
                    .map((t) => t.trim())
                    .filter((t) => t),
            };

            const response = await fetch("/api/admin/videos", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                alert("영상이 성공적으로 수정되었습니다.");
                router.push("/admin/videos");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error updating video:", error);
            setError("영상 수정 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading video...</div>
            </div>
        );
    }

    if (error && !video) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <Link
                    href="/admin/videos"
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    ← 영상 목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/admin/videos" className="mr-4">
                        <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-800" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        영상 수정
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <a
                        href={`https://youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        YouTube에서 보기
                    </a>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Video Preview */}
            {video && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        영상 미리보기
                    </h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={video.thumbnailUrl}
                            alt={video.youtubeTitle}
                            className="w-48 h-36 object-cover rounded"
                        />
                        <div>
                            <div className="text-sm text-gray-600 mb-2">
                                Video ID: {video.videoId}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                현재 길이: {formatDuration(video.duration)}
                            </div>
                            <div className="text-sm text-gray-600">
                                마지막 수정:{" "}
                                {new Date(video.timestamp).toLocaleString(
                                    "ko-KR"
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
                {/* Basic Info */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        기본 정보
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                영상 제목
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                영상 설명
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                영상 길이 (초)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) =>
                                    setDuration(Number(e.target.value))
                                }
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Analysis */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        분석 정보
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                요약
                            </label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={4}
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                키워드 (쉼표로 구분)
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="keyword1, keyword2, keyword3"
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                슬랭 표현 (JSON 형식)
                            </label>
                            <textarea
                                value={slangExpressions}
                                onChange={(e) =>
                                    setSlangExpressions(e.target.value)
                                }
                                rows={6}
                                placeholder='[{"expression": "example", "meaning": "예시"}]'
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                주요 질문 (줄바꿈으로 구분)
                            </label>
                            <textarea
                                value={mainQuestions}
                                onChange={(e) =>
                                    setMainQuestions(e.target.value)
                                }
                                rows={4}
                                placeholder="질문 1
질문 2
질문 3"
                                // --- 수정된 부분 ---
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Transcript */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        전사 텍스트
                    </h3>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={15}
                        placeholder="[00:00] 텍스트 내용
[00:05] 다음 내용..."
                        // --- 수정된 부분 ---
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>
        </div>
    );
}
