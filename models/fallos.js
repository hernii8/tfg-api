'use strict';

module.exports = function (sequelize, DataTypes) {
  const Fallos = sequelize.define('Fallos', {
    falloAnotador: DataTypes.STRING
  });

  Fallos.associate = function (models) {
    Fallos.hasMany(models.FallosPartes, {
      foreignKey: {
        primaryKey: false,
        allowNull: false
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    Fallos.belongsTo(models.TipoFallos);
  };

  return Fallos;
};
