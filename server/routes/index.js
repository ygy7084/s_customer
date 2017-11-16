import express from 'express';

import account from './account';
import order from './order';
import product from './product';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);
router.use('/product', product);

export default router;