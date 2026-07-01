const cloudinary = require('cloudinary').v2;

// Configure only if credentials are provided
const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured');
} else {
  console.log('☁️  Cloudinary not configured — image uploads will be skipped');
}

/**
 * Upload an image buffer to Cloudinary.
 * Returns the secure URL, or null if Cloudinary is not configured.
 */
async function uploadImage(fileBuffer, originalName) {
  if (!isConfigured) {
    console.log('Cloudinary not configured, skipping upload for:', originalName);
    return null;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusclaim',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(fileBuffer);
  });
}

module.exports = { uploadImage };
