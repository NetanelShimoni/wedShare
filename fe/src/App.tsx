import React, { useEffect, useState } from "react";
import "./styles.css";
import { FileUpload } from "./FileUpload";
import axios from "axios";
import { Box, CircularProgress, Typography } from "@mui/material";
import ReactPlayer from "react-player";
import { ImagePlus, ImagesIcon } from "lucide-react";
import ImageModal from "./ImageModal";

const mainPhoto = [
  "icons/image/1.jpeg",
  "icons/image/2.jpeg",
  "icons/image/3.jpeg",
  "icons/image/4.jpeg",
  "icons/image/5.jpeg",
  "icons/image/6.jpeg",
  "icons/image/7.jpeg",
  "icons/image/8.jpeg",
  "icons/image/9.jpeg",
].reverse();

function App() {
  // const currentDate = new Date().toLocaleDateString("he-IL", {
  //   day: "numeric",
  //   month: "numeric",
  //   year: "numeric",
  // });
  const [isUploadImage, setIsUploadImage] = useState(false);
  const [isFetchingAllImages, setIsFetchingAllImages] = useState(false);
  const [error, setError] = useState("");
  const [isAllImages, setIsAllImages] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState(mainPhoto);

  const onClickUploadImage = () => {
    setIsAllImages(false);
    setIsUploadImage(true);
  };

  const fetchAllPhotos = async () => {
    setIsFetchingAllImages(true);
    // const allPhotos = await axios.get("http://192.168.1.215:3000/list");
    // const allPhotos = await axios.get("http://172.20.10.12:3000/list");
    const allPhotos = await axios.get("https://wedshare-4.onrender.com/list");
    if (allPhotos.status === 200) {
      setPhotos([...mainPhoto, ...allPhotos.data]);
    } else {
      setError("קרתה שגיאה , אנא נסה שוב לרפרש את הדף :)");
    }
    setIsFetchingAllImages(false);
  };

  useEffect(() => {
    fetchAllPhotos();
  }, [isAllImages]);

  const onClickAllImages = () => {
    setIsAllImages(true);
    setIsUploadImage(false);
  };

  const handleImageClick = (photo: string) => {
    setSelectedImage(photo);
  };

  const closeSelectedImage = () => {
    setSelectedImage(null);
  };

  const isVideo = (url: string) => {
    // בדיקה פשוטה אם הקובץ הוא סרטון לפי הסיומת
    return (
      /\.(mp4|webm|ogg|mov)$/i.test(url) ||
      url.includes("youtube") ||
      url.includes("vimeo")
    );
  };

  const handleOnFinishUpload = () => {
    setIsAllImages(true);
    setIsUploadImage(false);
  };

  return (
    <div className="gallery-container">
      <div style={{ fontSize: "8px" }}>בס"ד</div>
      <div className="header">
        <div className="titleDateContainer">
          <div className="title">
            {/* <h1>התמונות שלכם הרגעים שלנו</h1> */}
            <h1>החתונה של מאיר ורעות</h1>
            <img src="/icons/hamsa.jpg" width={40} height={20} />
          </div>
          {/* <span className="date">16/03/25 ט"ז אדר</span> */}
          <span className="date">תמונות שלכם - רגעים שלנו </span>
        </div>
      </div>
      <div className="allImageContainer">
        <div className="flexRow">
          <button
            className={`buttonImage${isAllImages ? " buttonImageClick" : ""}`}
            onClick={onClickAllImages}
          >
            כל התמונות
            <ImagesIcon />
          </button>
        </div>
        <div className="flexRow">
          <button
            className={`buttonImage${isUploadImage ? " buttonImageClick" : ""}`}
            onClick={onClickUploadImage}
          >
            העלאת תמונות
            <ImagePlus size={24} />
          </button>
        </div>
      </div>

      {isAllImages && (
        <div className="photo-grid">
          {isFetchingAllImages && (
            <Box
              sx={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                p: 2,
                borderRadius: 2,
              }}
            >
              <CircularProgress size={100} />
              <Typography sx={{ color: "black" }}>
                טוען את כל הקבצים...
              </Typography>
            </Box>
          )}
          {!isFetchingAllImages && (
            <>
              {Array(3 - (photos.length % 3 || 3))
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    // className="photo-item empty"
                  ></div>
                ))}
              {[...photos].reverse().map((media, index) => (
                <div key={index} className="photo-item">
                  {isVideo(media) ? (
                    <ReactPlayer
                      url={media}
                      // url={"/icons/hamsa.jpg"}
                      // light={true} // זה יציג תמונה ממוזערת עם כפתור ניגון
                      light={"/icons/baseImage.jpeg"} // זה יציג תמונה ממוזערת עם כפתור ניגון
                      width="100%"
                      height="100%"
                      onClick={() => handleImageClick(media)}
                      className="video-thumbnail"
                    />
                  ) : (
                    //   <img
                    //   src={media}
                    //   alt={`Photo ${index + 1}`}
                    //   onClick={() => handleImageClick(media)}
                    // />
                    <img
                      src={media}
                      alt={`Photo ${index + 1}`}
                      onClick={() => handleImageClick(media)}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {isUploadImage && (
        <FileUpload handleOnFinishUpload={handleOnFinishUpload} />
      )}
      {selectedImage && (
        <ImageModal
          selectedMedia={selectedImage}
          closeSelectedMedia={closeSelectedImage}
        />
      )}
    </div>
  );
}

export default App;
