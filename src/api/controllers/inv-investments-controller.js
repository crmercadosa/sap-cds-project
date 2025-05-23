//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
const {GetAllPricesHistory, AddOnePriceHistory, UpdateOnePriceHistory, DeleteOnePriceHistory} = require('../services/inv-priceshistory-service');

const {reversionSimple} = require ('../services/inv-simulations-service');

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

        this.on('updateone', async (req)=> {
            //llamada al metodo de servicio y retorna el resultado de la ruta
            return UpdateOnePriceHistory(req);
        });

        this.on('deleteone', async (req)=> {
            //llamada al metodo de servicio y retorna el resultado de la ruta
            return DeleteOnePriceHistory(req);
        });

        this.on("simulation", async (req) => {
            try {
                // Extraer 'strategy' de los query params y datos del body
                // Asegúrate de que 'req.req.query' y 'req.req.body.simulation' son las rutas correctas
                // para acceder a estos datos en tu entorno CDS.
                const { strategy } = req?.req?.query || {};
                const body = req?.req?.body?.SIMULATION || {}; // Aquí está todo el body

                console.log(body); // Esto mostrará el objeto JavaScript de la solicitud

                // Validaciones
                if (!strategy) {
                throw new Error(
                    "Falta el parámetro requerido: 'strategy' en los query parameters."
                );
                }
                if (Object.keys(body).length === 0) {
                throw new Error(
                    "El cuerpo de la solicitud no puede estar vacío. Se esperan parámetros de simulación."
                );
                }

                // Switch para manejar diferentes estrategias
                switch (strategy.toLowerCase()) {
                case "reversionsimple":
                    // Llama a la función reversionSimple con el objeto 'body' directamente.
                    // 'reversionSimple' ya devuelve un objeto JavaScript.
                    const result = await reversionSimple(body);
                    // NO uses JSON.parse(result) aquí, porque 'result' ya es un objeto.
                    // El framework se encargará de serializarlo a JSON para la respuesta HTTP.
                    return result; // <-- ¡Esta es la corrección clave!

                // Aquí puedes agregar más estrategias en el futuro:
                // case 'otraEstrategia':
                //   return await otraFuncionDeEstrategia(body);

                default:
                    throw new Error(`Estrategia no reconocida: ${strategy}`);
                }
            } catch (error) {
                console.error("Error en el controlador de simulación:", error);
                // Retorna un objeto de error que el framework pueda serializar a JSON.
                return {
                ERROR: true,
                MESSAGE:
                    error.message || "Error al procesar la solicitud de simulación.",
                };
            }
        });

        return await super.init();
    };


};

module.exports = InvestmentsClass;