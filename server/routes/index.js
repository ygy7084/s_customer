import express from 'express';
import account from './account';
import order from './order';
import product from './product';
import shop from './shop';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);
router.use('/product', product);
router.use('/shop', shop);

export default router;