'use strict';
module.exports = function(sequelize, DataTypes) {
  var Experiencia = sequelize.define('Experiencia', {
    cargo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ubicacion: {
      type: DataTypes.STRING
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    periodo_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    periodo_end: {
      type: DataTypes.DATE
    },
  });

  Experiencia.associate = function(models) {
    Experiencia.belongsTo(models.Profesionales);
    Experiencia.belongsTo(models.Despachos);
  };
  return Experiencia;
};
