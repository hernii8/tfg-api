'use strict';

module.exports = function(sequelize, DataTypes) {
  const Salas = sequelize.define('Salas', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Salas.associate = function(models) {
  };

  return Salas;
};
