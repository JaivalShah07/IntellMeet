const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

let isConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isConfigured = true;
  console.log("Cloudinary Service successfully configured.");
} else {
  console.warn(
    "Cloudinary credentials missing in .env. Falling back to local Base64 Data URI mode."
  );
}

/**
 * Uploads a buffer to Cloudinary via a stream.
 * @param {Buffer} buffer 
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
function uploadFromBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

/**
 * Upload an avatar image buffer.
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<{ secure_url: string }>}
 */
exports.uploadAvatar = async (buffer, mimeType = "image/png") => {
  if (!isConfigured) {
    // Fallback: Return a base64 data URI
    const base64 = buffer.toString("base64");
    return { secure_url: `data:${mimeType};base64,${base64}` };
  }

  try {
    const result = await uploadFromBuffer(buffer, {
      folder: "intellmeet_avatars",
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });
    return { secure_url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary avatar upload error:", error);
    throw new Error("Failed to upload avatar to Cloudinary");
  }
};

/**
 * Upload a meeting recording buffer.
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {Promise<{ secure_url: string }>}
 */
exports.uploadRecording = async (buffer, filename, mimeType = "video/webm") => {
  if (!isConfigured) {
    // Fallback: Return a base64 data URI
    const base64 = buffer.toString("base64");
    return { secure_url: `data:${mimeType};base64,${base64}` };
  }

  try {
    const result = await uploadFromBuffer(buffer, {
      folder: "intellmeet_recordings",
      resource_type: "video",
      public_id: filename.replace(/\.[^/.]+$/, ""), // Strip file extension
    });
    return { secure_url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary recording upload error:", error);
    throw new Error("Failed to upload recording to Cloudinary");
  }
};
