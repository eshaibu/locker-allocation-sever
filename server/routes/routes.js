import cellController from '../web-api/CellController';
import allocationController from '../web-api/AllocationController';

const routes = (router) => {
  router.get('/', (req, res) => {
    res.json({
      status: 'Welcome to API'
    });
  });

  router.route('/cells')
    .post(cellController.create)
    .get(cellController.retrieve)


  router.route('/cells/:id')
    .patch(cellController.update)
    .delete(cellController.deleteCell)

  router.route('/allocations')
    .post(allocationController.create);

  router.route('/allocations/:id')
    .patch(allocationController.approveOrExpire)
    // .get(allocationController.retrieve)
};

export default routes;