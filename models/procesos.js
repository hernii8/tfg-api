'use strict';

module.exports = function (sequelize, DataTypes) {
  const Procesos = sequelize.define('Procesos', {
    numeroProceso: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numeroSeccion: DataTypes.STRING,
    numeroSeccionAnotador: DataTypes.STRING,
    salaAnotador: DataTypes.STRING,
    juzgadoAnotador: DataTypes.STRING,
    partidoJudicialAnotador: DataTypes.STRING
  }, {
    indexes: [{
      fields: ['numeroProceso'],
      name: 'numeroProcesoIndex'
    }]
  });

  Procesos.associate = function (models) {
    Procesos.belongsTo(models.Casos);
    Procesos.belongsTo(models.OrganosJudiciales);
    Procesos.belongsTo(models.Instancias);
    Procesos.belongsTo(models.Salas);
    Procesos.hasMany(models.Resoluciones);
  };

  return Procesos;
};
