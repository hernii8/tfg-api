'use strict';

module.exports = function (sequelize, DataTypes) {

   const Derechos = sequelize.define('Derechos', {
      nombre: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      },
      nivel: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0
      },
      mostrar: {
         type: DataTypes.BOOLEAN,
         allowNull: true,
         defaultValue: 0
      },
      descripcion: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      }
   }, {
         indexes: [{
            fields: ['nombre'],
            name: 'nombreIndex'
         }]
      });

   Derechos.associate = function (models) {
      Derechos.belongsToMany(models.Perfiles, { through: models.DerechosPerfiles });
      Derechos.belongsToMany(models.ProfesionalesEstadisticas, {
         through: models.ProfesionalesDerechos
      });
      Derechos.belongsToMany(models.Keywords, { through: 'DerechosKeywords' });
      Derechos.belongsToMany(models.Resoluciones, { through: "ResolucionesDerechos" });
      Derechos.belongsToMany(models.Derechos, { through: models.DerechosRamas, as: 'Nodo', foreignKey: 'PadreId' });
      Derechos.belongsToMany(models.Derechos, { through: models.DerechosRamas, as: 'Padre', foreignKey: 'NodoId' });
      Derechos.hasMany(models.Medias, {
         foreignKey: {
            primaryKey: true,
            allowNull: false
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
      });
      Derechos.hasMany(models.Productos);
      Derechos.hasMany(models.ProductosHistorico);
   };

   return Derechos;
};
