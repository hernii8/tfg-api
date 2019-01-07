'use strict';

module.exports = function (sequelize, DataTypes) {
  const Colegios = sequelize.define('Colegios', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    localizacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }
  });

  Colegios.associate = function (models) {
    Colegios.belongsToMany(models.Profesionales, {through: models.ProfesionalesColegios});
  };

  return Colegios;
};
