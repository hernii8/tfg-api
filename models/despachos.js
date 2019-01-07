'use strict';

module.exports = function(sequelize, DataTypes) {
  const Despachos = sequelize.define('Despachos', {
    marca: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nif: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    domicilio: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    localidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    web: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false
    },
    presentation_text: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    antiguedad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    tasaExito: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    numeroResoluciones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },{
   indexes: [{
     fields: ['nombre'],
     type: 'FULLTEXT',
     name: 'DespachosNombre'
   }]
 });

  Despachos.associate = function(models) {
    Despachos.belongsToMany(models.Profesionales, { through: models.ProfesionalesDespachos });
    Despachos.hasMany(models.Experiencia, {onDelete: 'CASCADE'});
  };

  return Despachos;
};
