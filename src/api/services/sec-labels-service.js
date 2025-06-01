const ztlabels = require('../models/mongodb/ztlabels');
const ztvalues = require('../models/mongodb/ztvalues');

// GET ALL LABELS
async function GetAllLabels(req) {
  try {
    const labelId = req?.req?.query?.LABELID;
    let labels = [];

    if (labelId) {
      const label = await ztlabels.findOne({ LABELID: labelId}).lean();
      if (!label) {
        return { message: `Etiqueta con LABELID '${labelId}' no encontrada o inactiva.` };
      }
      labels = [label];
    } else {
      labels = await ztlabels.find().lean();
    }

    return labels;
  } catch (error) {
    return { error: error.message };
  }
}

// ADD ONE LABEL
async function AddOneLabel(req) {
  try {
    const newLabel = req.req.body.label;
    const now = new Date();

    // Verificar si viene DETAIL_ROW desde el front
    if (!newLabel.DETAIL_ROW) {
      // Si no viene, lo creamos completamente
      newLabel.DETAIL_ROW = {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [
          {
            CURRENT: true,
            REGDATE: now,
            REGTIME: now,
            REGUSER: 'SYSTEM' // Puedes cambiar esto por el usuario logueado
          }
        ]
      };
    } else {
      
      // Si viene DETAIL_ROW, validamos y completamos sus campos
      const detail = newLabel.DETAIL_ROW;

      // Si no vienen los flags, se asignan por defecto
      if (typeof detail.ACTIVED !== 'boolean') {
        detail.ACTIVED = true;
      }
      if (typeof detail.DELETED !== 'boolean') {
        detail.DELETED = false;
      }

      // Validamos si viene DETAIL_ROW_REG
      if (!Array.isArray(detail.DETAIL_ROW_REG) || detail.DETAIL_ROW_REG.length === 0) {
        detail.DETAIL_ROW_REG = [{
          CURRENT: true,
          REGDATE: now,
          REGTIME: now,
          REGUSER: 'SYSTEM'
        }];
      } else {
        // Validar y completar cada entrada de DETAIL_ROW_REG si ya vienen
        detail.DETAIL_ROW_REG = detail.DETAIL_ROW_REG.map(entry => ({
          CURRENT: entry.CURRENT ?? true,
          REGDATE: entry.REGDATE ?? now,
          REGTIME: entry.REGTIME ?? now,
          REGUSER: entry.REGUSER ?? 'SYSTEM'
        }));
      }
    }

    // Guardar la etiqueta
    const savedLabel = await ztlabels.create(newLabel);
    return {
      message: 'Etiqueta creada correctamente.',
      label: JSON.parse(JSON.stringify(savedLabel))
    };

  } catch (error) {
    return { error: error.message };
  }
}


// UPDATE LABEL
async function UpdateOneLabel(req) {
  try {
    const updatedData = req.req.body.label;
    const labelId = req.req.query.LABELID;

    if (!labelId) throw new Error("Se requiere LABELID para actualizar.");

    const label = await ztlabels.findOne({ LABELID: labelId, "DETAIL_ROW.ACTIVED": true });
    if (!label) throw new Error(`Etiqueta no encontrada o inactiva: '${labelId}'`);

    label.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

    const now = new Date();
    label.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: true,
      REGDATE: now,
      REGTIME: now,
      REGUSER: labelId
    });

    for (let key in updatedData) {
      if (key !== "DETAIL_ROW") {
        label[key] = updatedData[key];
      }
    }

    const updatedLabel = await label.save();
    return {
      message: "Etiqueta actualizada correctamente.",
      label: JSON.parse(JSON.stringify(updatedLabel))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// DELETE LOGICAL
async function DelLabelLogically(req) {
  try {
    const labelId = req.req.query?.LABELID;
    const regUser = req.req.query?.REGUSER || 'SYSTEM';

    const label = await ztlabels.findOne({ LABELID: labelId});
    if (!label) throw new Error(`Etiqueta '${labelId}' no encontrada.`);

    label.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

    const now = new Date();
    label.DETAIL_ROW.ACTIVED = false;
    label.DETAIL_ROW.DELETED = true;
    label.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: true,
      REGDATE: now,
      REGTIME: now,
      REGUSER: regUser
    });

    await label.save();
    return {
      message: `Etiqueta '${labelId}' eliminada lógicamente.`,
      label: JSON.parse(JSON.stringify(label))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// ACTIVE LOGICAL
async function ActLabelLogically(req) {
  try {
    const labelId = req.req.query?.LABELID;
    const regUser = req.req.query?.REGUSER || 'SYSTEM';

    const label = await ztlabels.findOne({ LABELID: labelId});
    if (!label) throw new Error(`Etiqueta '${labelId}' no encontrada.`);

    label.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => reg.CURRENT = false);

    const now = new Date();
    label.DETAIL_ROW.ACTIVED = true;
    label.DETAIL_ROW.DELETED = false;
    label.DETAIL_ROW.DETAIL_ROW_REG.push({
      CURRENT: true,
      REGDATE: now,
      REGTIME: now,
      REGUSER: regUser
    });

    await label.save();
    return {
      message: `Etiqueta '${labelId}' activada lógicamente.`,
      label: JSON.parse(JSON.stringify(label))
    };

  } catch (error) {
    return { error: error.message };
  }
}

// DELETE PHYSICAL
async function DelLabelPhysically(req) {
  try {
    const labelId = req.req.query?.LABELID;
    if (!labelId) throw new Error("LABELID no proporcionado.");

    // Elimina el label
    const deletedLabel = await ztlabels.findOneAndDelete({ LABELID: labelId });
    if (!deletedLabel) throw new Error(`Etiqueta '${labelId}' no encontrada.`);

    // Elimina todos los valores asociados al label
    const deletedValues = await ztvalues.deleteMany({ LABELID: labelId });

    return {
      message: `Etiqueta '${labelId}' y ${deletedValues.deletedCount} valores asociados eliminados permanentemente.`,
      label: JSON.parse(JSON.stringify(deletedLabel))
    };

  } catch (error) {
    return { error: error.message };
  }
}

module.exports = {
  GetAllLabels,
  AddOneLabel,
  UpdateOneLabel,
  DelLabelLogically,
  DelLabelPhysically,
  ActLabelLogically
};
