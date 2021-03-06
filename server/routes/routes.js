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
    .get(cellController.list);


  router.route('/cells/:id')
    .get(cellController.retrieve)
    .patch(cellController.update)
    .delete(cellController.deleteCell);

  router.route('/allocations')
    .get(allocationController.list)
    .post(allocationController.create);

  router.route('/allocations/:id')
    .patch(allocationController.approveOrExpire);
};

export default routes;