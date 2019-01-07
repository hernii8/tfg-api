'use strict';

module.exports = function (sequelize, DataTypes) {
  const FallosPartes = sequelize.define('FallosPartes', {
    resultadoAnotador: DataTypes.STRING,
    rolAnotador: DataTypes.STRING
  });
  FallosPartes.removeAttribute('id');
  FallosPartes.associate = function (models) {
    FallosPartes.belongsTo(models.PosicionesProcesales);
    FallosPartes.belongsTo(models.Resultados);
    FallosPartes.belongsTo(models.ProfesionalesEstadisticas, {
      foreignKey: {
        primaryKey: false,
        unique: 'fallosPartesIndex',
        allowNull: false
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    FallosPartes.belongsTo(models.Fallos, {
      foreignKey: {
        primaryKey: false,
        unique: 'fallosPartesIndex',
        allowNull: false
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    FallosPartes.belongsTo(models.Partes, {
      foreignKey: {
        primaryKey: false,
        unique: 'fallosPartesIndex',
        allowNull: true
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

  };

  return FallosPartes;
};
