'use strict';

module.exports = function(sequelize, DataTypes) {

  const MagistradosResoluciones = sequelize.define('MagistradosResoluciones', {
    ponente: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    }
  });

  MagistradosResoluciones.associate = function(models){
  }

  return MagistradosResoluciones;
};
