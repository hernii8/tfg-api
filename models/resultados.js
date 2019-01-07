'use strict';

module.exports = function (sequelize, DataTypes) {
  const Resultados = sequelize.define('Resultados', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    scoring: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
      },
    scoringTasaExito: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null
    }
  });

  Resultados.associate = function (models) {
    Resultados.hasMany(models.FallosPartes);
  };

  return Resultados;
};
