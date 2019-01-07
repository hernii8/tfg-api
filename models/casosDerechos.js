'use strict';

module.exports = function (sequelize, DataTypes) {
  const CasosDerechos = sequelize.define('CasosDerechos', {
  });
  CasosDerechos.removeAttribute('id');
  CasosDerechos.associate = function (models) {
    CasosDerechos.belongsTo(models.Casos, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Orden',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Derecho1',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Derecho2',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Derecho3',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Materia1',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Materia2',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    CasosDerechos.belongsTo(models.Derechos, {
      as: 'Materia3',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return CasosDerechos;
};
