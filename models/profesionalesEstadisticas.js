'use strict';

module.exports = function (sequelize, DataTypes) {
   const ProfesionalesEstadisticas = sequelize.define('ProfesionalesEstadisticas', {
      is_registered: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: 0
      },
      anonymous_id: {
         type: DataTypes.STRING(15),
         unique: true,
         allowNull: false
      },
      nombre: {
         type: DataTypes.STRING
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
      },
      resolucionesTasaExito: {
         type: DataTypes.INTEGER,
         defaultValue: 0,
         allowNull: false
      },
      puntuacion: {
         type: DataTypes.FLOAT,
         allowNull: false,
         defaultValue: 0
      },
      idSolr: {
         type: DataTypes.STRING
      },
      alta_colegiacion: {
         type: DataTypes.DATE,
         allowNull: true
      },
      fecha_actualizacion: {
         type: DataTypes.DATE,
         allowNull: true
      },
      tipo: { //abogado 0, procurador 1...
         type: DataTypes.INTEGER
      },
      provincia: {
         type: DataTypes.STRING
      },
      comunidad: {
         type: DataTypes.STRING
      }
   }, {
         indexes: [{
            fields: ['idSolr'],
            name: 'idSolrIndex'
         }, {
            fields: ['nombre'],
            type: 'FULLTEXT',
            name: 'nombreFullText'
         }, {
            fields: ['anonymous_id'],
            name: "idAnonymousIndex"
         }]
      });

   ProfesionalesEstadisticas.associate = function (models) {
      ProfesionalesEstadisticas.belongsToMany(models.Derechos, {
         through: models.ProfesionalesDerechos
      });
      ProfesionalesEstadisticas.belongsToMany(models.Resoluciones, {
         through: models.ProfesionalesResoluciones
      });
      ProfesionalesEstadisticas.hasMany(models.FallosPartes, {
         foreignKey: {
            primaryKey: false,
            allowNull: false
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      });
      ProfesionalesEstadisticas.belongsTo(models.Profesionales);
   };

   return ProfesionalesEstadisticas;
};
