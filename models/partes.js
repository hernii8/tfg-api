'use strict';

module.exports = function(sequelize, DataTypes) {

  const Partes = sequelize.define('Partes', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    indexes: [{
      fields: ['nombre'],
      name: 'nombreIndex'
    }]});

  Partes.associate = function(models){
    Partes.hasMany(models.FallosPartes, {
      foreignKey: {
        primaryKey: false,
        allowNull: true
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });  
    Partes.belongsToMany(models.Casos, { through: models.PartesCasos });
    Partes.belongsToMany(models.Perfiles, {through: models.PartesPerfiles});
  };

  return Partes;
};
