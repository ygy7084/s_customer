import express from 'express';

import {
  Nfc,
} from '../models';

const router = express.Router();

// nfc 단일 조회
router.get('/link/:_id', (req, res) => {
  Nfc.findOne({ _id: req.params._id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: 'nfc 조회 오류'});
      }
      res.cookie('nfc', String(result._id), { expires: new Date(Date.now() + 9000000000), signed: false });
      return res.redirect('/');
    });
});

// nfc 단일 조회
router.get('/:_id', (req, res) => {
  Nfc.findOne({ _id: req.params._id })
    .populate('shop._id')
    .populate('place._id')
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: 'nfc 조회 오류'});
      }
      const data = result;
      if (data) {
        if (data.shop && data.shop._id) {
          data.shop = data.shop._id;
        }
        if (data.place && data.place._id) {
          data.place = data.place._id;
        }
      }
      return res.json({
        data,
      });
    });
});

export default router;
