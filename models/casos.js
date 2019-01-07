'use strict';

module.exports = function(sequelize, DataTypes) {
  const Casos = sequelize.define('Casos', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    jurisdiccion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
  });

  Casos.associate = function (models) {
    Casos.hasMany(models.Procesos);
    Casos.belongsToMany(models.Partes, { through: models.PartesCasos});
  };

  return Casos;
};
