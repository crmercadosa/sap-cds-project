const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    ROLEID: { type: String, required: true, unique: true },
    PASSWORD: String,
    USERNAME: String,
    ALIAS: String,
    FIRSTNAME: String,
    LASTNAME: String,
    BIRTHDAYDATE: String,
    COMPANYID: Number,
    COMPANYNAME: String,
    COMPANYALIAS: String,
    CEDIID: String,
    EMPLOYEEID: String,
    EMAIL: String,
    PHONENUMBER: String,
    EXTENSION: String,
    DEPARTMENT: String,
    FUNCTION: String,
    STREET: String,
    POSTALCODE: Number,
    CITY: String,
    REGION: String,
    STATE: String,
    COUNTRY: String,
    AVATAR: String,
    ROLES: [{
        ROLEID: String,
        ROLEIDSAP: String
    }],
    DETAIL_ROW: {
        ACTIVED: Boolean,
        DELETED: Boolean,
        DETAIL_ROW_REG: [{
            CURRENT: Boolean,
            REGDATE: Date,
            REGTIME: Date,
            REGUSER: String
        }]
    }
});

module.exports = mongoose.model(
    'ZTUSERS',
    userSchema,
    'ZTUSERS'
);
