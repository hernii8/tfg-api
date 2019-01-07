'use strict';

module.exports = function (sequelize, DataTypes) {
   const ProductosHistorico = sequelize.define('ProductosHistorico', {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT,
      tipo: DataTypes.STRING,
      precio: DataTypes.INTEGER,
      gama: DataTypes.STRING,
      alcance: DataTypes.STRING,
      categoria: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false
      }
   });

   ProductosHistorico.associate = (models) => {
      ProductosHistorico.belongsTo(models.ProfesionalesEstadisticas);
      ProductosHistorico.belongsToMany(models.Compras, { through: models.ComprasProductos });
      ProductosHistorico.belongsTo(models.Derechos);
   };

   return ProductosHistorico;
};
