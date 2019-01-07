'use strict';

module.exports = function (sequelize, DataTypes) {
  const CpsCordenadas = sequelize.define('CpsCordenadas', {
    cp: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    lon: {
      allowNull: false,
      type: DataTypes.FLOAT(10, 6)
    },
    lat: {
      allowNull: false,
      type: DataTypes.FLOAT(10, 6)
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  });

  return CpsCordenadas;
};
