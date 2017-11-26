import express from 'express';
import {
  Shop,
} from '../models';
import configure from '../configure';

const router = express.Router();

router.get('/', (req, res) => {
  Shop.findOne({ name: 'Mamre' })
    .exec((err, result) => {
      if(err){
        return res.status(500).json({ message : '매장 조회 오류' , error: err });
      }
      return res.json({
        data: result,
      });
    });
});

export default router;