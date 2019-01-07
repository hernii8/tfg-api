'use strict';

module.exports = function (sequelize, DataTypes) {
  const TipoFallos = sequelize.define('TipoFallos', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    penal: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    }
  });

  TipoFallos.associate = function (models) {
    TipoFallos.hasMany(models.Fallos);
    TipoFallos.belongsTo(models.Resultados, {as: 'ResultadoActivo'});
    TipoFallos.belongsTo(models.Resultados, {as: 'ResultadoPasivo'});
  };

  return TipoFallos;
};
