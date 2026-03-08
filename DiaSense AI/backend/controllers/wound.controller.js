const axios = require("axios");
const FormData = require("form-data");

exports.predictWound = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image file required" });
    }

    const form = new FormData();
    form.append("file", file.buffer, file.originalname);

    const response = await axios.post(
      "http://127.0.0.1:8000/wound/predict",
      form,
      { headers: form.getHeaders() }
    );

    return res.json(response.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "ML service error" });
  }
};