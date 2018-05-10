const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {});
  User.associate = (models) => {
    // associations can be defined here
    User.belongsTo(models.Team, {
      foreignKey: 'teamId',
      onDelete: 'CASCADE'
    });

    User.belongsTo(models.Allocation, {
      foreignKey: 'allocationId',
      onDelete: 'CASCADE'
    });

    User.belongsTo(models.Cell, {
      foreignKey: 'cellId',
      onDelete: 'CASCADE'
    });
  };
  return User;
};

export default userModel;
