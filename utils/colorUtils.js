const axios = require("axios");
const sharp = require("sharp");

async function getColor(imagePath) {
  try {
    const response = await axios.get(imagePath, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);

    const { dominant } = await sharp(buffer).stats();
    const backgroundColor = `${dominant.r}, ${dominant.g}, ${dominant.b}`;

    const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
    const lum = luminance(dominant.r, dominant.g, dominant.b);
    const threshold = 128;

    const fontColor = lum > threshold ? "black" : "white";

    return { backgroundColor, fontColor };
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = { getColor };