const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// O limitador vem ANTES da validacao: tentativa de forca bruta nao deve nem
// chegar a ser validada, muito menos consultar o banco.
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

module.exports = router;
