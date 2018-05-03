import cellController from '../web-api/CellController';
import allocationController from '../web-api/AllocationController';

const routes = (router) => {
  router.get('/', (req, res) => {
    res.json({
      status: 'Welcome to API'
    });
  });

  router.route('/cell')
    .post(cellController.create);
};

export default routes;