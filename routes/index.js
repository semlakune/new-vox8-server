const express = require('express');
const router = express.Router();
const { fetchAndProcessData } = require('../services');

router.get("/*", async (req, res, next) => {
  try {
    const endpoint = req.path.substring(1);
    const data = await fetchAndProcessData(endpoint, req.query);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
