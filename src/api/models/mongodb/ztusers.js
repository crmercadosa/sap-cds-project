const mongoose = require('mongoose');

// Subdocumento de ROLES sin _id
const roleSchema = new mongoose.Schema({
    ROLEID: String,
    ROLEIDSAP: String
}, { _id: false });

// Subdocumento de DETAIL_ROW_REG (registro de auditoría)
const detailRowRegSchema = new mongoose.Schema({
    CURRENT: Boolean,
    REGDATE: Date,
    REGTIME: Date,
    REGUSER: String
}, { _id: false });

// Subdocumento de DETAIL_ROW
const detailRowSchema = new mongoose.Schema({
    ACTIVED: Boolean,
    DELETED: Boolean,
    DETAIL_ROW_REG: [detailRowRegSchema]
}, { _id: false });

// Esquema principal de usuarios
const userSchema = new mongoose.Schema({
    USERID: { type: String, required: true, unique: true }, // Este campo faltaba como clave
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
    ROLES: [roleSchema],               // Aquí se usa el subesquema sin _id
    DETAIL_ROW: detailRowSchema        // Y también aquí
});

module.exports = mongoose.model(
    'ZTUSERS',
    userSchema,
    'ZTUSERS'
);
