'use strict';

module.exports = function(sequelize, DataTypes) {
  const DerechosPerfiles = sequelize.define('DerechosPerfiles', {
    obligatorio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
  });

  DerechosPerfiles.associate = function (models) {
  };

  return DerechosPerfiles;
};
