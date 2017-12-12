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
  ],
  webPush: [
    {
      numOfSent: { type: Number, default: 0 },
      numOfErr: { type: Number, default: 0 },
      endpoint: String,
      keys: {
        key: String,
        authSecret: String,
      },
    },
  ],
});
Customer.index({ phone: 1 }, { unique: true });
const model = mongoose.model('customer', Customer);
export default model;

