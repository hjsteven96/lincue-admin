"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Clock, Calendar, Edit } from "lucide-react";

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
}

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch("/api/admin/videos");
            const data = await response.json();
            setVideos(data.videos || []);
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteVideo = async (videoId: string) => {
        if (!confirm("정말로 이 영상을 삭제하시겠습니까?")) {
            return;
        }

        setDeleting(videoId);
        try {
            const response = await fetch(
                `/api/admin/videos?videoId=${videoId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setVideos(videos.filter((video) => video.videoId !== videoId));
                alert("영상이 성공적으로 삭제되었습니다.");
            } else {
                const errorData = await response.json();
                alert(`삭제 실패: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting video:", error);
            alert("영상 삭제 중 오류가 발생했습니다.");
        } finally {
            setDeleting(null);
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

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString("ko-KR");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading videos...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Video Management
                </h1>
                <Link
                    href="/admin/videos/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add New Video
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {videos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500">
                            등록된 영상이 없습니다.
                        </div>
                        <Link
                            href="/admin/videos/new"
                            className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                        >
                            첫 번째 영상을 등록해보세요
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                        {videos.map((video) => (
                            <div
                                key={video.videoId}
                                className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                {/* Video Thumbnail */}
                                <div className="relative">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.youtubeTitle}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                        {video.youtubeTitle}
                                    </h3>

                                    <div className="text-sm text-gray-600 mb-3">
                                        <div className="flex items-center mb-1">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(video.timestamp)}
                                        </div>
                                        <div>Video ID: {video.videoId}</div>
                                    </div>

                                    {/* Summary */}
                                    {video.analysis?.summary && (
                                        <div className="mb-3">
                                            <div className="text-xs font-medium text-gray-700 mb-1">
                                                요약
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {video.analysis.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Keywords */}
                                    {video.analysis?.keywords &&
                                        video.analysis.keywords.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs font-medium text-gray-700 mb-1">
                                                    키워드
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {video.analysis.keywords
                                                        .slice(0, 3)
                                                        .map(
                                                            (
                                                                keyword,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={`${keyword}-${index}`}
                                                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                                                >
                                                                    {keyword}
                                                                </span>
                                                            )
                                                        )}
                                                    {video.analysis.keywords
                                                        .length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +
                                                            {video.analysis
                                                                .keywords
                                                                .length -
                                                                3}{" "}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Actions */}
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <a
                                                href={`https://youtube.com/watch?v=${video.videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                YouTube에서 보기
                                            </a>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <Link
                                                href={`/admin/videos/${video.videoId}`}
                                                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                수정
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    deleteVideo(video.videoId)
                                                }
                                                disabled={
                                                    deleting === video.videoId
                                                }
                                                className="flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                {deleting === video.videoId
                                                    ? "삭제 중..."
                                                    : "삭제"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {videos.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    총 {videos.length}개의 영상이 등록되어 있습니다.
                </div>
            )}
        </div>
    );
}
