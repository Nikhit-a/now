const axios = require("axios");
const FormData = require("form-data");

const analyzeResumeWithAI = async (file) => {
    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const aiSecret = process.env.AI_SERVICE_SECRET || process.env.JWT_SECRET;
    if (!aiSecret) {
        throw new Error("AI_SERVICE_SECRET must be configured.");
    }

    const formData = new FormData();
    formData.append("file", file.buffer, {
        filename: file.originalname || file.fileName || "resume.pdf",
        contentType: file.mimetype || file.mimeType || "application/octet-stream"
    });

    const response = await axios.post(
        `${aiUrl.replace(/\/$/, "")}/ai/parse-resume`,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
                "x-internal-api-key": aiSecret
            },
            maxBodyLength: 6 * 1024 * 1024,
            timeout: 90000
        }
    );
    return response.data;
};

module.exports = analyzeResumeWithAI;
