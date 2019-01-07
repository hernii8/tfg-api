'use strict';

module.exports = function (sequelize, DataTypes) {
  const Instancias = sequelize.define('Instancias', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  });

  Instancias.associate = function (models) {
  };

  return Instancias;
};
