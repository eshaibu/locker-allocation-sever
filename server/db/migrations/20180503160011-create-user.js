'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.STRING
      },
      teamId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id',
          as: 'teamId'
        }
      },
      allocationId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Allocations',
          key: 'id',
          as: 'allocation'
        }
      },
      cellId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cells',
          key: 'id',
          as: 'cell'
        }
      },
      slacktoken: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
