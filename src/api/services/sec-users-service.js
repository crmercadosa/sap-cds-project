const ztusers = require('../models/mongodb/ztusers');
const ztroles = require('../models/mongodb/ztroles');

// GET ALL: Obtiene todos o un solo usuario y agrega el nombre del rol en la búsqueda
async function GetAllUsers(req) {
    try {
      const userId = req?.req?.query?.USERID;
  
      // Obtener todos los roles activos
      const roles = await ztroles.find({ "DETAIL_ROW.ACTIVED": true }).lean();
  
      // Crear mapa para acceso rápido a nombres de roles
      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.ROLEID] = role.ROLENAME;
      });
  
      let users = [];
  
      if (userId) {
        // Si viene USERID, buscar solo un usuario activo
        const user = await ztusers.findOne({ USERID: userId, "DETAIL_ROW.ACTIVED": true }).lean();
        if (!user) {
          return { message: `Usuario con USERID '${userId}' no encontrado o inactivo.` };
        }
  
        // Enriquecer los roles con el nombre
        const rolesWithNames = (user.ROLES || []).map(role => ({
          ...role,
          ROLENAME: roleMap[role.ROLEID] || 'Rol no encontrado'
        }));
  
        users = [{ ...user, ROLES: rolesWithNames }];
      } else {
        // Si no viene USERID, buscar todos los usuarios activos
        const allUsers = await ztusers.find({ "DETAIL_ROW.ACTIVED": true }).lean();
  
        users = allUsers.map(user => {
          const rolesWithNames = (user.ROLES || []).map(role => ({
            ...role,
            ROLENAME: roleMap[role.ROLEID] || 'Rol no encontrado'
          }));
          return {
            ...user,
            ROLES: rolesWithNames
          };
        });
      }
  
      return {
        message: `Registros encontrados: ${users.length}.`,
        users: users
      };
  
    } catch (error) {
      return { error: error.message };
    }
  }  

// POST: Agrega un nuevo usuario, incluídos los roles que se requieran para este
async function AddOneUser(req) {
  try {
    const newUser = req.req.body.user;

    // Si no hay ROLES, inicializamos como arreglo vacío
    if (!Array.isArray(newUser.ROLES)) {
      newUser.ROLES = [];
    }

    // Validar roles solo si hay alguno válido
    if (newUser.ROLES && newUser.ROLES.length > 0) {
        // Filtrar roles con ROLEID vacío o nulo
        const filteredRoles = newUser.ROLES.filter(role => role.ROLEID && role.ROLEID.trim() !== "");

        if (filteredRoles.length > 0) {
            const inputRoles = filteredRoles.map(role => role.ROLEID);

            const validRoles = await ztroles.find({ ROLEID: { $in: inputRoles } }).lean();

            if (validRoles.length !== inputRoles.length) {
                const validIds = validRoles.map(r => r.ROLEID);
                const invalidIds = inputRoles.filter(id => !validIds.includes(id));
                throw new Error(`Roles inválidos: ${invalidIds.join(', ')}`);
            }

            // Actualizar newUser.ROLES solo con los roles válidos
            newUser.ROLES = filteredRoles;
        } else {
            // Si no hay roles válidos, limpiar el array
            newUser.ROLES = [];
        }
    }

    // Crear el campo DETAIL_ROW automáticamente
    const now = new Date();
    newUser.DETAIL_ROW = {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [
        {
          CURRENT: true,
          REGDATE: now,
          REGTIME: now,
          REGUSER: newUser.USERID
        }
      ]
    };

    // Guardar en la base de datos
    const savedUser = await ztusers.create(newUser);

    return {
      message: 'Usuario insertado correctamente.',
      user: JSON.parse(JSON.stringify(savedUser))
    };

  } catch (error) {
    return { error: error.message };
  }
}


// UPDATE: Actualiza cualquier campo del usuario, incluidos los roles
async function UpdateOneUser(req) {
    try {
      const updatedUserData = req.req.body.user;
      const userId = req.req.query.USERID;
  
      if (!userId) {
        throw new Error("El campo 'USERID' es obligatorio para actualizar un usuario.");
      }
  
      // Validar roles solo si hay alguno válido
      if (updatedUserData.ROLES && updatedUserData.ROLES.length > 0) {
          // Filtrar roles con ROLEID vacío o nulo
          const filteredRoles = updatedUserData.ROLES.filter(role => role.ROLEID && role.ROLEID.trim() !== "");

          if (filteredRoles.length > 0) {
              const inputRoles = filteredRoles.map(role => role.ROLEID);

              const validRoles = await ztroles.find({ ROLEID: { $in: inputRoles } }).lean();

              if (validRoles.length !== inputRoles.length) {
                  const validIds = validRoles.map(r => r.ROLEID);
                  const invalidIds = inputRoles.filter(id => !validIds.includes(id));
                  throw new Error(`Roles inválidos: ${invalidIds.join(', ')}`);
              }

              // Actualizar updatedUserData.ROLES solo con los roles válidos
              updatedUserData.ROLES = filteredRoles;
          } else {
              // Si no hay roles válidos, limpiar el array
              updatedUserData.ROLES = [];
          }
      }
  
      // Buscar usuario existente
      const user = await ztusers.findOne({ 
        USERID: userId, 
        "DETAIL_ROW.ACTIVED": true 
      });
      if (!user) {
        throw new Error(`Usuario no encontrado o inactivo: ${userId}`);
      }
  
      // Marcar todos los registros anteriores como CURRENT: false
      user.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);
  
      // Agregar nuevo registro de auditoría
      const now = new Date();
      user.DETAIL_ROW.DETAIL_ROW_REG.push({
        CURRENT: true,
        REGDATE: now,
        REGTIME: now,
        REGUSER: userId
      });
  
      // Actualizar los demás campos (excepto DETAIL_ROW completo)
      for (let key in updatedUserData) {
        if (key !== "DETAIL_ROW") {
          user[key] = updatedUserData[key];
        }
      }
  
      // Guardar cambios en la base de datos
      const updatedUser = await user.save();
  
      return {
        message: "Usuario actualizado correctamente.",
        user: JSON.parse(JSON.stringify(updatedUser))
      };
  
    } catch (error) {
      return { error: error.message };
    }
  }

// DELETE LOGICALLY: Elimina un usuario lógicamente, marcando la propiedad DETAIL_ROW.DELETED como true
async function DelUserLogically(req) {
    try {
      const userId = req.req.query?.USERID;
      const regUser = req.req.query?.REGUSER || userId; // esto es para validar quien hace la acción del borrado lógico
                                                        // Si el mismo usuario u otro.
  
      if (!userId) {
        throw new Error("Se requiere el USERID para eliminar lógicamente el usuario.");
      }
  
      const user = await ztusers.findOne({ 
        USERID: userId, 
        "DETAIL_ROW.ACTIVED": true 
      });
  
      if (!user) {
        throw new Error(`Usuario no encontrado o inactivo: '${userId}'`);
      }
  
      // Marcar como no current los anteriores
      user.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);
  
      // Agregar nuevo registro de modificación
      const now = new Date();
      const newReg = {
        CURRENT: true,
        REGDATE: now,
        REGTIME: now,
        REGUSER: regUser
      };
  
      user.DETAIL_ROW.ACTIVED = false;
      user.DETAIL_ROW.DELETED = true;
      user.DETAIL_ROW.DETAIL_ROW_REG.push(newReg);
  
      await user.save();
  
      return {
        message: `Usuario '${userId}' eliminado lógicamente.`,
        user: JSON.parse(JSON.stringify(user))
      };
  
    } catch (error) {
      return { error: error.message };
    }
  }

// DELETE PHYSICALLY: Elimina un usuario fisicamente de la base de datos
  async function DelUserPhysically(req) {
    try {
      const userId = req.req.query?.USERID;
  
      if (!userId) {
        throw new Error("Se requiere el USERID para eliminar físicamente el usuario.");
      }
  
      const deletedUser = await ztusers.findOneAndDelete({ USERID: userId });
  
      if (!deletedUser) {
        throw new Error(`No se encontró un usuario con USERID '${userId}' para eliminar.`);
      }
  
      return {
        message: `Usuario '${userId}' eliminado de la base de datos.`,
        deletedUser: JSON.parse(JSON.stringify(deletedUser))
      };
  
    } catch (error) {
      return { error: error.message };
    }
  }
  

module.exports = {
    GetAllUsers,
    AddOneUser,
    UpdateOneUser,
    DelUserLogically,
    DelUserPhysically
};
