import express from 'express';
import passport from 'passport';
const Strategy = require('passport-http-bearer').Strategy;
import { Customer } from './models';

const router = express.Router();

// PASSPORT SETTING
passport.use(new Strategy(
  function(_id, cb) {
    Customer.findOne({ _id }).lean().exec((err, result) => {
      if (err) { return cb(null, false); }
      if (!result) { return cb(null, false); }
      return cb(null, result);
    });
  }));
router.use((req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }
  next();
});
export default router;
