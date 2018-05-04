'use strict';
module.exports = (sequelize, DataTypes) => {
  var Team = sequelize.define('Team', {
    bot: DataTypes.STRING,
    slackToken: DataTypes.STRING,
    teamId: DataTypes.STRING
  }, {});
  Team.associate = function(models) {
    // associations can be defined here
    Team.hasMany(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  };
  return Team;
};
