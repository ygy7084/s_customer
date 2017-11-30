import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Place = new Schema({
  name: String,
  shop: {
    _id: { type: Schema.Types.ObjectId, ref: 'shop' },
    name: String,
  },
});

const model = mongoose.model('place', Place);

export default model;