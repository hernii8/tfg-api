'use strict';

module.exports = function (sequelize, DataTypes) {
    const Magistrados = sequelize.define('Magistrados', {
        nombre: DataTypes.STRING,
        idSolr: DataTypes.STRING,
        

    });

    Magistrados.associate = function (models) {
        Magistrados.belongsToMany(models.Resoluciones, {through: models.MagistradosResoluciones});
    };

    return Magistrados;
};
