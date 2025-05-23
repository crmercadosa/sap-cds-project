const axios = require("axios");

// REVERSION_SIMPLE - La lógica de tu estrategia original, ahora como una función separada
    async function reversionSimple(req) {
      
      console.log(req);
    
      try {
        // Desestructuración de los parámetros requeridos del objeto de solicitud.
        const { SYMBOL, STARTDATE, ENDDATE, AMOUNT, USERID, SPECS } = req || {};
    
        // Validación de la presencia de todos los parámetros esenciales.
        if (!SYMBOL || !STARTDATE || !ENDDATE || AMOUNT === undefined || !USERID) {
          throw new Error(
            "FALTAN PARÁMETROS REQUERIDOS EN EL CUERPO DE LA SOLICITUD: 'SYMBOL', 'STARTDATE', 'ENDDATE', 'AMOUNT', 'USERID'."
          );
        }
    
        // Genera un ID de simulación único.
        // Usamos Date y Math.random() como alternativa a crypto.randomUUID()
        // si el entorno no soporta Node.js crypto module directamente.
        const generateSimulationId = (symbol) => {
          const date = new Date();
          const timestamp = date.toISOString().replace(/[^0-9]/g, ''); // Formato YYYYMMDDTHHMMSSsssZ
          const random = Math.floor(Math.random() * 10000);
          return `${symbol}_${timestamp}_${random}`;
        };
    
        const SIMULATIONID = generateSimulationId(SYMBOL);
        const SIMULATIONNAME = "Estrategia de Reversión Simple"; // Nombre de la estrategia
        const STRATEGYID = "IdCM"; // Ajustado a "IdCM" según el formato deseado
    
        // Extracción de los períodos para RSI y SMA de las especificaciones, con valores por defecto.
        // CORRECCIÓN: Usar 'INDICATOR' en lugar de 'KEY' para encontrar los indicadores.
        const RSI_INDICATOR = SPECS?.find((IND) => IND.INDICATOR?.toLowerCase() === "rsi");
        const SMA_INDICATOR = SPECS?.find((IND) => IND.INDICATOR?.toLowerCase() === "sma");
    
        const RSI_PERIOD = parseInt(RSI_INDICATOR?.VALUE) || 14;
        const SMA_PERIOD = parseInt(SMA_INDICATOR?.VALUE) || 5;
    
        // Configuración de la API de Alpha Vantage.
        // Asegúrate de tener 'axios' importado en tu entorno (ej. const axios = require('axios'); o import axios from 'axios';)
        const APIKEY = "demo"; // Clave API de demostración, considera usar una clave real y segura para producción.
        const APIURL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&outputsize=full&apikey=${APIKEY}`;
    
        // Realiza la solicitud HTTP para obtener datos históricos.
        const RESPONSE = await axios.get(APIURL);
        const OPTIONSDATA = RESPONSE.data["Time Series (Daily)"];
    
        // Verifica si se obtuvieron datos históricos.
        if (!OPTIONSDATA || Object.keys(OPTIONSDATA).length === 0) {
          throw new Error(
            "NO SE ENCONTRARON DATOS DE PRECIOS HISTÓRICOS PARA EL SÍMBOLO PROPORCIONADO."
          );
        }
    
        // Calcula el número de días de "buffer" necesarios para los cálculos de indicadores.
        const BUFFER_DAYS = Math.max(SMA_PERIOD, RSI_PERIOD);
    
        // Ordena todas las fechas disponibles de los datos históricos.
        const ALL_DATES_SORTED = Object.keys(OPTIONSDATA).sort(
          (A, B) => new Date(A) - new Date(B)
        );
    
        // Encuentra el índice de inicio ajustado para incluir el buffer de días.
        const EXTENDED_START_INDEX =
          ALL_DATES_SORTED.findIndex((DATE) => DATE >= STARTDATE) - BUFFER_DAYS;
    
        const ADJUSTED_START_INDEX =
          EXTENDED_START_INDEX >= 0 ? EXTENDED_START_INDEX : 0;
    
        // Filtra y mapea los precios relevantes para la simulación, incluyendo el buffer.
        const FILTERED_PRICES = ALL_DATES_SORTED.slice(ADJUSTED_START_INDEX)
          .filter((DATE) => DATE <= ENDDATE) // Filtra hasta la fecha de fin
          .map((DATE) => ({
            DATE,
            OPEN: parseFloat(OPTIONSDATA[DATE]["1. open"]),
            HIGH: parseFloat(OPTIONSDATA[DATE]["2. high"]),
            LOW: parseFloat(OPTIONSDATA[DATE]["3. low"]),
            CLOSE: parseFloat(OPTIONSDATA[DATE]["4. close"]),
            VOLUME: parseFloat(OPTIONSDATA[DATE]["5. volume"]),
          }));
    
        // Verifica si hay suficientes datos para calcular los indicadores.
        if (FILTERED_PRICES.length < BUFFER_DAYS) {
          throw new Error(
            "NO HAY SUFICIENTES DATOS HISTÓRICOS PARA CALCULAR LA ESTRATEGIA CON LOS PERÍODOS ESPECIFICADOS."
          );
        }
    
        /**
         * Calcula el Simple Moving Average (SMA) para una serie de datos.
         * @param {Array<object>} DATA - Arreglo de objetos de precios con una propiedad 'CLOSE'.
         * @param {number} PERIOD - Período del SMA.
         * @returns {Array<number|null>} - Arreglo de valores SMA o null si no hay suficientes datos.
         */
        const CALCULATE_SMA = (DATA, PERIOD) => {
          const SMA_VALUES = [];
          for (let I = 0; I < DATA.length; I++) {
            if (I < PERIOD - 1) {
              SMA_VALUES.push(null); // No hay suficientes datos para el cálculo inicial
            } else {
              const SUM = DATA.slice(I - PERIOD + 1, I + 1).reduce(
                (ACC, VAL) => ACC + VAL.CLOSE,
                0
              );
              SMA_VALUES.push(SUM / PERIOD);
            }
          }
          return SMA_VALUES;
        };
    
        // Calcula los valores SMA para los precios filtrados.
        const SMA_VALUES = CALCULATE_SMA(FILTERED_PRICES, SMA_PERIOD);
    
        // Calcula los valores RSI.
        const RSI_VALUES = [];
        for (let I = 0; I < FILTERED_PRICES.length; I++) {
          if (I < RSI_PERIOD) {
            RSI_VALUES.push(null); // No hay suficientes datos para el cálculo inicial del RSI
            continue;
          }
    
          let GAINS = 0;
          let LOSSES = 0;
          // Calcula las ganancias y pérdidas para el período RSI.
          for (let J = I - RSI_PERIOD + 1; J <= I; J++) {
            if (J > 0) {
              const CHANGE =
                FILTERED_PRICES[J].CLOSE - FILTERED_PRICES[J - 1].CLOSE;
              if (CHANGE > 0) GAINS += CHANGE;
              else LOSSES -= CHANGE;
            }
          }
    
          // Calcula el promedio de ganancias y pérdidas.
          const AVG_GAIN = GAINS / RSI_PERIOD;
          const AVG_LOSS = LOSSES / RSI_PERIOD;
    
          // Calcula el Relative Strength (RS) y el RSI.
          const RS =
            AVG_LOSS === 0 ? (AVG_GAIN === 0 ? 0 : 100) : AVG_GAIN / AVG_LOSS;
          const RSI = 100 - 100 / (1 + RS);
          RSI_VALUES.push(parseFloat(RSI.toFixed(2)));
        }
    
        // Variables para la simulación de la estrategia.
        const SIGNALS = [];
        let UNITS_HELD = 0; // Unidades del activo en posesión
        let CASH = parseFloat(AMOUNT); // Capital disponible
        let TOTAL_BOUGHT_UNITS = 0; // Total de unidades compradas a lo largo de la simulación
        let TOTAL_SOLD_UNITS = 0; // Total de unidades vendidas a lo largo de la simulación
        const BOUGHT_PRICES = []; // Registro de compras para cálculo FIFO
        let REAL_PROFIT = 0; // Ganancia/pérdida realizada
        const NEW_CHART_DATA = []; // Datos para la visualización en un gráfico (modificado)
    
        // Bucle principal de la simulación, iterando sobre los precios filtrados.
        for (let I = 0; I < FILTERED_PRICES.length; I++) {
          const {
            DATE,
            OPEN,
            HIGH,
            LOW,
            CLOSE: PRICE, // Renombra CLOSE a PRICE para mayor claridad
            VOLUME,
          } = FILTERED_PRICES[I];
    
          // Ignora las fechas fuera del rango de simulación (ya filtradas, pero como doble chequeo).
          if (
            new Date(DATE) < new Date(STARTDATE) ||
            new Date(DATE) > new Date(ENDDATE)
          )
            continue;
    
          const SMA = SMA_VALUES[I];
          const RSI = RSI_VALUES[I];
    
          let CURRENT_SIGNAL_TYPE = null;
          let CURRENT_REASONING = null;
          let UNITS_TRANSACTED = 0;
          let PROFIT_LOSS = 0;
    
          // Lógica de la estrategia: Señal de COMPRA
          // Compra si el precio está significativamente por debajo del SMA y hay efectivo disponible.
          if (PRICE < SMA * 0.98 && CASH > 0) {
            const INVESTMENT_AMOUNT = CASH * 0.5; // Invierte el 50% del efectivo disponible
            UNITS_TRANSACTED = INVESTMENT_AMOUNT / PRICE;
            const SPENT = UNITS_TRANSACTED * PRICE;
            UNITS_HELD += UNITS_TRANSACTED;
            CASH -= SPENT;
            TOTAL_BOUGHT_UNITS += UNITS_TRANSACTED;
            // Registra la compra para el cálculo FIFO.
            BOUGHT_PRICES.push({ DATE, PRICE, UNITS: UNITS_TRANSACTED });
    
            CURRENT_SIGNAL_TYPE = "buy"; // Cambiado a minúsculas
            CURRENT_REASONING = `EL PRECIO ESTÁ POR DEBAJO DEL 98% DEL SMA. RSI: ${RSI.toFixed(
              2
            )}`;
          }
          // Lógica de la estrategia: Señal de VENTA
          // Vende si el precio está significativamente por encima del SMA y hay unidades en posesión.
          else if (PRICE > SMA * 1.02 && UNITS_HELD > 0) {
            const UNITS_TO_SELL = UNITS_HELD * 0.25; // Vende el 25% de las unidades en posesión
            const REVENUE = UNITS_TO_SELL * PRICE;
            CASH += REVENUE;
            UNITS_HELD -= UNITS_TO_SELL;
            TOTAL_SOLD_UNITS += UNITS_TO_SELL;
            UNITS_TRANSACTED = UNITS_TO_SELL;
    
            // Lógica FIFO para calcular la ganancia/pérdida real de las unidades vendidas.
            let SOLD_UNITS_COUNTER = UNITS_TO_SELL;
            let COST_OF_SOLD_UNITS = 0;
            let UNITS_REMOVED_FROM_BOUGHT = []; // Para limpiar el registro de compras
    
            for (let J = 0; J < BOUGHT_PRICES.length; J++) {
              if (SOLD_UNITS_COUNTER <= 0) break; // Si ya se vendieron todas las unidades necesarias, salir.
    
              const PURCHASE = BOUGHT_PRICES[J];
              const UNITS_FROM_THIS_PURCHASE = Math.min(
                PURCHASE.UNITS,
                SOLD_UNITS_COUNTER
              );
              COST_OF_SOLD_UNITS += UNITS_FROM_THIS_PURCHASE * PURCHASE.PRICE;
              SOLD_UNITS_COUNTER -= UNITS_FROM_THIS_PURCHASE;
    
              BOUGHT_PRICES[J].UNITS -= UNITS_FROM_THIS_PURCHASE;
              if (BOUGHT_PRICES[J].UNITS <= 0) {
                UNITS_REMOVED_FROM_BOUGHT.push(J); // Marca las compras agotadas para eliminación.
              }
            }
    
            // Elimina las entradas de compras agotadas del registro (en orden inverso para evitar problemas de índice).
            for (let K = UNITS_REMOVED_FROM_BOUGHT.length - 1; K >= 0; K--) {
              BOUGHT_PRICES.splice(UNITS_REMOVED_FROM_BOUGHT[K], 1);
            }
    
            const AVG_PURCHASE_PRICE_FOR_SOLD_UNITS =
              COST_OF_SOLD_UNITS / UNITS_TO_SELL;
            PROFIT_LOSS =
              (PRICE - AVG_PURCHASE_PRICE_FOR_SOLD_UNITS) * UNITS_TO_SELL;
            REAL_PROFIT += PROFIT_LOSS;
    
            CURRENT_SIGNAL_TYPE = "sell"; // Cambiado a minúsculas
            CURRENT_REASONING = `EL PRECIO ESTÁ POR ENCIMA DEL 102% DEL SMA. RSI: ${RSI.toFixed(
              2
            )}`;
          }
    
          // Si se generó una señal (compra o venta), registrarla.
          if (CURRENT_SIGNAL_TYPE) {
            SIGNALS.push({
              DATE,
              TYPE: CURRENT_SIGNAL_TYPE,
              PRICE: parseFloat(PRICE.toFixed(2)),
              REASONING: CURRENT_REASONING,
              SHARES: parseFloat(UNITS_TRANSACTED.toFixed(15)), // Alta precisión para las unidades
              PROFIT: parseFloat(PROFIT_LOSS.toFixed(2)),
            });
          }
    
          // Añade los datos para el gráfico con la nueva estructura.
          NEW_CHART_DATA.push({
            DATE,
            OPEN: parseFloat(OPEN.toFixed(2)),
            HIGH: parseFloat(HIGH.toFixed(2)),
            LOW: parseFloat(LOW.toFixed(2)),
            CLOSE: parseFloat(PRICE.toFixed(2)),
            VOLUME: parseFloat(VOLUME.toFixed(0)), // Volumen como entero
            INDICATORS: [
              { INDICATOR: "sma", VALUE: parseFloat((SMA ?? 0).toFixed(2)) },
              { INDICATOR: "rsi", VALUE: parseFloat((RSI ?? 0).toFixed(2)) }
            ]
          });
        }
    
        // Calcula el valor final de las unidades restantes.
        let FINAL_VALUE = 0;
        const lastPriceData = FILTERED_PRICES[FILTERED_PRICES.length - 1];
        if (lastPriceData && UNITS_HELD > 0) {
            FINAL_VALUE = UNITS_HELD * lastPriceData.CLOSE; // Usar el precio de cierre del último día
        }
    
        // Calcula el balance final y el porcentaje de retorno.
        const FINAL_BALANCE_CALCULATED = CASH + FINAL_VALUE;
        const PERCENTAGE_RETURN = ((FINAL_BALANCE_CALCULATED - AMOUNT) / AMOUNT) * 100;
    
        // Objeto SUMMARY con los cálculos finales.
        const SUMMARY = {
          TOTAL_BOUGHT_UNITS: parseFloat(TOTAL_BOUGHT_UNITS.toFixed(5)),
          TOTAL_SOLD_UNITS: parseFloat(TOTAL_SOLD_UNITS.toFixed(5)),
          REMAINING_UNITS: parseFloat(UNITS_HELD.toFixed(5)),
          FINAL_CASH: parseFloat(CASH.toFixed(2)),
          FINAL_VALUE: parseFloat(FINAL_VALUE.toFixed(2)),
          FINAL_BALANCE: parseFloat(FINAL_BALANCE_CALCULATED.toFixed(2)),
          REAL_PROFIT: parseFloat(REAL_PROFIT.toFixed(2)),
          PERCENTAGE_RETURN: parseFloat(PERCENTAGE_RETURN.toFixed(2))
        };
    
        // Objeto DETAIL_ROW (información de registro).
        const DETAIL_ROW = [
          {
            ACTIVED: true,
            DELETED: false,
            DETAIL_ROW_REG: [
              {
                CURRENT: true,
                REGDATE: new Date().toISOString().slice(0, 10), // Fecha actual YYYY-MM-DD
                REGTIME: new Date().toLocaleTimeString('es-ES', { hour12: false }), // Hora actual HH:MM:SS
                REGUSER: USERID // Usuario de la solicitud
              }
            ]
          }
        ];
    
        // Retorna los resultados finales de la simulación con la nueva estructura.
        return {
          SIMULATIONID,
          USERID,
          STRATEGYID,
          SIMULATIONNAME,
          SYMBOL,
          // CORRECCIÓN: Ahora 'INDICATORS' es un objeto con una propiedad 'value'
          // que contiene el arreglo original de 'SPECS' de la solicitud.
          INDICATORS: { value: SPECS },
          AMOUNT: parseFloat(AMOUNT.toFixed(2)),
          STARTDATE,
          ENDDATE,
          SIGNALS,
          SUMMARY,
          CHART_DATA: NEW_CHART_DATA,
          DETAIL_ROW
        };
      } catch (ERROR) {
        // Manejo de errores, imprime el mensaje de error y lo relanza.
        console.error("ERROR EN LA FUNCIÓN REVERSION_SIMPLE:", ERROR.message);
        throw ERROR;
      }
    }

    //No olvidar exportarla
module.exports = {
  reversionSimple,
};