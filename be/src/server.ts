import express, { Request } from "express";
import multer from "multer";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// const preAuthBaseUrl =
// "https://objectstorage.il-jerusalem-1.oraclecloud.com/p/K10ZjVwxGPxhzKw71GTN02CUd9LVNEWcvqoS3JMbxXICH4GEzO11bKNIflkKfIpa/n/ax32bet89kdj/b/reut-wedding/o/";
const preAuthBaseUrl =
  "https://objectstorage.il-jerusalem-1.oraclecloud.com/p/dydmr7YBK8FcdIj0KatZww_-3RZaz7oF50S3Js4rSRPAle77mx47l8Ds6TpKmaKA/n/ax32bet89kdj/b/reut-wedding/o/";

app.get("/list", async (req, res) => {
  try {
    const response = await axios.get(preAuthBaseUrl);
    const objects = response.data.objects || [];
    const imagesWithUrl = objects.map(
      (obj: any) => preAuthBaseUrl + encodeURIComponent(obj.name)
    );
    console.log("Get all list", imagesWithUrl.length);

    res.json(imagesWithUrl);
  } catch (error) {
    console.log("Failed to get /list path: ", error)
    res.status(500).json({ error: "Error retrieving objects" });
  }
});

app.post("/upload", (req: Request, res) => {
  console.log("1");

  // מאפשר העלאה של עד 5 קבצים במקביל
  const uploadMiddleware = upload.array("files", 5);

  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // טיפול בשגיאות של Multer (למשל גודל קובץ)
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "הקובץ גדול מדי" });
      }
      return res.status(400).json({ error: "שגיאה בהעלאת הקובץ" });
    } else if (err) {
      // טיפול בשגיאה כללית
      return res.status(500).json({ error: err.message });
    }

    // כעת יש לנו את הקבצים בזיכרון
    // כל קובץ נמצא ב-req.files, ושם המידע עצמו ב-file.buffer
    //@ts-ignore
    const files = req?.files!.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    }));
    console.log("2");

    try {
      // נעבור על כל הקבצים ונעלה אותם ל-Object Storage
      for (const file of files) {
        // נבנה את ה-URL הסופי, כאשר מוסיפים בסוף את שם הקובץ
        // אפשר להשתמש ב-Date.now() כדי למנוע התנגשות שמות
        const objectName = encodeURIComponent(
          Date.now() + "_" + file.originalName
        );
        const uploadUrl = preAuthBaseUrl + objectName;

        console.log("3");
        // שליחת הבקשה ל-Oracle (PUT)
        await axios.put(uploadUrl, file.buffer, {
          headers: {
            "Content-Type": file.mimeType || "application/octet-stream",
          },
        });
      }

      console.log("4");
      // אם הגענו לכאן - הכל עלה בהצלחה
      return res.json({
        message: "קבצים הועלו בהצלחה ל-Oracle Object Storage",
        files: files.map((f: any) => ({ name: f.originalName, size: f.size })),
      });
    } catch (uploadErr) {
      console.error("Error uploading to Oracle Object Storage:", uploadErr);
      return res
        .status(500)
        .json({ error: "שגיאה בהעלאה ל-Oracle Object Storage" });
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
