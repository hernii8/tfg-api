'use strict';

module.exports = function(sequelize, DataTypes) {
  const Packs = sequelize.define('Packs', {
    tipo: DataTypes.STRING,
    descuento: DataTypes.FLOAT,
    precio: DataTypes.FLOAT
  });

  Packs.associate = (models) => {
    Packs.hasOne(models.ComprasProductos);
  };

  return Packs;
};
