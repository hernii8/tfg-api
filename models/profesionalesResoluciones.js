'use strict';

module.exports = function(sequelize, DataTypes) {

  const ProfesionalesResoluciones = sequelize.define('ProfesionalesResoluciones', {
    profesionalAnotador: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  ProfesionalesResoluciones.associate = function(models){
    ProfesionalesResoluciones.belongsTo(models.ProfesionalesEstadisticas,
    {
      as: 'Sustituto'
    });
  }

  return ProfesionalesResoluciones;
};
