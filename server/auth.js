import express from 'express';
import passport from 'passport';
const Strategy = require('passport-http-bearer').Strategy;
import { Order } from './models';

const router = express.Router();

passport.use(new Strategy(
  function(token, cb) {
    Order.findOne({ _id: token }).lean().exec((err, result) => {
      if (err) {
        return cb(null, false);
      }
      if (!result) { return cb(null, false); }
      return cb(null, result);
    });
  }));
// [END setup]

// [START authorize]
router.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.send({
      data: true,
    });
  });
});
router.get('/',
  passport.authenticate('bearer', { session: false }),
  (req, res) => {
  // If user is not stored in session, it will return undefined.
  if (!req.user) {
    return res.status(400).json({ message: '로그인하십시요.', behavior: 'redirectToLogin' });
  }
  if (req.user.delivered) {
    res.clearCookie('order');
    return res.status(401).end();
  } else {
    return res.json({ data: req.user });
  }
});
router.use((req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }
  next();
});
export default router;
