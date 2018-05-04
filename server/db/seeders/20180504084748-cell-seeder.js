'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Cells', [
      {
        name: 'Gold Coast',
        numberOfLockers: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Kampala',
        numberOfLockers: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'The Big Apple',
        numberOfLockers: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Safari',
        numberOfLockers: 55,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Eko',
        numberOfLockers: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'City by the bay',
        numberOfLockers: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('Cells', null, {});
  }
};
