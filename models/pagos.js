'use strict';

module.exports = function (sequelize, DataTypes) {
   const Pagos = sequelize.define('Pagos', {
      stripeId: {
         type: DataTypes.STRING(126),
         allowNull: false,
         unique: true
      },
      importeTotal: {
         type: DataTypes.FLOAT,
         allowNull: false
      },
      importeBase: {
         type: DataTypes.FLOAT,
         allowNull: false
      },
      retencion: {
         type: DataTypes.FLOAT,
         allowNull: true
      },
      idFacturaProfesional: {
         type: DataTypes.INTEGER,
         defaultValue: 1
      },
      idFacturaEmerita: {
         type: DataTypes.INTEGER,
      },
      emisorEsEntidad: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      iva: {
         type: DataTypes.FLOAT,
         defaultValue: 0.21
      },
      nombreEmisor: {
         type: DataTypes.STRING
      },
      nombreReceptor: {
         type: DataTypes.STRING
      },
      direccionEmisor: {
         type: DataTypes.TEXT
      },
      direccionReceptor: {
         type: DataTypes.TEXT
      },
      cifEmisor: {
         type: DataTypes.STRING
      },
      cifReceptor: {
         type: DataTypes.STRING
      },
      comisionEmerita: {
         type: DataTypes.FLOAT
      }
   });
   Pagos.associate = function (models) {
      Pagos.hasOne(models.Compras);
      Pagos.belongsTo(models.Usuarios, { as: "Receptor" });
      Pagos.hasOne(models.RespuestasLegales);
   };

   return Pagos;
};
