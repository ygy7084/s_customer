import express from 'express';
import passport from 'passport';
const Strategy = require('passport-http-bearer').Strategy;
import fetch from 'isomorphic-fetch';
import promise from 'es6-promise';
import socket from '../server';
promise.polyfill();

import {
  Product,
} from '../models';

const router = express.Router();


//상품 생성
router.post('/', (req, res) => {
  const productTemp = {
    name: req.body.data.name,
    price: req.body.data.price,
  };

  const product = new Product(productTemp);
  product.save((err,result) => {
    if(err){
      return res.status(500).json({ message : '상품 생성 오류:'});
    }
    return res.json({
      data: result,
    });
  });
  return null;
});


router.get('/insert/:name', (req, res) => {
  const productTemp = {
    name: req.params.name,
    price: 4444,
  };

  const product = new Product(productTemp);
  product.save((err,result) => {
    if(err){
      return res.status(500).json({ message : '상품 생성 오류:'});
    }
    return res.json({
      data: result,
    });
  });
  return null;
});


//product 리스트 조회
router.get('/', (req, res) => {
  Product.find({})
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : "상품 리스트 조회 오류 "});
      }
      return res.json({
        data: result,
      });
    });
});



export default router;