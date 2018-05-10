const cellModel = (sequelize, DataTypes) => {
  const Cell = sequelize.define('Cell', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numberOfLockers: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    paranoid: true,
  });
  Cell.associate = (models) => {
    // associations can be defined here
    Cell.hasMany(models.Allocation, {
      foreignKey: 'cellId',
      as: 'allocations'
    });   
    Cell.hasMany(models.User, {
      foreignKey: 'cellId',
      as: 'users'
    });
  };
  Cell.createRules = () => ({
    name: 'required',
    numberOfLockers: 'required|integer'
  });
  return Cell;
};

export default cellModel;
