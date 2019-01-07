'use strict';

module.exports = function(sequelize, DataTypes) {

  const ProfesionalesDespachos = sequelize.define('ProfesionalesDespachos', {
    is_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  return ProfesionalesDespachos;
};
