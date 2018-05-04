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
        name: 'Gold Coast (1st floor left wing)',
        numberOfLockers: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Kampala (3rd floor right wing)',
        numberOfLockers: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'The Big Apple (4th floor left wing)',
        numberOfLockers: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Safari (4th floor right wing)',
        numberOfLockers: 55,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Eko (5th floor left wing)',
        numberOfLockers: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'City by the bay (5th floor right wing)',
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
    return queryInterface.bulkDelete('Cell', null, {});
  }
};
