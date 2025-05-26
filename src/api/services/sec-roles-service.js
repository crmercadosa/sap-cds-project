const cds = require("@sap/cds");
const ZTROLES = require('../models/mongodb/ztroles');
const ZTUSERS = require('../models/mongodb/ztusers');
const ZTVALUES = require('../models/mongodb/ztvalues');
// GET ALL/GET ONE
async function GetAllRoles(req) {
  try {
    const roleId = req?.req?.query?.ROLEID;
    if (roleId) {
      const role = await ZTROLES.findOne({ ROLEID: roleId }).lean();
      if (!role) {
        req.error(404, `Rol no encontrado: ${roleId}`);
        return;
      }
      return role;
    } else {
      const roles = await ZTROLES.find().lean();
      return roles;
    }
  } catch (error) {
    req.error(500, `Error obteniendo roles: ${error.message}`);
  }
}

// POST
async function AddOneRole(req) {
  try {
    const newRol = req.req.body.role;
    const now = new Date();
    newRol.DETAIL_ROW = {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [{
        CURRENT: true,
        REGDATE: now,
        REGTIME: now,
        REGUSER: newRol.ROLEID
      }]
    };
    const savedRol = await ZTROLES.create(newRol);
    return { message: 'Rol insertado correctamente.', role: savedRol };
  } catch (error) {
    return { error: error.message };
  }
}

// UPDATE
async function UpdateOneRole(req) {
  try {
    const updatedRoleData = req.req.body.role;
    const roleId = req.req.query.ROLEID;
    if (!roleId) throw new Error("Falta ROLEID.");

    const role = await ZTROLES.findOne({ ROLEID: roleId, "DETAIL_ROW.ACTIVED": true });
    if (!role) throw new Error(`Rol no encontrado: ${roleId}`);

    role.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);
    const now = new Date();
    role.DETAIL_ROW.DETAIL_ROW_REG.push({ CURRENT: true, REGDATE: now, REGTIME: now, REGUSER: roleId });

    for (let key in updatedRoleData) {
      if (key !== "DETAIL_ROW") role[key] = updatedRoleData[key];
    }

    const updatedRole = await role.save();
    return { message: "Rol actualizado correctamente.", role: updatedRole };
  } catch (error) {
    return { error: error.message };
  }
}

// DELETE LOGICAL
async function DelRoleLogically(req) {
  try {
    const roleId = req.req.query?.ROLEID;
    const regUser = req.req.query?.REGUSER;
    if (!roleId || !regUser) throw new Error("Faltan parámetros.");

    const role = await ZTROLES.findOne({ ROLEID: roleId, "DETAIL_ROW.ACTIVED": true });
    if (!role) throw new Error(`Rol no encontrado: ${roleId}`);

    role.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);
    const now = new Date();
    role.DETAIL_ROW.DETAIL_ROW_REG.push({ CURRENT: true, REGDATE: now, REGTIME: now, REGUSER: regUser });

    role.DETAIL_ROW.ACTIVED = false;
    role.DETAIL_ROW.DELETED = true;

    await role.save();
    return { message: `Rol '${roleId}' eliminado lógicamente.`, role };
  } catch (error) {
    return { error: error.message };
  }
}

// DELETE PHYSICAL
async function DelRolePhysically(req) {
  try {
    const roleId = req.req.query?.ROLEID;
    if (!roleId) throw new Error("Falta ROLEID.");
    const deletedRole = await ZTROLES.findOneAndDelete({ ROLEID: roleId });
    if (!deletedRole) throw new Error(`Rol no encontrado: ${roleId}`);
    return { message: `Rol '${roleId}' eliminado.`, deletedRole };
  } catch (error) {
    req.error(500, `Error eliminando rol: ${error.message}`);
  }
}

// GET DETAIL WITH APP, VIEW, PROCESSES
async function GetRoleDetails(req) {
  try {
    const roleId = req?.query?.ROLEID || req?.data?.ROLEID;
    if (!roleId) throw new Error("Falta ROLEID.");

    const role = await ZTROLES.findOne({ ROLEID: roleId }).lean();
    if (!role) throw new Error("Rol no encontrado.");

    const users = await ZTUSERS.find({ "ROLES.ROLEID": roleId }, {
      USERID: 1,
      USERNAME: 1,
      FIRSTNAME: 1,
      LASTNAME: 1
    }).lean();

    const processes = [];
    for (const p of role.PRIVILEGES || []) {
      const proc = await ZTVALUES.findOne({ LABELID: "IdProcesses", VALUEID: p.PROCESSID }).lean();
      const viewId = proc?.VALUEPAID?.split("-")[1];
      const view = viewId ? await ZTVALUES.findOne({ LABELID: "IdViews", VALUEID: viewId }).lean() : null;
      const appId = view?.VALUEPAID?.split("-")[1];
      const app = appId ? await ZTVALUES.findOne({ LABELID: "IdApplications", VALUEID: appId }).lean() : null;

      processes.push({
        PROCESSID: p.PROCESSID,
        PROCESSNAME: proc?.VALUE || "",
        VIEWID: view?.VALUEID || "",
        VIEWNAME: view?.VALUE || "",
        APPLICATIONID: app?.VALUEID || "",
        APPLICATIONNAME: app?.VALUE || "",
        PRIVILEGES: (p.PRIVILEGEID || []).map(id => ({ PRIVILEGEID: id, PRIVILEGENAME: id }))
      });
    }

    return {
      ROLEID: role.ROLEID,
      ROLENAME: role.ROLENAME,
      DESCRIPTION: role.DESCRIPTION,
      PROCESSES: processes,
      USERS: users
    };
  } catch (error) {
    req.error(500, `Error obteniendo detalles del rol: ${error.message}`);
  }
}

// GET ONLY USERS
async function GetRoleUsers(req) {
  try {
     const roleId = req?.query?.ROLEID || req?.data?.ROLEID;
    if (!ROLEID) throw new Error("Falta ROLEID");

    const users = await ZTUSERS.find(
      { "ROLES.ROLEID": ROLEID },
      { USERID: 1, USERNAME: 1, COMPANYNAME: 1, _id: 0 }
    ).lean();

    return users;
  } catch (error) {
    req.error(500, `Error obteniendo usuarios del rol: ${error.message}`);
  }
}

module.exports = {
  GetAllRoles,
  AddOneRole,
  UpdateOneRole,
  DelRoleLogically,
  DelRolePhysically,
  GetRoleDetails,
  GetRoleUsers
};
