
    'use strict';

    module.exports = function(sequelize, DataTypes) {
      const ComprasProductos = sequelize.define('ComprasProductos', {
        precio: DataTypes.INTEGER,
        descuento: DataTypes.INTEGER
      });
    
      ComprasProductos.associate = (models) => {
        ComprasProductos.belongsTo(models.Packs);
      };
      return ComprasProductos;
    };
    
