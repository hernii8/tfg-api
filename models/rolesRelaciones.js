'use strict';

module.exports = function (sequelize, DataTypes) {
    const RolesRelaciones = sequelize.define('RolesRelaciones', {
    });
    RolesRelaciones.removeAttribute('id');

    RolesRelaciones.associate = function (models) {
        RolesRelaciones.belongsTo(models.Relaciones);
        RolesRelaciones.belongsTo(models.Roles, {
            as: 'Rol1',
            foreignKey: {
                primaryKey: true
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        RolesRelaciones.belongsTo(models.Roles, {
            as: 'Rol2',
            foreignKey: {
                primaryKey: true
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return RolesRelaciones;
};
