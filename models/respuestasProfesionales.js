"use strict";

module.exports = function(sequelize, DataTypes) {
  var RespuestasProfesionales = sequelize.define('RespuestasProfesionales', {
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  });
  return RespuestasProfesionales;
};
