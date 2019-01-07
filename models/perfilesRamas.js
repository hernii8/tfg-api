'use strict';

module.exports = function (sequelize, DataTypes) {
    const PerfilesRamas = sequelize.define('PerfilesRamas', {
        depth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });
    PerfilesRamas.removeAttribute('id');
    PerfilesRamas.associate = function (models) {

        PerfilesRamas.belongsTo(models.Perfiles, {
            as: 'Padre',
            foreignKey: {
                primaryKey: true
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        PerfilesRamas.belongsTo(models.Perfiles, {
            as: 'Nodo',
            foreignKey: {
                primaryKey: true
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return PerfilesRamas;
};
