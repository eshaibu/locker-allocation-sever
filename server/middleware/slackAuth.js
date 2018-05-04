import User from '../models/user';
import Team from '../models/team';
import { testSlackToken, sendMessage } from '../helpers/slackHelpers';

const slackAuth = (req, res, next) => {
  if (!req.body.token) return res.send("No token provided");
  else if (req.body.token != process.env.SLACK_TOKEN) return res.send("Invalid token provided");
  else res.status.send();

  let userId = req.body.user_id;
  req.person = {};

  let teamId = req.body.team_id;
  if (teamId) {
    let authMessage = "It seems like *locker* has not been added to your workspace, please got to " + process.env.BASE_URI + 
      "slack/authorise/" + teamId.toLowerCase();
    Team.findOne({ where: { teamId: teamId } })
      .then((team) => {
        if (!team) {
          return sendMessage({ responseUrl: req.body.response_url, message: authMessage });
        }
        if (team.slackToken) {
          testSlackToken(token)
            .then((data) => {
              if (data.ok) {
                next();
              } else {
                return sendMessage({ responseUrl: req.body.response_url, message: authMessage });
              }
            })
            .catch((error) => {
              console.log(error);
              return ;
            });
        } else {
          return sendMessage({responseUrl: req.body.response_url, message: authMessage });
        }
      })
  }
}
