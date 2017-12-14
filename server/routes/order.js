import express from 'express';
import fetch from 'isomorphic-fetch';
import passport from 'passport';
import socket from '../server';
import configure from '../configure';
import {
  Order,
} from '../models';

const router = express.Router();

//주문 생성
router.post('/', (req, res) => {
  const order = new Order({
    datetime: new Date(),
    shop: req.body.data.shop,
    customer : req.body.data.customer,
    place : req.body.data.place,
    nfc: req.body.data.nfc,
    products: req.body.data.products,
    label: req.body.data.text,
    wholePrice: req.body.data.wholePrice,
    status : 0,
    endpoint: req.body.data.endpoint,
    keys: req.body.data.keys,
  });
  order.save((err, result) => {
    if (err) {
      return res.status(500).json({
        message: '에러',
        error: err,
      });
    }
    return fetch(`${configure.SHOP_URL}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: result,
      }),
    })
      .then((res2) => {
        if (res2.ok) { return res2.json(); }
        return res.json().then((error) => {
          throw error;
        });
      })
      .then((res2) => {
        return res.json({
          data: result._id,
        });
      })
      .catch((e) => {
        console.error(e);
        return res.status(500).json({ message: '매장 서버와 연결이 안됩니다.', error: e, });
      });
  });
});

// 취소 요청 - 향후 구현
router.post('/cancel', (req, res) => {
  if(!req.body.data._id){
    return res.status(500).json({ message : '주문 수정 오류: _id가 전송되지 않았습니다.'});
  }
  Order.findOneAndUpdate(
    { _id : req.body.data._id },
    { $set: {"status" : 2} },
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "주문 수정 오류 "});
      }
      return fetch(`${configure.SHOP_URL}/api/order/canceled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { _id: req.body.data._id },
        }),
      })
        .then((res2) => {
          if (res2.ok) { return res2.json(); }
          return res2.json().then((error) => {
            throw error;
          });
        })
        .then((res2) => {
          return res.json({
            data: result,
          });
        })
        .catch((e) => {
          console.error(e);
          res.status(500).json({
            message: '데이터 전송에 에러가 있습니다.',
          });
        })
    },
  );
  return null;
});
router.post('/canceled', (req, res) => {
  Order.findOne({ _id: req.body.data._id })
    .lean()
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({ message: 'DB 조회 에러가 있습니다.' });
      }
      const { _id, } = result;
      socket.emit('orderStatusChange', {
        _id,
        status: 2,
      });
      return res.json({ data: true });
    });
});
router.post('/delivered', (req, res) => {
  Order.findOne({ _id: req.body.data._id })
    .lean()
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({ message: 'DB 조회 에러가 있습니다.' });
      }
      const { _id, } = result;
      socket.emit('orderStatusChange', {
        _id,
        status: 1,
      });
      return res.json({ data: true });
    });
});
// 아마 필요 없을 수 있다.
router.post('/confirmdelivered', (req, res) => {
  if (!req.body.data._id) {
    return res.status(500).json({ message: '알림 확인 메세지 전송이 불가합니다.' });
  }
  Order.findOneAndUpdate({
    _id: req.body.data._id,
  }, {
    $set: { pushStatus: 2 },
  }, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '알림 확인 DB 처리에 에러가 있습니다.' });
    }
    return fetch(`${configure.SHOP_URL}/api/order/confirmdelivered`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { _id: req.body.data._id },
      }),
    })
      .then((res2) => {
        if (res2.ok) { return res2.json(); }
        return res2.json().then((error) => {
          throw error;
        });
      })
      .then((res2) => {
        return res.json({
          data: result,
        });
      })
      .catch((e) => {
        console.error(e);
        res.status(500).json({
          message: '데이터 전송에 에러가 있습니다.',
        });
      })
  });
});
//order 리스트 조회
router.get('/customerordered',
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
    if (!req.user) {
      res.clearCookie('customer');
      return res.status(400).json({ message: '저장된 고객 정보가 없습니다.' });
    }
    Order.find({
      'customer._id': req.user._id,
    })
      .populate('shop._id')
      .sort({ _id: -1 })
      .lean()
      .exec((err, result) => {
        if(err){
          return res.status(500).json({ message : "주문 리스트 조회 오류 "});
        }
        const resultArr = result;
        resultArr.forEach(o => {
          if (typeof o.shop._id === 'object') {
            o.shop = o.shop._id;
          }
        });
        return res.json({
          data: resultArr,
        });
      });
});
//order 단일 조회
router.get('/:_id',
  (req, res) => {
    Order.findOne({ _id: req.params._id })
      .lean()
      .exec((err, result) => {
        if(err) {
          return res.status(500).json({ message: '주문 조회 오류'});
        }
        return res.json({
          data: result,
        });
      });
});
//주문 수정
router.put('/', (req, res) => {
  if(!req.body.data._id){
    return res.status(500).json({ message : '주문 수정 오류: _id가 전송되지 않았습니다.'});
  }

  const properties = [
    'shop',
    'products',
    'customer',
    'nfc',
    'place',
    'orderedWay',
    'datetime',
    'payment',
    'message',
    'status',
  ];
  const update = { $set: {} };
  for (const property of properties){
    if(Object.prototype.hasOwnProperty.call(req.body.data, property)){
      update.$set[property] = req.body.data[property];
    }
  }

  // calculating wholePrice
  let wholePrice = 0;
  const products = req.body.data.products;
  products.forEach((product) => {
    let base = product.price;
    if (product.options && product.options.length) {
      product.options.forEach((option) => {
        option.selections.forEach((selection) => {
          base += selection.price;
        });
      });
    }
    wholePrice += base * product.number;
  });
  update.$set['wholePrice'] = wholePrice;

  Order.findOneAndUpdate(
    { _id : req.body.data._id },
    update,
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "주문 수정 오류 "});
      }
      return res.json({
        data: result,
      });
    },
  );
  return null;
});

// order 여러개 삭제
router.delete('/', (req, res) => {
  if(Array.isArray(req.body.data)) {
    const _ids = req.body.data.map(o => o._id);
    Order.deleteMany({_id: { $in: _ids } }, (err) => {
      if (err) {
        return res.status(500).json({message: 'order 삭제 오류: DB 삭제에 문제가 있습니다.'});
      }
      res.json({
        data: { message: '삭제완료' },
      });
    });
  }
  else {
    if (!req.body.data._id) {
      return res.status(500).json({message: 'order 삭제 오류: _id가 전송되지 않았습니다.'});
    }
    Order.findOneAndRemove(
      { _id: req.body.data._id },
      (err, result) =>
        res.json({
          data: result,
        }),
    );
  }
  return null;
});

// 주문 전체 삭제
router.delete('/all', (req, res) => {
  Order.deleteMany(
    {},
    (err) => {
      if (err) {
        return res.status(500).json({ message: '주문 삭제 오류: DB 삭제에 문제가 있습니다.' });
      }
      res.json({
        message: '삭제완료',
      });
    },
  );
  return null;
});


export default router;