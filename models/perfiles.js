'use strict';

module.exports = function (sequelize, DataTypes) {
    const Perfiles = sequelize.define('Perfiles', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        nivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        indexes: [{
          fields: ['nombre'],
          name: 'nombreIndex'
        }]});
    
    Perfiles.associate = function(models){
        Perfiles.belongsToMany(models.Derechos, { through: models.DerechosPerfiles});
        Perfiles.belongsToMany(models.Partes, {through: models.PartesPerfiles});
        Perfiles.belongsToMany(models.Roles, {through: 'PerfilesRoles'});

    };
    
    return Perfiles;
};