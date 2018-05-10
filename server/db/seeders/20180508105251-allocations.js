'use strict'



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
    const allocations = [];
    for (let index=0; index < 40; index++) {
      allocations.push({
        cellId: 3,
        lockerNumber: index,
        requestStatus: 'rejected'
      })
    }
    return queryInterface.bulkInsert('Allocations', allocations, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('Allocations', null, {});
  }
};
