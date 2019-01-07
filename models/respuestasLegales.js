'use strict';

module.exports = function (sequelize, DataTypes) {
   const RespuestasLegales = sequelize.define('RespuestasLegales', {
      estado: {
         type: DataTypes.ENUM('BORRADOR', 'ENVIADA', 'ACEPTADA', 'PENDIENTE_ACLARACION', 'RECHAZADA', 'CERRADA'),
         allowNull: false,
         defaultValue: 'BORRADOR'
      },
      precio: {
         type: DataTypes.FLOAT
      },
      presupuestoPath: DataTypes.STRING,
      textoBorrador: {
         type: DataTypes.TEXT,
         allowNull: false
      }
   });
   RespuestasLegales.associate = function (models) {
      RespuestasLegales.belongsTo(models.Conversaciones);
      RespuestasLegales.belongsTo(models.Mensajes);
      RespuestasLegales.belongsTo(models.Pagos);
      RespuestasLegales.hasOne(models.Valoraciones);
      RespuestasLegales.hasOne(models.Presupuestos);
      RespuestasLegales.belongsTo(models.CategoriasRespuesta, {
         foreignKey: 'CategoriaRespuestaId'
      });
   };

   return RespuestasLegales;
};
