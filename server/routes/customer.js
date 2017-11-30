import express from 'express';
import {
  Customer,
} from '../models';

const router = express.Router();

// 고객 생성
router.post('/inputphone', (req, res) => {
  const { phone } = req.body.data;
  if (!phone || phone === '' || phone === '010') {
    return res.status(500).json({ message: '전화번호 입력이 잘못되었습니다.' });
  }
  Customer.findOne({ phone })
    .lean()
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({ message: 'DB 입력에 에러가 있습니다.' });
      }
      if (result) {
        res.cookie('customer', String(result._id), {expires: new Date(Date.now() + 9000000000), signed: false});
        return res.json({
          data: result,
        });
      }
      new Customer({
        phone,
      }).save((err, result) => {
        if (err) {
          return res.status(500).json({ message: 'DB 신규 고객 생성에 에러가 있습니다.' });
        }
        res.cookie('customer', String(result._id), {expires: new Date(Date.now() + 9000000000), signed: false});
        return res.json({
          data: result,
        });
      })
    });
});

// 고객 단일
router.get('/:_id', (req, res) => {
  Customer.findOne({ _id: req.params._id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '고객 조회 오류'});
      }
      if (!result) {
        res.clearCookie('customer');
        return res.status(500).json({ message: '고객 데이터가 존재하지 않습니다.' });
      }
      res.cookie('customer', String(result._id), { expires: new Date(Date.now() + 9000000000), signed: false });
      return res.json({
        data: result,
      });
    });
});

export default router;