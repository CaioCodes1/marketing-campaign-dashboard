const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Credenciais inválidas', 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Credenciais inválidas', 'INVALID_CREDENTIALS');

  const token = jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

module.exports = { login };
