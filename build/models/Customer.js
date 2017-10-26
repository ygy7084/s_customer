'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var Customer = new Schema({
  phone: String
});

Customer.index({ phone: 1 }, { unique: true });

var model = _mongoose2.default.model('customer', Customer);

exports.default = model;