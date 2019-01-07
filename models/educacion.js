'use strict';
module.exports = function(sequelize, DataTypes) {
  var Educacion = sequelize.define('Educacion', {
    institucion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    titulacion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    diplomas: {
      type: DataTypes.STRING
    },
    periodo_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    periodo_end: {
      type: DataTypes.DATE
    }
  });
  Educacion.associate = function(models) {
    Educacion.belongsTo(models.Profesionales);
  };
  return Educacion;
};
