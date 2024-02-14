const axios = require("axios");
const { getColor } = require("../utils/colorUtils");
const { dynamicBlurDataUrl, getCloudinaryUrl } = require("../utils/imageUtils");
const redisClient = require("../config/redisClient");

async function fetchAndProcessData(endpoint, query) {
  // Check if data is in Redis cache
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(query)}`;
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData); // Return cached data if available
  }

  const response = await axios.get("https://api.themoviedb.org/3/" + endpoint, {
    params: query,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_KEY}`,
    },
  });

  if (endpoint.includes("genre")) {
    return response.data.genres;
  }

  if (endpoint.includes("watch/providers")) {
    const promises = response.data.results.map(async (item) => {
      return {
        ...item,
        logo: `https://image.tmdb.org/t/p/original${item.logo_path}`,
      };
    });

    response.data.results = await Promise.all(promises);

    return response.data;
  }

  const promises = response.data.results
    .map(async (item) => {
      let data = {
        ...item,
        backdrop_color: "#000000",
        poster_color: "#000000",
        fontColor: "#ffffff",
        posterFontColor: "#ffffff",
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : process.env.BASE_URL + "/images/no-image.png",
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : process.env.BASE_URL + "/images/no-image.png",
      };

      // data.poster_path = `https://image.tmdb.org/t/p/original${item.poster_path}`;
      // data.backdrop_path = `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;

      try {
        const color = await getColor(getCloudinaryUrl(data.backdrop_path));
        const colorForPoster = await getColor(getCloudinaryUrl(data.poster_path));

        data.backdrop_color = color.backgroundColor;
        data.poster_color = colorForPoster.backgroundColor;
        data.fontColor = color.fontColor;
        data.posterFontColor = colorForPoster.fontColor;
        data.backdrop_blurHash = await dynamicBlurDataUrl(getCloudinaryUrl(data.backdrop_path));
        data.poster_blurHash = await dynamicBlurDataUrl(getCloudinaryUrl(data.poster_path));

        data.vote_average = parseFloat(data.vote_average).toFixed(1);
      } catch (error) {
        console.log(error, "Error in getColor");
        throw error;
      }

      return data;
    });

  response.data.results = await Promise.all(promises);

  // Cache the processed data before returning
  await redisClient.set(cacheKey, JSON.stringify(response.data), {
    EX: 3600, // Set an expiration time (in seconds)
  });

  return response.data;
}

function errorHandlingMiddleware(err, req, res, next) {
  let code = 500;
  let message = "Internal Server Error";

  res.status(code).json({ message });
}

module.exports = { fetchAndProcessData, errorHandlingMiddleware };
