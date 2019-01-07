'use strict';

module.exports = function (sequelize, DataTypes) {
  const Medias = sequelize.define('Medias', {
    tasaExitoMedia: DataTypes.FLOAT,
    numeroResolucionesMedias: DataTypes.FLOAT,
    numeroResolucionesTotales: DataTypes.INTEGER,
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: 'compositeIndex',
        defaultValue: null
    },
    antiguedadUp: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: 'compositeIndex',
        defaultValue: null
    },
    antiguedadLow: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: 'compositeIndex',
        defaultValue: null
    },
    comunidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: 'compositeIndex',
      defaultValue: null
  },
  });
  Medias.associate = function (models) {
    Medias.belongsTo(models.Derechos, {
      foreignKey: {
        unique: 'compositeIndex',
        allowNull: true
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    Medias.belongsTo(models.Perfiles, {
      foreignKey: {
        unique: 'compositeIndex',
        allowNull: true
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    Medias.belongsTo(models.PosicionesProcesales, {
      foreignKey: {
        unique: 'compositeIndex',
        allowNull: true
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

  };

  return Medias;
};
