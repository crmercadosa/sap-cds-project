const cds = require('@sap/cds');
const { GetAllLabels, AddOneLabel, UpdateOneLabel, DelLabelLogically, DelLabelPhysically } = require('../services/sec-labels-service');

class RolesController extends cds.ApplicationService {
    async init() {

        this.on('getalllabels', async (req) => {
            return GetAllLabels(req);
        });

        this.on('addonelabel', async (req) => {
            return AddOneLabel(req);
        });

        this.on('updateonelabel', async (req) => {
            return UpdateOneLabel(req);
        });

        this.on('dellabellogically', async (req) => {
            return DelLabelLogically(req);
        });

        this.on('dellabelphysically', async (req) => {
            return DelLabelPhysically(req);
        });

        return await super.init();
    }
}

module.exports = RolesController;
