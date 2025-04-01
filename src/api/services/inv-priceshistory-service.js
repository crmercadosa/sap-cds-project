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

// Put Update One and Some Prices History
async function UpdateOnePriceHistory(req) {
    try {
        const updatedPrice = req.req.body.prices;
        const IdPrice = parseInt(req.req.query.IdPrice); // ID del registro a actualizar

        if (!IdPrice) {
            throw new Error("El campo 'ID' es obligatorio para actualizar un registro.");
        }

        let pricesHistory = await ztpriceshistory.findOneAndUpdate(
            { ID: IdPrice }, // Filtro: Buscar por ID
            updatedPrice, // Datos a actualizar
            { new: true, upsert: false } // Retorna el documento actualizado, no crea si no existe
        );

        if (!pricesHistory) {
            throw new Error(`No se encontró un registro con ID: ${IdPrice}`);
        }

        return {
            message: `Registro actualizado correctamente.`,
            pricesHistory: JSON.parse(JSON.stringify(pricesHistory))
        };
    } catch (error) {
        return error;
    }
}

// Delete Delete One and Some Prices History
async function DeleteOnePriceHistory(req) {
    try {
        const IdPrice = parseInt(req.req.query.IdPrice); // ID del registro a eliminar

        if (!IdPrice) {
            throw new Error("El campo 'IdPrice' es obligatorio para eliminar un registro.");
        }

        // Eliminar el registro
        const pricesHistory = await ztpriceshistory.findOneAndDelete({ ID: IdPrice });

        if (pricesHistory.deletedCount === 0) {
            throw new Error(`No se encontró un registro con ID: ${IdPrice}`);
        }

        return {
            message: `Registro eliminado correctamente.`,
            pricesHistory: JSON.parse(JSON.stringify(pricesHistory))
        };      
            

    } catch (error) {
        return { error: error.message };
    }
}


module.exports = { GetAllPricesHistory, AddOnePriceHistory, UpdateOnePriceHistory, DeleteOnePriceHistory};