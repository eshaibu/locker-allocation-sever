'use strict';
module.exports = (sequelize, DataTypes) => {
  var Cell = sequelize.define('Cell', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numberOfLockers: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Cell.associate = function(models) {
    // associations can be defined here
    Cell.hasMany(models.Allocation, {
      foreignKey: 'cellId',
      as: 'allocations'
    });
  };
  Cell.createRules = () => ({
    name: 'required',
    numberOfLockers: 'required|integer'
  });
  return Cell;
};