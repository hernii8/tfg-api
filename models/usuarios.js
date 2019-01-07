'use strict';

module.exports = function (sequelize, DataTypes) {
   const Usuarios = sequelize.define('Usuarios', {
      email: {
         type: DataTypes.STRING
      },
      password: {
         type: DataTypes.STRING
      },
      nombre: {
         type: DataTypes.STRING,
         allowNull: true
      },
      apellidos: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      },
      tipo: { //0: Avogado, 1: cliente, 2:admin
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 1
      },
      foto: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      },
      reset_password_token: {
         type: DataTypes.STRING,
         allowNull: true,
         defaultValue: null
      },
      reset_password_expiration: {
         type: DataTypes.DATE,
         allowNull: true,
         defaultValue: null
      },
      stripe_token: {
         type: DataTypes.STRING,
         allowNull: true
      },
      fechaRegistro: {
         type: DataTypes.DATE,
         allowNull: true,
         defaultValue: null
      }
   }, {
         defaultScope: {
            attributes: {
               exclude: ['password', 'reset_password_token', 'reset_password_expiration', 'stripe_token']
            }
         }
      }, {
         indexes: [{
            fields: ['nombre', 'apellidos'],
            type: 'FULLTEXT',
            name: 'UsuariosNombreApellidos'
         }]
      });

   Usuarios.associate = function (models) {
      Usuarios.hasOne(models.DatosFacturaciones);
      Usuarios.belongsToMany(models.Conversaciones, {
         through: 'ConversacionesUsuarios'
      });
      Usuarios.hasOne(models.Profesionales, {
         foreignKey: 'id',
         onDelete: 'CASCADE',
         onUpdate: 'CASCADE'
      });
      Usuarios.hasOne(models.Pagos, {
         as: 'Receptor'
      });
      Usuarios.hasMany(models.Compras);
      Usuarios.hasOne(models.MetaFront);
      Usuarios.belongsToMany(models.Productos, { through: models.Carrito });
   };

   return Usuarios;
};
