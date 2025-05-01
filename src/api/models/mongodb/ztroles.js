const mongoose = require('mongoose');

const ztrolesSchema = new mongoose.Schema({
  ROLEID: { type: String, required: true, unique: true },
  ROLENAME: String,
  DESCRIPTION: String,
  PRIVILEGES: [
    {
      PROCESSID: String,
      PRIVILEGEID: [String]
    }
  ],
  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [
      {
        CURRENT: Boolean,
        REGDATE: Date,
        REGTIME: Date,
        REGUSER: String
      }
    ]
  }
});

module.exports = mongoose.model(
  'ZTROLES', 
  ztrolesSchema, 
  'ZTROLES'
);
