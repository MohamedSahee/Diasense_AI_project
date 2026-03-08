const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const controller = require("../controllers/wound.controller");

router.post("/predict", upload.single("file"), controller.predictWound);

module.exports = router;