import User from '../models/user';
import { testSlackToken, sendMessage } from '../helpers/slackHelpers';
import db from '../models/';

const Team = db.Team;

const slackAuth = (req, res, next) => {
  console.log('we are handling authentication');
  if (!req.body.token) return res.send('No token provided');
  else if (req.body.token !== process.env.SLACK_TOKEN) return res.send('Invalid token provided');
  res.status(200).send();

  const userId = req.body.user_id;
  req.team = {};

  const teamId = req.body.team_id;
  if (teamId) {
    console.log('we found the team id');
    const authMessage = `It seems like *locker* has not been added to your workspace, please got to ${process.env.BASE_URI
    }slack/authorise/${teamId.toLowerCase()}`;

    Team.findOne({ where: { teamId } })
      .then((team) => {
        if (!team) {
          console.log('we did not find the team');
          return sendMessage({ responseUrl: req.body.response_url, message: authMessage });
        }
        console.log('we found the team');
        if (team.slackToken) {
          console.log('we found team slack token');
          testSlackToken(team.slackToken)
            .then((data) => {
              if (data.ok) {
                console.log('the token test passed');
                req.team = { token: team.slackToken };
                next();
              } else {
                console.log('thet token test failed');
                return sendMessage({ responseUrl: req.body.response_url, message: authMessage });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log('there was team id');
          return sendMessage({ responseUrl: req.body.response_url, message: authMessage });
        }
      });
  }
};
export default slackAuth;
