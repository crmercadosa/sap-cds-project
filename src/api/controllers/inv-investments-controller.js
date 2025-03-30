//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
const {GetAllPricesHistory, AddOnePriceHistory} = require('../services/inv-priceshistory-service');
// aun no esta creado el servicio

//3.- estructura princiapl  de la clas de contorller


class InvestmentsClass extends cds.ApplicationService{

    //4.-iniciiarlizarlo de manera asincrona
    async init (){

        this.on('getall', async (req)=> {
            //llamada al metodo de servicio y retorna el resultado de la ruta
            return GetAllPricesHistory(req);
        });

        this.on('addone', async (req)=> {
            //llamada al metodo de servicio y retorna el resultado de la ruta
            return AddOnePriceHistory(req);
        });

        return await super.init();
    };


};

module.exports = InvestmentsClass;