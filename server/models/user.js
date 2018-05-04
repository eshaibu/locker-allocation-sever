'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    userId: DataTypes.STRING,
    teamId: DataTypes.STRING,
    cellId: DataTypes.INTEGER,
    allocationId: DataTypes.INTEGER
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(model.Team, {
      foreignKey: 'teamId',
      onDelete: 'CASCADE'
    })

    User.hasOne(model.Allocation, {
      foreignKey: 'allocationId',
      onDelete: 'CASCADE'
    })

    User.belongsTo(model.Cell, {
      foreignKey: 'cellId',
      onDelete: 'CASCADE'
    })
  };
  return User;
};
