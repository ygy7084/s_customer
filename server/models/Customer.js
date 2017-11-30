import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Customer = new Schema({
  phone: String,
  name : String,
  rewards: [
    {
      shop: {
        _id: { type: Schema.Types.ObjectId, ref: 'shop' },
        name: String,
      },
      name : String,
      value: Number,
    }
  ]
});
Customer.index({ phone: 1 }, { unique: true });
const model = mongoose.model('customer', Customer);
export default model;

