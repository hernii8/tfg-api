'use strict';

module.exports = function(sequelize, DataTypes) {
  const PartesPerfiles = sequelize.define('PartesPerfiles', {
  });

  PartesPerfiles.associate = function (models) {
  };

  return PartesPerfiles;
};
