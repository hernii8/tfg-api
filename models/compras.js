'use strict';

module.exports = function(sequelize, DataTypes) {
  const Compras = sequelize.define('Compras', {
    estado: DataTypes.STRING
  });

  Compras.associate = (models) => {
    Compras.belongsTo(models.Usuarios);
    Compras.belongsTo(models.Pagos);
    Compras.belongsToMany(models.ProductosHistorico, {through: models.ComprasProductos});

  };
  return Compras;
};
