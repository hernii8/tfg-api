'use strict';

module.exports = function(sequelize, DataTypes) {
  const PartesCasos = sequelize.define('PartesCasos', {
  });

  PartesCasos.associate = function (models) {
    PartesCasos.belongsTo(models.Roles);
  };

  return PartesCasos;
};
