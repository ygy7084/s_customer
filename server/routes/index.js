import express from 'express';

import account from './account';
import order from './order';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);

export default router;