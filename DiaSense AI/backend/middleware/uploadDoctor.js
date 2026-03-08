// diasense-ai-backend/middleware/uploadDoctor.js (FULL REPLACE)
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/doctors");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP allowed"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});