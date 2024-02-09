const axios = require("axios");
const sharp = require("sharp");

async function dynamicBlurDataUrl(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);

    const blurredImage = await sharp(buffer)
      .resize(20, 20) // Resize the image to 20x20 pixels or any small size
      .blur(1) // Apply a slight blur effect
      .toBuffer();

    const base64str = Buffer.from(blurredImage).toString("base64");

    const blurSvg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
        <filter id='b' color-interpolation-filters='sRGB'>
          <feGaussianBlur stdDeviation='1' />
        </filter>

        <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
        href='data:image/avif;base64,${base64str}' />
      </svg>
    `;

    const toBase64 = (str) => Buffer.from(str).toString("base64");

    return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
  } catch (error) {
    console.error("Error creating dynamic blur data URL:", error);
    throw error; // Propagate error
  }
}

function getCloudinaryUrl(imagePath) {
  const cloudinaryBase = "https://res.cloudinary.com/dqkmtj33s/image/fetch";
  const optimizationParams = "ar_1.0,c_limit,h_32";
  return `${cloudinaryBase}/${optimizationParams}/${encodeURIComponent(
    imagePath,
  )}`;
}


module.exports = { dynamicBlurDataUrl, getCloudinaryUrl };