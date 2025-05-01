const cds = require('@sap/cds');
const ZTROLES = require('../models/mongodb/ztroles'); // El esquema Mongoose de roles

// GET ALL/GET ONE: Obtener todos o un rol activo
async function GetAllRoles(req) {
    try {
        const roleId = req?.req?.query?.ROLEID;

        if (roleId) {
            // Buscar un solo rol específico
            const role = await ZTROLES.findOne({ ROLEID: roleId, 'DETAIL_ROW.ACTIVED': true }).lean();
            if (!role) {
                req.error(404, `Rol no encontrado o inactivo: ${roleId}`);
                return;
            }
            return role;
        } else {
            // Buscar todos los roles activos
            const roles = await ZTROLES.find({ 'DETAIL_ROW.ACTIVED': true }).lean();
            return roles;
        }

    } catch (error) {
        req.error(500, `Error obteniendo roles: ${error.message}`);
    }
}

// POST: Agregar un nuevo rol
async function AddOneRole(req) {
    try {
      const newRol = req.req.body.role;
  
      // Crear el campo DETAIL_ROW automáticamente
      const now = new Date();
      newRol.DETAIL_ROW = {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [
          {
            CURRENT: true,
            REGDATE: now,
            REGTIME: now,
            REGUSER: newRol.ROLEID
          }
        ]
      };
  
      // Guardar en la base de datos
      const savedRol = await ZTROLES.create(newRol);
  
      return {
        message: 'Rol insertado correctamente.',
        role: JSON.parse(JSON.stringify(savedRol))
      };
  
    } catch (error) {
      return { error: error.message };
    }
  }
  

// UPDATE: Actualizar un rol existente
async function UpdateOneRole(req) {
    try {
        const updatedRoleData = req.req.body.role;  // Datos del rol a actualizar
        const roleId = req.req.query.ROLEID;  // ID del rol a actualizar

        if (!roleId) {
            throw new Error("El campo 'ROLEID' es obligatorio para actualizar un rol.");
        }

        // Buscar rol existente
        const role = await ZTROLES.findOne({
            ROLEID: roleId,
            "DETAIL_ROW.ACTIVED": true
        });
        if (!role) {
            throw new Error(`Rol no encontrado o inactivo: ${roleId}`);
        }

        // Marcar todos los registros anteriores como CURRENT: false
        role.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

        // Agregar nuevo registro de auditoría
        const now = new Date();
        role.DETAIL_ROW.DETAIL_ROW_REG.push({
            CURRENT: true,
            REGDATE: now,
            REGTIME: now,
            REGUSER: roleId  // Suponemos que el ROLEID es el usuario que hace la actualización
        });

        // Actualizar los demás campos (excepto DETAIL_ROW completo)
        for (let key in updatedRoleData) {
            if (key !== "DETAIL_ROW") {
                role[key] = updatedRoleData[key];
            }
        }

        // Guardar cambios en la base de datos
        const updatedRole = await role.save();

        return {
            message: "Rol actualizado correctamente.",
            role: JSON.parse(JSON.stringify(updatedRole))
        };

    } catch (error) {
        return { error: error.message };
    }
}


// DELETE LOGICALLY: Eliminar un rol lógicamente (marcarlo como inactivo y eliminado)
async function DelRoleLogically(req) {
    try {
        const roleId = req.req.query?.ROLEID;
        const regUser = req.req.query?.REGUSER; // Usuario que realiza la acción

        if (!roleId) {
            throw new Error("Se requiere el ROLEID para eliminar lógicamente el rol.");
        }else if(!regUser) {
            throw new Error("Se requiere el estar logueado para eliminar lógicamente el rol.");
        }

        const role = await ZTROLES.findOne({
            ROLEID: roleId,
            "DETAIL_ROW.ACTIVED": true  // Asegurarse de que el rol esté activo
        });

        if (!role) {
            throw new Error(`Rol no encontrado o inactivo: '${roleId}'`);
        }

        // Marcar como no current los registros anteriores
        role.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

        // Agregar nuevo registro de modificación
        const now = new Date();
        const newReg = {
            CURRENT: true,
            REGDATE: now,
            REGTIME: now,
            REGUSER: regUser
        };

        // Desactivar el rol y marcarlo como eliminado
        role.DETAIL_ROW.ACTIVED = false;
        role.DETAIL_ROW.DELETED = true;
        role.DETAIL_ROW.DETAIL_ROW_REG.push(newReg);

        // Guardar los cambios
        await role.save();

        return {
            message: `Rol '${roleId}' eliminado lógicamente.`,
            role: JSON.parse(JSON.stringify(role))
        };

    } catch (error) {
        return { error: error.message };
    }
}

// DELETE PHYSICALLY: Eliminar un rol físicamente de la base de datos
async function DelRolePhysically(req) {
    try {
        const roleId = req.req.query?.ROLEID;

        if (!roleId) {
            throw new Error("Se requiere el ROLEID para eliminar físicamente el rol.");
        }
        
        const deletedRole = await ZTROLES.findOneAndDelete({ ROLEID: roleId });

        if (!deletedRole) {
            throw new Error(`No se encontró un rol con ROLEID '${roleId}' para eliminar.`);
        }

        return {
            message: `Rol '${roleId}' eliminado de la base de datos.`,
            deletedRole: JSON.parse(JSON.stringify(deletedRole))
        };    
        
        } catch (error) {
        req.error(500, `Error eliminando físicamente el rol: ${error.message}`);
    }
}

module.exports = {
    GetAllRoles,
    AddOneRole,
    UpdateOneRole,
    DelRoleLogically,
    DelRolePhysically
};
