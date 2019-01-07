'use strict';

module.exports = function (sequelize, DataTypes) {
    const DerechosRamas = sequelize.define('DerechosRamas', {
        depth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });
    DerechosRamas.removeAttribute('id');
    return DerechosRamas;
    
};
