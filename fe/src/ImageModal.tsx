import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "./imageModal.css";
import { Download, Loader2Icon } from "lucide-react";

interface IImageModal {
  selectedMedia: string;
  closeSelectedMedia: () => void;
}

export const ImageModal = ({
  selectedMedia,
  closeSelectedMedia,
}: IImageModal) => {
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isVideoFile =
      selectedMedia.toLowerCase().endsWith(".mov") ||
      selectedMedia.toLowerCase().endsWith(".mp4");
    setIsVideo(isVideoFile);
    setIsMediaLoaded(false);
  }, [selectedMedia]);

  const handleDownload = async () => {
    try {
      setIsDownloadLoading(true);
      const response = await fetch(selectedMedia);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = isVideo ? "video.mov" : "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading media:", error);
    }
    setIsDownloadLoading(false);
  };

  const handleMediaLoad = () => {
    setIsMediaLoaded(true);
  };

  const handleVideoError = () => {
    console.error("Error loading video");
    setIsMediaLoaded(true); // Show controls even if video fails to load
  };

  return (
    <div className="modal" onClick={closeSelectedMedia}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {!isMediaLoaded && (
          <div className="loading-overlay">
            <Loader2Icon size={40} color="#fff" className="loading-icon" />
          </div>
        )}
        {isVideo ? (
          <video
            ref={videoRef}
            src={selectedMedia}
            controls
            playsInline
            preload="metadata"
            onLoadedData={handleMediaLoad}
            onError={handleVideoError}
            style={{
            //   display: isMediaLoaded ? "block" : "none",
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <img
            src={selectedMedia}
            alt="Selected"
            onLoad={handleMediaLoad}
            style={{
              display: isMediaLoaded ? "block" : "none",
              maxWidth: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
            }}
          />
        )}
        <div className="modal-icons">
          {isMediaLoaded && (
            <>
              <FaTimes
                size={40}
                className="close-icon"
                onClick={closeSelectedMedia}
              />
              {isDownloadLoading ? (
                <Loader2Icon size={40} className="download-icon" />
              ) : (
                <Download
                  size={40}
                  className="download-icon"
                  onClick={handleDownload}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
