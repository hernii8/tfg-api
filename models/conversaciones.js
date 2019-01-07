'use strict';
module.exports = function(sequelize, DataTypes) {
  var Conversaciones = sequelize.define('Conversaciones', {
    asunto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('CONV_INICIAL', 'ACEPTADA', 'RECHAZADA', 'CASO_CONFIGURADO', 'RESPUESTA_LEGAL', 'PREGUNTA', 'ACLARACION'),
      allowNull: false,
      defaultValue: 'CONV_INICIAL'
    },
    visto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
  Conversaciones.associate = function(models) {
    Conversaciones.belongsToMany(models.Usuarios, {
      through: 'ConversacionesUsuarios'
    });
    Conversaciones.hasMany(models.Mensajes);
    Conversaciones.hasOne(models.RespuestasLegales);
  };
  return Conversaciones;
};
