import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Order = new Schema({
  message: String, //label 이랑 비슷한거 같음 일단 놔둠
  label: String,
  //orderList: [ String ],
  status: Number,  // 0 : 주문중, 1: 배송완료 2: 주문취소
  shop: {
    _id: { type: Schema.Types.ObjectId, ref: 'shop' },
    name: String,
  },
  products:[
    {
      name: String,
      _id : { type: Schema.Types.ObjectId, ref: 'product' },
      price: Number,
      options: [
        {
          name: String,
          amount: Number,
        }
      ]
    }
  ],
  customer:{
    _id : { type: Schema.Types.ObjectId, ref:'customer' },
    name: String,
    phone: String,
  },
  nfc:{
    _id : { type: Schema.Types.ObjectId, ref:'nfc' },
    name: String,
  },
  place: String,
  orderedWay: String,
  datetime : Date,
  payment: [
    {
      name:String,
      value: Number,
    }
  ],
});
const model = mongoose.model('order', Order);

export default model;