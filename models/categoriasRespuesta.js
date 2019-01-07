'use strict';

module.exports = function(sequelize, DataTypes) {
  const CategoriasRespuesta = sequelize.define('CategoriasRespuesta', {
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  });
  CategoriasRespuesta.associate = function(models) {
    CategoriasRespuesta.belongsToMany(models.Profesionales, {
      through: models.RespuestasProfesionales,
      foreignKey: 'CategoriaRespuestaId',
      constraints: false
    });
    CategoriasRespuesta.hasMany(models.RespuestasLegales);
  };

  return CategoriasRespuesta;
};
