const mongoose = require('mongoose');

const detailRowRegSchema = new mongoose.Schema({
    CURRENT: Boolean,
    REGDATE: Date,
    REGTIME: Date,
    REGUSER: String
}, { _id: false });

const detailRowSchema = new mongoose.Schema({
    ACTIVED: Boolean,
    DELETED: Boolean,
    DETAIL_ROW_REG: [detailRowRegSchema]
}, { _id: false });

const valueSchema = new mongoose.Schema({
    COMPANYID: { type: String, required: true},
    CEDIID: { type: String, required: true},
    LABELID: { type: String, required: true},
    VALUEPAID: String,
    VALUEID: { type: String, required: true, unique: true},
    VALUE: String,
    ALIAS: String,
    SEQUENCE: Number,
    IMAGE: String,
    DESCRIPTION: String,
    DETAIL_ROW: detailRowSchema
});

module.exports = mongoose.model(
  'ZTVALUES', 
  valueSchema, 
  'ZTVALUES'
);