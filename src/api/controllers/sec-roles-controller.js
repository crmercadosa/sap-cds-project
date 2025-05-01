const cds = require('@sap/cds');
const { GetAllRoles, AddOneRole, UpdateOneRole, DelRoleLogically, DelRolePhysically } = require('../services/sec-roles-service');

class RolesController extends cds.ApplicationService {
    async init() {

        this.on('getallroles', async (req) => {
            return GetAllRoles(req);
        });

        this.on('addonerole', async (req) => {
            return AddOneRole(req);
        });

        this.on('updateonerole', async (req) => {
            return UpdateOneRole(req);
        });

        this.on('delrolelogically', async (req) => {
            return DelRoleLogically(req);
        });

        this.on('delrolephysically', async (req) => {
            return DelRolePhysically(req);
        });

        return await super.init();
    }
}

module.exports = RolesController;
