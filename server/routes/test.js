import { Customer } from '../models';
import mongoose from 'mongoose';

const configure = {
  MONGO_URL: "mongodb://localhost:27017/ours"
};
// 몽고디비 연결 설정
const db = mongoose.connection;
mongoose.connect(configure.MONGO_URL, {
  useMongoClient: true,
});
// 몽고디비 연결
db.on('error', console.error);
db.once('open', () => {
  console.log(`[MONGO DB URL] : ${configure.MONGO_URL}`);
  let a = Customer.find({}).exec()
    .then((e) => { throw new Error('abcd') })
    .catch((e) => console.error(e));

  console.log('a', a);

});


mongoose.Promise = global.Promise;

