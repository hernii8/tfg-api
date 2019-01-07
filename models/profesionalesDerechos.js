'use strict';

module.exports = function (sequelize, DataTypes) {
  const ProfesionalesDerechos = sequelize.define('ProfesionalesDerechos', {
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    numeroResoluciones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    resolucionesTasaExito: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    tasaExito: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    porcentajeEspecializacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    puntuacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    posicionEstatal: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    posicionProvincial: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    posicionComunitaria: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    kpiCantidad: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiResultados: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiProgresion: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiEspecializacion: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiActualizacion: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiCantidadCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiResultadosCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiProgresionCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiEspecializacionCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    kpiActualizacionCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    ratingCategoria: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false
    },
    posicionEstatalCategoria: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    posicionProvincialCategoria: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    posicionComunitariaCategoria: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  });

  return ProfesionalesDerechos;
};