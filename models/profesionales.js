'use strict';

module.exports = function (sequelize, DataTypes) {
   const Profesionales = sequelize.define('Profesionales', {
      id: {
         type: DataTypes.INTEGER,
         primaryKey: true
      },
      is_signup_aprobed: {
         type: DataTypes.BOOLEAN,
         allowNull: true,
         defaultValue: false
      },
      ejerciente: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      telefono: DataTypes.STRING,
      registration_cod: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      },
      presentation_text: {
         type: DataTypes.TEXT,
         allowNull: true,
         defaultValue: null
      },
      tipo: { //abogado expertia: 0, abogado top: 1, abogado emerita: 2, abogado anónimo: 3, abogado oculto (menos de 10 sent ou dados de baixa): 4
         type: DataTypes.INTEGER
      },
      domicilio: {
         type: DataTypes.STRING
      },
      localidad: {
         type: DataTypes.STRING
      },
      cp: {
         type: DataTypes.INTEGER
      },
      cplat: {
         type: DataTypes.FLOAT(10, 6)
      },
      cplon: {
         type: DataTypes.FLOAT(10, 6)
      },
      consultas: {
         type: DataTypes.BOOLEAN
      },
      //publico: 0, privado: 1
      visualizacion_perfil: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 2,
      },
      //publico: 0, privado 1, oculto: 2
      visualizacion_rating: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 2
      }
   }, {
         defaultScope: {
            attributes: {
               exclude: ['registration_cod']
            }
         }
      }, {
         indexes: [{
            fields: ['idSolr'],
            name: 'idSolrIndex'
         }]
      });

   Profesionales.associate = function (models) {

      Profesionales.belongsTo(models.Usuarios, {
         foreignKey: 'id',
         onDelete: 'CASCADE',
         onUpdate: 'CASCADE'
      });
      Profesionales.hasMany(models.Valoraciones);
      Profesionales.hasMany(models.Experiencia);
      Profesionales.hasMany(models.Educacion);
      Profesionales.belongsToMany(models.Despachos, {
         through: models.ProfesionalesDespachos
      });
      Profesionales.belongsToMany(models.Colegios, {
         through: models.ProfesionalesColegios
      });
      Profesionales.belongsToMany(models.CategoriasRespuesta, {
         through: models.RespuestasProfesionales,
         constraints: false
      });
      Profesionales.hasOne(models.ProfesionalesEstadisticas);
   };

   return Profesionales;
};
