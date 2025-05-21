const cds = require('@sap/cds');
const { GetAllUsers, AddOneUser, UpdateOneUser, DelUserLogically, DelUserPhysically, ActivateUser } = require('../services/sec-users-service');

class UsersController extends cds.ApplicationService {
    async init() {

        this.on('getallusers', async (req) => {
            return GetAllUsers(req);
        });

        this.on('addoneuser', async (req) => {
            return AddOneUser(req);
        });

        this.on('updateoneuser', async (req) => {
            return UpdateOneUser(req);
        });

        this.on('deluserlogically', async (req) => {
            return DelUserLogically(req);
        });

        this.on('deluserphysically', async (req) => {
            return DelUserPhysically(req);
        });

        this.on('activateuser', async (req) => {
            return ActivateUser(req);
        });

        return await super.init();
    }
};

module.exports = UsersController;
