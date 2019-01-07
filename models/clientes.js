'use strict';

module.exports = function(sequelize, DataTypes) {
  const Clientes = sequelize.define('Clientes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    facebook_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    facebook_token: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    google_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    google_token: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
  });
  Clientes.associate = function(models) {
    Clientes.belongsTo(models.Usuarios, {
      foreignKey: 'id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Clientes;
};
