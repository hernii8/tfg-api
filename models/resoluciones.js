'use strict';

module.exports = function (sequelize, DataTypes) {
  const Resoluciones = sequelize.define('Resoluciones', {
    ecli: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numeroResolucion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipoResolucion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rutaArchivo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numeroFallos: DataTypes.INTEGER,
    ecliAnotador: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numeroResolucionAnotador: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fechaAnotador: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tipoResolucionAnotador: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idSolr: {
      type: DataTypes.INTEGER
    }
  }, {
    indexes: [{
      fields: ['idSolr'],
      name: 'idSolrIndex'
    }]});

  Resoluciones.associate = function (models) {
    Resoluciones.belongsToMany(models.ProfesionalesEstadisticas, {
      through: models.ProfesionalesResoluciones,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Resoluciones.hasMany(models.Fallos, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    Resoluciones.belongsTo(models.Procesos);
    Resoluciones.belongsToMany(models.Derechos, {through: "ResolucionesDerechos"});
    Resoluciones.belongsToMany(models.Magistrados, {through: models.MagistradosResoluciones});
  };

  return Resoluciones;
};
