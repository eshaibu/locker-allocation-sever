import { WebClient } from '@slack/client';
import buildUrl from 'build-url;
import axios from 'axios';
import uuid from 'uuid';
import async from 'async';
import { testSlackToken } from '../helpers/slackHelpers';

import User from '../models/user';
import Team from '../models/team';
import Cell from '../models/cell';

const authUrl = "https://slack.com/oauth/authorize";
const scope = "commands,bot,im:write,reactions:read,users.profile:read,chat:write:bot,users:read,users:read.email,chat:write:user";

let _self;
module.exports = _self = {
  authorise: function(req, res, next) {
    let teamId = req.params.id.toUpperCase();
    Team.findOne({
      where: {
        teamId: teamId
      }
    }).then((team) => {
      if (!team) {
        let state = uuid.v4();
        Team.create({
          regState: state,
          teamId: teamId
        })
          .then((team) => {
            console.log(team);
          })
          .catch(error => console.log(error))
      } else {
        state = team.regState
      }

      let queryParams = {
        client_id: process.env.SLACK_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.BASE_URI + "slack/authenticate",
        state: state
      };

      let url = buildUrl(authUrl, { queryParams });
      return res.redirect(url);
    })
  },

  saveToken: function(req, res, next) {
    if (!req.query.code) {
      return res.redirect(process.env.BASE_URI + "fail");
    }

    let code = req.query.code;
    let regState = req.query.state;
    let authed = new WebClient();

    authed.oauth.access(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET, code)
      .then(function(data) {
        // TODO: save the access token to the team

        if(regState) {
          Team.findOne({
            where: {
              regState: regState
            }
          }).then(function(team) {
            if (!team) return res.redirect(process.env.BASE_URI + 'fail');

            testSlackToken(data.access_token)
              .then(function(verifiedData) {
                let teamId = verifiedData.team_id;

                async.parallel([
                  function(cb){
                    let userId = verifiedData.user_id;
                    User.findOrCreate({ where: { userId: userId  } , defaults:  { teamId: teamId }})
                      .then(function(user) {
                        cb();
                      })
                      .catch(function(error) {
                        return res.send('Error saving slack token');
                      });
                  },
                  function(cb){
                    Team.update({ bot: data.bot.bot_access_token, slackToken: data.access_token }, { where: { teamId: teamId } })
                      .then(function(team) {
                        cb()
                      })
                      .catch(function(error) {
                        return res.send('Error saving slack token');
                      });
                  }], function(er, result){
                    return p.redirect(process.env.BASE_URI + "calendar/authorise/" + userid);
                  });
              })
              .catch(function(error) {
                console.log("Auth test error", error);
              })
          })
            .catch(function(error) {
              console.log('Error searching for user', error);
            });
        } else {
          return res.redirect(process.env.BASE_URI + 'fail');
        }
      })
      .catch(function(error) {
        console.log('Some Auth error', e);
      })
  },

  findKey: function(req, res) {
    let allocation = req.body.text;
    const authed = new WebClient(req.person.access);

    // Make sure that the provided text is an available space
    Cell.findOne({ where: { name: allocation } })
      .then((cell) => {
        if (!cell) {
          let errorMessage = 'Please enter a valid location, e.g Big Apple'
          return authed.chat.postMessage({ channel: q.body.channel_id, text: errorMessage });
        } 

        User.findOne({ where: {
          userId: req.body.user_id 
        } })
          .then((user) => {
            if (!user) {
              User.create({
                userId: req.body.user_id,
                teamId: req.body.team_id,
                cellId: cell.id,
                slacktoken: req.body.token,
                email: req.body.user_name,
                regstate: uuid.v4()
              }).
                then((user) => {
                  console.log('User created');
                });
            }
            else {
              User.update({ cellId: cell.id }, { where: {
                userId: req.body.user_id
              } }).then(user => {
                console.log('User updated')
              });
            }
          });

        Allocation.findAll({
          where: {
            requestStatus: 'rejected'
          }
        })
          .then((allocations) => {
            let dummyKeys = allocations.map((allocation) => (allocation.lockerNumber))
            let options = dummyKeys.map((keyValue) => ({
              text: `Key ${keyValue}`,
              value: keyValue
            }));

            let messagePayload = {
              channel  : q.body.channel_id,
              text : `Select a locker from ${allocation}`,
              fallback : `Select a locker from ${allocation}`,
              color : "#3AA3E3",
              attachment_type : "default",
              callback_id : "locker_selection",
              actions : [
                "name": 'empty_lockers',
                "text": `Pick a locker on ${allocation}`,
                "type": "select",
                options
              ] 
            };

            authed.chat.postMessage(messagePayload)
              .then(function(result) {
                console.log('message sent', result);
              })
              .catch(function(error) {
                console.log('error sending message', error);
              })
          })
      })
  },

  selectKey: function(req, res) {
    let actions = req.requestObject.actions;
    let action = actions.find((action) => {
      return action.name == "empty_lockers"
    });

    let selectedOptions = action.selected_options;
    let selection = selectedOptions[0].value;

    // UPDATE LIST OF EMPTY KEYS FOR SAID FLOOR
    // SAVE KEY TO THE APPROPRIATE USER
    User.findOne({ where: {
      userId: req.body.user_id
    } }).then((user) => {
      if (!user) return ;
      let cell = user.cell;
      Cell.getAllocations({ where: {
        lockerNumber: selection
      } }).then((allocation) => {
        let allocation = allocation[0];
        Allocation.update({
          requestStatus: 'request'          
        }, { where: { id: allocation.id } })
          .then((allocation) => {
            User.update({ allocationId: allocation.id },
              { where: { userId: req.body.user_id } })
              .then((user) => {
                // sendMessage()
              })
          });
      });
    });
  }
}
