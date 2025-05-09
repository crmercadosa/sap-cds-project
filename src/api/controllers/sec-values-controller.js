const cds = require('@sap/cds');
const { GetAllValues, AddOneValue, UpdateOneValue, DelValueLogically, DelValuePhysically } = require('../services/sec-values-service');

class RolesController extends cds.ApplicationService {
    async init() {

        this.on('getallvalues', async (req) => {
            return GetAllValues(req);
        });

        this.on('addonevalue', async (req) => {
            return AddOneValue(req);
        });

        this.on('updateonevalue', async (req) => {
            return UpdateOneValue(req);
        });

        this.on('delvaluelogically', async (req) => {
            return DelValueLogically(req);
        });

        this.on('delvaluephysically', async (req) => {
            return DelValuePhysically(req);
        });

        return await super.init();
    }
}

module.exports = RolesController;
