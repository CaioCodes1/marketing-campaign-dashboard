const userModel = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const users = await userModel.findAll();
  res.json({ success: true, data: users });
});

module.exports = { list };
