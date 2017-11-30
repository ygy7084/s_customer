import express from 'express';

import {
  Account,
} from '../models';

const router = express.Router();

//계정 생성
router.post('/', (req, res) => {
  const accountTemp = {
    username: req.body.data.username,
    password: req.body.data.password,
    connectedShop: req.body.data.connectedShop,
    level: req.body.data.level,
  };

  const account = new Account(accountTemp);
  account.save((err,result) => {
    if(err){
      return res.status(500).json({ message : '계정 생성 오류'});
    }
    return res.json({
      data: result,
    });
  });

  return null;
});

//계정 리스트 조회
router.get('/', (req, res) => {
  Account.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "계정 리스트 조회 오류 "});
      }

      return res.json({
        data: result,
      });
    });
});

//계정 단일 조회
router.get('/:_id', (req, res) => {
  Account.findOne({ _id: req.params._id })
    .populate('connectedShop.id')
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '계정 조회 오류'});
      }
      return res.json({
        data: result,
      });
    });
});

//계정 수정
router.put('/', (req, res) => {
  if(!req.body.data._id){
    return res.status(500).json({ message : '계정 수정 오류: _id가 전송되지 않았습니다.'});
  }
  const properties = [
    'username',
    'password',
    'connectedShop',
    'level',
  ];
  const update = { $set: {} };
  for (const property of properties){
    if(Object.prototype.hasOwnProperty.call(req.body.data, property)){
      update.$set[property] = req.body.data[property];
    }
  }
  Account.findOneAndUpdate(
    { _id : req.body.data._id},
    update,
    (err, result) => {
      if(err) {
        return res.status(500).json({ message: "계정 수정 오류 "});
      }
      return res.json({
        data: result,
      });
    },
  );
  return null;
});

//계정 여러개 삭제
router.delete('/', (req, res) => {
  if(Array.isArray(req.body.data)) {
    const _ids = req.body.data.map(o => o._id);
    Account.deleteMany({_id: { $in: _ids } }, (err) => {
      if (err) {
        return res.status(500).json({message: '계정 삭제 오류: DB 삭제에 문제가 있습니다.'});
      }
      res.json({
        data: { message: '삭제완료' },
      });
    });
  }
  else {
    if (!req.body.data._id) {
      return res.status(500).json({message: '계정 삭제 오류: _id가 전송되지 않았습니다.'});
    }
    Account.findOneAndRemove(
      { _id: req.body.data._id },
      (err, result) =>
        res.json({
          data: result,
        }),
    );
  }
  return null;
});


// 계정 전체 삭제
router.delete('/all', (req, res) => {
  Account.deleteMany(
    {},
    (err) => {
      if (err) {
        return res.status(500).json({ message: '계정 삭제 오류: DB 삭제에 문제가 있습니다.' });
      }
      res.json({
        data: { message: '삭제완료' },
      });
    },
  );
  return null;
});


export default router;