const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
    PROCESSID: String,
    PRIVILEGEID: [String]
}, { _id: false });

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

const roleSchema = new mongoose.Schema({
  ROLEID: { type: String, required: true, unique: true },
  ROLENAME: String,
  DESCRIPTION: String,
  PRIVILEGES: [privilegeSchema],
  DETAIL_ROW: detailRowSchema
});

module.exports = mongoose.model(
  'ZTROLES', 
  roleSchema, 
  'ZTROLES'
);
