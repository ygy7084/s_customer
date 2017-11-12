import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Order = new Schema({
  datetime: Date,
  label: String,
  orderList: [ String ],
  delivered: { type: Boolean, default: false },
});
const model = mongoose.model('order', Order);

export default model;