import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Product = new Schema({
  name: String,
  pictures: [String],
  price: Number,
  description: String,
  shop : {
    _id : { type: Schema.Types.ObjectId, ref:'shop' },
    name : String
  },
  nutrients: [
    {
      name: String,
      value: String,
    }
  ],
  options: [
    {
      name: String,
      selections: [
        {
          name: String,
          price: Number,
          canBeMany: Boolean,
        }
      ],
    }
  ],
});
const model = mongoose.model('product', Product);

export default model;