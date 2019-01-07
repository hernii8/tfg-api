'use strict';

module.exports = function (sequelize, DataTypes) {
   const Productos = sequelize.define('Productos', {
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT,
      tipo: DataTypes.STRING(30),
      gama: DataTypes.STRING(30),
      alcance: DataTypes.STRING(30),
      precio: DataTypes.INTEGER,
      categoria: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
         defaultValue: false
      }
   });

   Productos.associate = (models) => {
      Productos.belongsTo(models.ProfesionalesEstadisticas);
      Productos.belongsToMany(models.Usuarios, { through: models.Carrito });
      Productos.belongsTo(models.Derechos);
   };

   return Productos;
};
