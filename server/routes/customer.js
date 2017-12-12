import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import {
  Customer,
} from '../models';
import device from 'express-device';

const router = express.Router();

router.use(device.capture({ parseUserAgent: true }));
device.enableDeviceHelpers(router);

// 로그인
router.get('/auth',
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    if(!req.user) {
      res.clearCookie('customer');
      return res.status(400).json({ message: '저장된 고객 정보가 없습니다.' });
    }
    return res.json({ data: req.user });
  });
// 비회원 생성
router.get('/makenonmember', (req, res) => {
  new Customer({ name: '비회원' })
    .save((err, result) => {
      if (err) {
        return res.status(500).json({
          message: '비회원 생성에 에러가 있습니다.',
          error: err,
        });
      }
      res.cookie('customer', String(result._id), {expires: new Date(Date.now() + 9000000000), signed: false});
      return res.json({
        data: result,
      });
    });
});
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
router.put('/webpush/add', (req, res) => {
  const { _id, endpoint, keys } = req.body.data;
  if (!_id || !endpoint || !keys) {
    return res.status(500).json({ message: '웹 푸시 입력 정보가 잘못되었습니다.' });
  }
  const webPushId = mongoose.Types.ObjectId();
  Customer.updateOne(
    { _id },
    {
      $push: {
        webPush: {
          _id: webPushId,
          endpoint,
          keys,
        },
      },
    },
    (err) => {
      if (err) {
        return res.status(500).json({ message: '웹 푸시 DB 등록 오류' });
      }
      return res.json({
        data: {
          _id: webPushId,
          endpoint,
          keys,
        },
      });
    }
  );
});
router.put('/webpush/remove', (req, res) => {
  const { _id, endpoint } = req.body.data;
  if (!_id || !endpoint) {
    return res.status(500).json({ message: '웹 푸시 제거 정보가 잘못되었습니다.' });
  }
  Customer.updateOne(
    { _id },
    {
      $pull: {
        webPush: {
          endpoint,
        },
      },
    },
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '웹 푸시 DB 삭제 오류' });
      }
      return res.json({
        data: {
          endpoint,
        },
      });
    }
  );
});
export default router;