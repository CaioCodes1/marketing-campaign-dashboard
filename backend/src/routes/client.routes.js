const express = require('express');
const clientController = require('../controllers/client.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { upsertSchema } = require('../validators/client.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', clientController.list);
router.post('/', validate(upsertSchema), clientController.create);
router.put('/:id', validate(upsertSchema), clientController.update);
router.delete('/:id', clientController.remove);

module.exports = router;
