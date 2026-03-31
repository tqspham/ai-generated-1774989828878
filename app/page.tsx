"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Pause, ChevronLeft, ChevronRight, Download, Share, Heart } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Photo = {
  id: number;
  src: string;
  alt: string;
};

const photos: Photo[] = [
  { id: 1, src: "/images/photo1.jpg", alt: "Photo 1" },
  { id: 2, src: "/images/photo2.jpg", alt: "Photo 2" },
  { id: 3, src: "/images/photo3.jpg", alt: "Photo 3" },
];

const fetchPhotos = async (): Promise<Photo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(photos);
    }, 1000);
  });
};

const Page = () => {
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [photoList, setPhotoList] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [likes, setLikes] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await fetchPhotos();
        setPhotoList(photos);
        const savedIndex = localStorage.getItem("photoIndex");
        setPhotoIndex(savedIndex ? parseInt(savedIndex) : 0);
      } catch {
        setError("Failed to load photos");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("Loading timeout, please try again");
        setLoading(false);
      }
    }, 5000);

    loadPhotos();

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    if (isPlaying) {
      const intervalId = setInterval(() => {
        setPhotoIndex((prevIndex) => (prevIndex + 1) % photoList.length);
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isPlaying, photoList.length]);

  useEffect(() => {
    const handleResize = () => {
      if (isFullScreen) {
        setIsFullScreen(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        localStorage.setItem("photoIndex", photoIndex.toString());
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [photoIndex, isFullScreen]);

  const handleNext = useCallback(() => {
    setPhotoIndex((prevIndex) => (prevIndex + 1) % photoList.length);
  }, [photoList.length]);

  const handlePrevious = useCallback(() => {
    setPhotoIndex((prevIndex) => (prevIndex - 1 + photoList.length) % photoList.length);
  }, [photoList.length]);

  const handleFullScreenToggle = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = photoList[photoIndex]?.src || "";
    link.download = `photo-${photoIndex + 1}.jpg`;
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this photo",
        url: window.location.href,
      });
    }
  };

  const handleLike = () => {
    setLikes((prevLikes) => {
      const newLikes = [...prevLikes];
      newLikes[photoIndex] = (newLikes[photoIndex] || 0) + 1;
      return newLikes;
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (photoList.length === 0) {
    return <div className="flex justify-center items-center h-screen">No photos available</div>;
  }

  return (
    <div className={twMerge("flex flex-col items-center justify-center h-screen", isFullScreen && "fixed inset-0 bg-black")}>
      <div className="relative">
        <Image
          src={photoList[photoIndex]?.src || ""}
          alt={photoList[photoIndex]?.alt || ""}
          width={isFullScreen ? window.innerWidth : 600}
          height={isFullScreen ? window.innerHeight : 400}
          onClick={handleFullScreenToggle}
          className="cursor-pointer"
        />
        {isFullScreen && (
          <button
            onClick={handleFullScreenToggle}
            className="absolute top-4 right-4 text-white"
          >
            Exit Full-Screen
          </button>
        )}
      </div>
      <div className="flex space-x-4 mt-4">
        <button onClick={handlePrevious} className="p-2 bg-gray-200 rounded-full">
          <ChevronLeft />
        </button>
        <button onClick={handlePlayPauseToggle} className="p-2 bg-gray-200 rounded-full">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button onClick={handleNext} className="p-2 bg-gray-200 rounded-full">
          <ChevronRight />
        </button>
        <button onClick={handleDownload} className="p-2 bg-gray-200 rounded-full">
          <Download />
        </button>
        <button onClick={handleShare} className="p-2 bg-gray-200 rounded-full">
          <Share />
        </button>
        <button onClick={handleLike} className="p-2 bg-gray-200 rounded-full">
          <Heart />
          <span className="ml-1">{likes[photoIndex] || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default Page;