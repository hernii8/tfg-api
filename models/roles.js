'use strict';

module.exports = function (sequelize, DataTypes) {
    const Roles = sequelize.define('Roles', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    });
    
    Roles.associate = function(models){
        Roles.hasMany(models.PartesCasos);
        Roles.belongsToMany(models.Perfiles, {through: 'PerfilesRoles'});

    };
    
    return Roles;
};