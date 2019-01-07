'use strict';

module.exports = function (sequelize, DataTypes) {
  const Presupuestos = sequelize.define('Presupuestos', {
    resumen: DataTypes.TEXT,
    trabajos: DataTypes.TEXT,
    honorarios: DataTypes.TEXT,
    formaPago: DataTypes.TEXT,
    importe: DataTypes.FLOAT,
    importeTotal: DataTypes.FLOAT,
    porcentajeIntermediario: DataTypes.INTEGER,
  });

  Presupuestos.associate = function (models) {
    Presupuestos.belongsTo(models.RespuestasLegales);
  };

  return Presupuestos;
};
