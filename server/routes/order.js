import express from 'express';
import fetch from 'isomorphic-fetch';
import webPush from 'web-push';
import socket from '../server';
import configure from '../configure';
import {
  Order,
} from '../models';

const router = express.Router();
webPush.setGCMAPIKey('AIzaSyAFs9QXNkl6GYUK88GNHVDPYd0-idtPm9E');

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
    endPoint: req.body.data.endPoint,
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
        res.cookie('order', String(result._id), { expires: new Date(Date.now() + 9000000000), signed: false });
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
router.post('/delivered', (req, res) => {
  Order.findOne({ _id: req.body.data._id })
    .lean()
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({ message: 'DB 조회 에러가 있습니다.' });
      }
      const { _id, endPoint, keys } = result;
      socket.emit('delivered', _id);
      if (endPoint) {
        webPush.sendNotification({
          endpoint: endPoint,
          TTL: 0,
          keys: {
            auth: keys.authSecret,
            p256dh: keys.key,
          },
        }, JSON.stringify({
          message: `${result.customer.phone}님, 상품 준비가 완료되었습니다.`,
          _id,
        }))
          .then(() => {
            return res.json({ data: true });
          })
          .catch((error) => {
            console.log(error);
            return res.json({ data: true });
          });
      } else {
        return res.json({ data: true });
      }
    });
});
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
router.get('/', (req, res) => {
  Order.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "주문 리스트 조회 오류 "});
      }
      return res.json({
        data: result,
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