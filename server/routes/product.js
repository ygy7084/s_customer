import express from 'express';
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
//상품 반환
router.get('/:_id', (req, res) => {
  Product.findOne({ _id: req.params._id })
    .lean()
    .exec((err, result) => {
      if(err) {
        return res.status(500).json({ message: '상품 조회 오류'});
      }
      return res.json({
        data: result,
      });
    });
});



export default router;