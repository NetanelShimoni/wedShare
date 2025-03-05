import React, { useState, useRef, useEffect } from "react";
import { Check, X, Upload, Trash2, UploadCloud } from "lucide-react";
import "./fileUpload.css";
import UploadStatus from "./UploadStatus";

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  preview?: string;
}

interface IFileUpload {
  handleOnFinishUpload: () => void;
}

export function FileUpload({ handleOnFinishUpload }: IFileUpload) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [onClickUpload, setOnClickUpload] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const generatePreview = async (file: File): Promise<string> => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      return url;
    } else if (file.type.startsWith("video/")) {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;

        video.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

          const preview = canvas.toDataURL("image/jpeg");
          URL.revokeObjectURL(video.src);
          resolve(preview);
        };
      });
    }
    return "";
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const preview = await generatePreview(file);
        return {
          id: Math.random().toString(36).substring(7),
          file,
          progress: 0,
          status: "uploading" as const,
          preview,
        };
      })
    );

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((fileItem) => {
      simulateFileUpload(fileItem.id);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateFileUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  progress: 100,
                  status: "success",
                }
              : file
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
      }
    }, 500);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((file) => file.id !== fileId);
    });
  };

  const handleFileUpload = async () => {
    setIsFetching(true);
    setOnClickUpload(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.file);
    });

    try {
      // const response = await fetch("http://172.20.10.12:3000/upload", {
        // const response = await fetch("http://192.168.1.215:3000/upload", {
        const response = await fetch("https://wedshare-4.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setIsFetching(false);
      return data.files;
    } catch (error) {
      console.error("שגיאה בהעלאת הקבצים:", error);
      setError("שגיאה בהעלאת הקבצים:");
      throw error;
    }
  };

  return (
    <div className="fileUploadContainer">
      {!onClickUpload && (
        <>
          <div className="app-header">
            <h1 className="app-title">העלאת קבצים</h1>
            <p className="app-subtitle">העלה תמונות וסרטונים מהמכשיר שלך</p>
          </div>
          <div className="upload-container">
            {files.length === 0 ? (
              <div style={{ width: "100%" }}>
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="upload-icon" />
                  <p className="upload-text">העלאת קבצים</p>
                  <p className="upload-subtext">תמונות וסרטונים</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                </div>
                <div
                  style={{
                    backgroundImage: "url('public/icons/flower_blue.png')",
                    backgroundSize: " 50% auto",
                    justifyContent: "center",
                    objectFit: "cover",
                    width: "100%",
                  }}
                />
                {/* <img
                  src="icons/flower_blue.png"
                  width={320}
                  style={{ justifyContent: "center", alignItems: "center" }}
                /> */}
              </div>
            ) : (
              <div className="upload-actions">
                <button
                  className={`buttonImage`}
                  style={{
                    backgroundColor: "#8bbaca",
                    color: "white",
                    width: "50%",
                    height: "48px",
                  }}
                  onClick={handleFileUpload}
                >
                  <span>העלאת קבצים</span>
                  <UploadCloud size={24} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {files.length > 0 && (
              <div className="file-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="file-header">
                      <div className="file-info">
                        <div
                          className={`status-icon ${
                            file.status === "success"
                              ? "success"
                              : file.status === "error"
                              ? "error"
                              : "loading"
                          }`}
                        >
                          {file.status === "success" && <Check size={20} />}
                          {file.status === "error" && <X size={20} />}
                        </div>
                        <div className="file-details">
                          <p className="file-name">{file.file.name}</p>
                          <p className="file-size">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="delete-button"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${file.status}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="image">
            <img
              src="/icons/flower_blue2.png"
              style={{ transform: "rotate(90deg)" }}
            />
            </div>
          </div>
        </>
      )}
      {onClickUpload && (
        <UploadStatus
          isFetching={isFetching}
          handleOnFinishUpload={handleOnFinishUpload}
        />
      )}
    </div>
  );
}
