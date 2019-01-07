'use strict';

module.exports = function (sequelize, DataTypes) {
   const Valoraciones = sequelize.define('Valoraciones', {
      rating: {
         type: DataTypes.INTEGER,
         allowNull: true,
         defaultValue: 3
      },
      opinion: {
         type: DataTypes.TEXT
      }
   });

   Valoraciones.associate = function (models) {
      Valoraciones.belongsTo(models.Profesionales);
      Valoraciones.belongsTo(models.RespuestasLegales);
   };

   return Valoraciones;
};
