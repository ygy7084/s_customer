import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const Nfc = new Schema({
  name: String,
  shop: {
    _id: { type: Schema.Types.ObjectId, ref: 'shop' },
    name: String,
  },
  place: {
    _id: { type: Schema.Types.ObjectId, ref: 'place' },
    name: String,
  },
});
Nfc.index({ 'shop._id': 1, 'place._id': 1 }, { unique: true });
const model = mongoose.model('nfc', Nfc);
export default model;
