const ztlabels = require('../models/mongodb/ztlabels');

// GET ALL LABELS
async function GetAllLabels(req) {
  try {
    const labelId = req?.req?.query?.LABELID;
    let labels = [];

    if (labelId) {
      const label = await ztlabels.findOne({ LABELID: labelId, "DETAIL_ROW.ACTIVED": true }).lean();
      if (!label) {
        return { message: `Etiqueta con LABELID '${labelId}' no encontrada o inactiva.` };
      }
      labels = [label];
    } else {
      labels = await ztlabels.find({ "DETAIL_ROW.ACTIVED": true }).lean();
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
    newLabel.DETAIL_ROW = {
      ACTIVED: true,
      DELETED: false,
      DETAIL_ROW_REG: [
        {
          CURRENT: true,
          REGDATE: now,
          REGTIME: now,
          REGUSER: newLabel.LABELID // o quien esté logueado
        }
      ]
    };

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
    const regUser = req.req.query?.REGUSER || labelId;

    const label = await ztlabels.findOne({ LABELID: labelId, "DETAIL_ROW.ACTIVED": true });
    if (!label) throw new Error(`Etiqueta '${labelId}' no encontrada o ya inactiva.`);

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

// DELETE PHYSICAL
async function DelLabelPhysically(req) {
  try {
    const labelId = req.req.query?.LABELID;

    const deleted = await ztlabels.findOneAndDelete({ LABELID: labelId });
    if (!deleted) throw new Error(`Etiqueta '${labelId}' no encontrada.`);

    return {
      message: `Etiqueta '${labelId}' eliminada permanentemente.`,
      label: JSON.parse(JSON.stringify(deleted))
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
  DelLabelPhysically
};
