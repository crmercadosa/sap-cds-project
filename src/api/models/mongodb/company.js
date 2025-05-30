const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  exchange: String,
  assetType: String
});

module.exports = mongoose.model(
    'Company',
    companySchema,
    'Company'
);
