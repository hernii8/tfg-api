'use strict';
module.exports = function(sequelize, DataTypes) {
  var Mensajes = sequelize.define('Mensajes', {
    texto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo: { //0: MENSAJE NORMAL, 1: RESPUESTA LEGAL, 2: ACLARACION, 3: RESPUESTA ACLARACION, 10: archivo, 20: Emerita bot
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });
  Mensajes.associate = function(models) {
    Mensajes.belongsTo(models.Conversaciones);
    Mensajes.belongsTo(models.Usuarios, {
      as: 'Remitente'
    });
    Mensajes.hasOne(models.RespuestasLegales);
  };
  return Mensajes;
};
