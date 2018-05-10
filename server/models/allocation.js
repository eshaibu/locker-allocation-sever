const allocationModel = (sequelize, DataTypes) => {
  const Allocation = sequelize.define('Allocation', {
    requestBy: {
      type: DataTypes.STRING,
      allowNull: true
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
  });
  Allocation.associate = (models) => {
    // associations can be defined here
    Allocation.belongsTo(models.Cell, {
      foreignKey: 'cellId',
      onDelete: 'CASCADE'
    });
    
    Allocation.hasOne(models.User, {
      foreignKey: 'allocationId',
      onDelete: 'CASCADE'
    });
  };

  Allocation.createRules = () => ({
    cellId: 'required',
    requestBy: 'required|email',
    lockerNumber: 'required|integer',
    requestStatus: 'required|in:request,approved,rejected',
  });

  return Allocation;
};

export default allocationModel;
