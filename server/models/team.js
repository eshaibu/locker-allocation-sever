const teamModel = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    bot: DataTypes.STRING,
    slackToken: DataTypes.STRING,
    teamId: DataTypes.STRING,
    regState: DataTypes.STRING,
  }, {});
  Team.associate = (models) => {
    // associations can be defined here
    Team.hasMany(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };
  return Team;
};

export default teamModel;
