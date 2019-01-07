'use strict';
module.exports = function(sequelize, DataTypes) {
  var DatosFacturaciones = sequelize.define('DatosFacturaciones', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nif: {
      type: DataTypes.STRING,
      allowNull: true
    },
    domicilio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tieneIRPF: DataTypes.BOOLEAN,
    contadorSerieFactura: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    contadorSerieFacturaSimplificada: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  });
  DatosFacturaciones.associate = function(models) {
    DatosFacturaciones.belongsTo(models.Usuarios);
  };
  return DatosFacturaciones;
};
