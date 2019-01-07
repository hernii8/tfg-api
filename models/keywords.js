'use strict';

module.exports = function (sequelize, DataTypes) {
    const Keywords = sequelize.define('Keywords', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    });
    
    Keywords.associate = function(models){
        Keywords.belongsToMany(models.Derechos, { through: 'DerechosKeywords'});
    };
    
    return Keywords;
};