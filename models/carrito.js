'use strict';

module.exports = function (sequelize, DataTypes) {
   const Carrito = sequelize.define('Carrito', {
   });
   Carrito.associate = (models) => {
      Carrito.belongsTo(models.Packs);
   };
   return Carrito;
};
