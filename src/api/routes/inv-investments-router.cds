//1.-importar el modelo de datos de pricehistory desestructurandolos
using {inv as myinv} from '../models/inv-investments';


//2.-implementacion del controlador logico
@impl: 'src/api/controllers/inv-investments-controller.js'


//3.-creacion de la estructura base
//definicion del servicio
service InvestmentsRoute @(path:'/api/inv'){


    //4.-instanciar la entidad de prices history
    entity priceshistory as projection on myinv.priceshistory;
    entity entsimulation as projection on myinv.SIMULATION;
    entity symbol as projection on myinv.symbols;
    
    // no olvidar que el nombre de la funcion debe ser el mismo que el del path

    //localhost:3333/api/inv/getall
    @Core.Description: 'get-all-prices-history'
    @path :'getall'
        function getall()
        returns array of priceshistory;

    //localhost:3333/api/inv/addone
    @Core.Description: 'add-one-price-history'
    @path :'addone'
        action addone(prices: priceshistory)
        returns array of priceshistory;

    //localhost:3333/api/inv/updateone
    @Core.Description: 'update-one-price-history'
    @path :'updateone'
        action updateone(prices: priceshistory)
        returns array of priceshistory;

    //localhost:3333/api/inv/deleteone
    @Core.Description: 'delete-one-price-history'
    @path :'deleteone'
        action deleteone(prices: priceshistory)
        returns array of priceshistory;

    //POST para simualtion
    @path: 'simulation'
    action   simulation(SIMULATION : entsimulation)     returns array of entsimulation;

    //localhost:3333/api/inv/getallSimulations
    @Core.Description: 'get-all-simulations'
    @path :'getallSimulations'
        function getallSimulations()
        returns array of entsimulation;

    @Core.Description: 'get-all-companys'
    @path :'companys'
        function companys()
        returns array of symbol;

}