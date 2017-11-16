import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Product = new Schema({
  name : String,
  price : Number,
});
const model = mongoose.model('product', Product);

export default model;