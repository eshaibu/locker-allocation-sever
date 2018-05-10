'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Allocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestBy: {
        allowNull: true,
        type: Sequelize.STRING
      },
      cellId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Cells',
          key: 'id',
          as: 'cellId'
        }
      },
      lockerNumber: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      requestStatus: {
        allowNull: false,
        type: Sequelize.ENUM('request', 'approved', 'rejected')
      },
      expired: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Allocations');
  }
};
