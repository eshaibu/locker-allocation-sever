import slack from '../controllers/slack';
import slackAuth from '../middleware/slackAuth';
import validateSubmission from '../middleware/validateSubmission';

const routes = (router) => {
  router.get('/', (req, res) => {
    res.json({
      status: 'Welcome to API'
    });
  });
  router.get('/slack/authorise/', slack.authorise);
  router.get('/slack/authenticate/', slack.saveToken);
  router.post('/findKey', slackAuth, slack.findKey);
  router.post('/selectKey', validateSubmission, slackAuth, slack.selectKey);
};

export default routes;
