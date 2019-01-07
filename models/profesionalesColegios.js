'use strict';

module.exports = function(sequelize, DataTypes) {
  const ProfesionalesColegios = sequelize.define('ProfesionalesColegios', {
    n_colegiado: {
      type: DataTypes.INTEGER
    },
    alta_colegiacion: {
      type: DataTypes.DATE
    },
    residente: DataTypes.BOOLEAN
  });

  return ProfesionalesColegios;
};
