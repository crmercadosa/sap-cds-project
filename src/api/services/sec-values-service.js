const ztvalues = require('../models/mongodb/ztvalues');

// GET ALL VALUES
async function GetAllValues(req) {
  try {
    const labelid = req?.req?.query.LABELID;
    const companyid = req?.req?.query.COMPANYID;
    let values = [];

    if (labelid) {
      if(companyid){
        values = await ztvalues.find({ LABELID: labelid, COMPANYID: companyid, "DETAIL_ROW.ACTIVED": true }).lean();
      }else{
        values = await ztvalues.find({ LABELID: labelid, "DETAIL_ROW.ACTIVED": true }).lean();
      }

      return values;
    } else {
      values = await ztvalues.find({ "DETAIL_ROW.ACTIVED": true }).lean();

      return values;
    }

  } catch (error) {
    return { error: error.message };
  }
}

// ADD ONE VALUE
async function AddOneValue(req) {
  try {
    const newValue = req.req.body.value;

    const now = new Date();
    newValue.DETAIL_ROW = {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [
        {
          CURRENT: true,
          REGDATE: now,
          REGTIME: now,
          REGUSER: newValue.VALUEID // o el usuario que esté logueado
        }
      ]
    };

    const savedValue = await ztvalues.create(newValue);
    return {
      message: 'Valor creado correctamente.',
      value: JSON.parse(JSON.stringify(savedValue))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// UPDATE VALUE
async function UpdateOneValue(req) {
  try {
    const updatedData = req.req.body.value;
    const valueId = req.req.query.VALUEID;

    if (!valueId) throw new Error("Se requiere VALUEID para actualizar.");

    const value = await ztvalues.findOne({ VALUEID: valueId, "DETAIL_ROW.ACTIVED": true });
    if (!value) throw new Error(`Valor no encontrado o inactivo: '${valueId}'`);

    value.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

    const now = new Date();
    value.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: true,
      REGDATE: now,
      REGTIME: now,
      REGUSER: 'SYSTEM'
    });

    for (let key in updatedData) {
      if (key !== "DETAIL_ROW") {
        value[key] = updatedData[key];
      }
    }

    const updatedValue = await value.save();
    return {
      message: "Valor actualizado correctamente.",
      value: JSON.parse(JSON.stringify(updatedValue))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// DELETE LOGICAL VALUE
async function DelValueLogically(req) {
  try {
    const valueId = req.req.query?.VALUEID;
    const regUser = req.req.query?.REGUSER || valueId;

    const value = await ztvalues.findOne({ VALUEID: valueId, "DETAIL_ROW.ACTIVED": true });
    if (!value) throw new Error(`Valor '${valueId}' no encontrado o ya inactivo.`);

    value.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

    const now = new Date();
    value.DETAIL_ROW.ACTIVED = false;
    value.DETAIL_ROW.DELETED = true;
    value.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: true,
      REGDATE: now,
      REGTIME: now,
      REGUSER: regUser
    });

    await value.save();
    return {
      message: `Valor '${valueId}' eliminado lógicamente.`,
      value: JSON.parse(JSON.stringify(value))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// DELETE PHYSICAL VALUE
async function DelValuePhysically(req) {
  try {
    const valueId = req.req.query?.VALUEID;

    const deleted = await ztvalues.findOneAndDelete({ VALUEID: valueId });
    if (!deleted) throw new Error(`Valor '${valueId}' no encontrado.`);

    return {
      message: `Valor '${valueId}' eliminado permanentemente.`,
      value: JSON.parse(JSON.stringify(deleted))
    };

  } catch (error) {
    return { error: error.message };
  }
}

module.exports = {
  GetAllValues,
  AddOneValue,
  UpdateOneValue,
  DelValueLogically,
  DelValuePhysically
};
