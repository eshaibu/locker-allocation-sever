'use strict';
module.exports = (sequelize, DataTypes) => {
  var Allocation = sequelize.define('Allocation', {
    requestBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cellId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lockerNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    requestStatus: {
      type: DataTypes.ENUM,
      values: ['request', 'approved', 'rejected'],
      allowNull: false
    },
    expired: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {});
  Allocation.associate = function(models) {
    // associations can be defined here
    Allocation.belongsTo(models.Cell, {
      foreignKey: 'cellId',
      onDelete: 'CASCADE'
    });
  };
  return Allocation;
};