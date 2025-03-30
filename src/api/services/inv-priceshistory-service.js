const ztpriceshistory = require('../models/mongodb/ztpriceshistory');

// Get all, Get One, and Get Some Prices history
async function GetAllPricesHistory(req){
    try{
        const IdPrice = parseInt(req.req.query?.IdPrice);
        const IniVolume = parseFloat(req.req.query?.IniVolume);
        const EndVolume = parseFloat(req.req.query?.EndVolume);

        let pricesHistory;
        if(IdPrice >= 0){
            pricesHistory = await ztpriceshistory.findOne({ID:IdPrice}).lean();
        }else if(IniVolume >= 0 && EndVolume >= 0){
            pricesHistory = await ztpriceshistory.find({
                VOLUME: {$gte: IniVolume, $lte: EndVolume}
            }).lean();
        }else{
            pricesHistory = await ztpriceshistory.find().lean();
        }
        return(pricesHistory);
    }catch(error){
        return error;
    } finally {

    }
};

// Post Add One and Some Prices History
async function AddOnePriceHistory(req){
    try{
        const newPrice = req.req.body.prices;
        let pricesHistory;
        pricesHistory = await ztpriceshistory.insertMany(newPrice, {order: true});
        return(JSON.parse(JSON.stringify(pricesHistory)));
    }catch(error){
        return error;
    } finally {

    }
};

module.exports = { GetAllPricesHistory, AddOnePriceHistory };