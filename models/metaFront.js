'use strict';
module.exports = function(sequelize, DataTypes) {
  var MetaFront = sequelize.define('MetaFront', {
    skipTarifas: DataTypes.BOOLEAN,
    privacidadContacto: DataTypes.BOOLEAN,
    privacidadRegistro: DataTypes.BOOLEAN,
    noticiasContacto: DataTypes.BOOLEAN,
    noticiasRegistro: DataTypes.BOOLEAN,
    userEmail: DataTypes.STRING
  });
  MetaFront.associate = function(models) {
    MetaFront.belongsTo(models.Usuarios);
  };
  return MetaFront;
};
