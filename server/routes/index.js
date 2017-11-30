import express from 'express';
import account from './account';
import order from './order';
import product from './product';
import shop from './shop';
import nfc from './nfc';
import customer from './customer';

const router = express.Router();

router.use('/account', account);
router.use('/order', order);
router.use('/product', product);
router.use('/shop', shop);
router.use('/nfc', nfc);
router.use('/customer', customer);

export default router;