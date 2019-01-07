'use strict';

module.exports = function (sequelize, DataTypes) {
  const OrganosJudiciales = sequelize.define('OrganosJudiciales', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    localizacion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    comunidad: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null
    }, 
    lon: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null
    }
  }, {
      indexes: [{
        fields: ['nombre'],
        name: 'nombreIndex'
      }]
    });

  OrganosJudiciales.associate = function (models) {
  };

  return OrganosJudiciales;
};
