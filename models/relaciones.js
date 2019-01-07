'use strict';

module.exports = function (sequelize, DataTypes) {
    const Relaciones = sequelize.define('Relaciones', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    });
    
    Relaciones.associate = function(models){

    };
    
    return Relaciones;
};