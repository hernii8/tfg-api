'use strict';

module.exports = function (sequelize, DataTypes) {
  const PosicionesProcesales = sequelize.define('PosicionesProcesales', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  });

  PosicionesProcesales.associate = function (models) {
    PosicionesProcesales.hasMany(models.FallosPartes);
  };

  return PosicionesProcesales;
};
