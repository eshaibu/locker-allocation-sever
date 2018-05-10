
import { WebClient } from '@slack/client';
import buildUrl from 'build-url';
import axios from 'axios';
import uuid from 'uuid';
import async from 'async';
import Sequelize from 'sequelize';
import { testSlackToken, sendMessage } from '../helpers/slackHelpers';
import db from '../models/';

const Team = db.Team;
const User = db.User;
const Cell = db.Cell;

const Op = Sequelize.Op;

const allocationModel = db.Allocation;

const authUrl = 'https://slack.com/oauth/authorize';
const scope = 'commands,bot,im:write,reactions:read,users.profile:read,chat:write:bot,users:read,users:read.email,chat:write:user';

const slack = {
  authorise(req, res, next) {
    const teamId = req.params.id.toUpperCase();
    let state;
    Team.findOne({
      where: {
        teamId
      }
    }).then((team) => {
      if (!team) {
        state = uuid.v4();
        Team.create({
          regState: state,
          teamId
        })
          .then((team) => {
          })
          .catch(error => console.log(error));
        } else {
          state = team.regState;
        }
      
      const queryParams = {
              client_id: process.env.SLACK_CLIENT_ID,
              scope,
              redirect_uri: `${process.env.BASE_URI}slack/authenticate`,
              state
            };

            const url = buildUrl(authUrl, { queryParams });
            return res.redirect(url);
    })
    .catch((error) => (console.log(error)))
  },

  saveToken(req, res, next) {
    if (!req.query.code) {
      return res.status(401).send({ message: 'code not provided, contact developer' })
    }
    
    if (!req.query.state) {
      return res.status(401).send({ message: 'state not provided, contact developer' })
    }

    const code = req.query.code;
    const regState = req.query.state;
    const authed = new WebClient();

    authed.oauth.access({ client_id: process.env.SLACK_CLIENT_ID,
                          client_secret: process.env.SLACK_CLIENT_SECRET,
                          code})
      .then((data) => {
        // TODO: save the access token to the team

        if (regState) {
          Team.findOne({
            where: {
              regState
            }
          }).then((team) => {
            if (!team) return res.redirect(`${process.env.BASE_URI}fail`);

            testSlackToken(data.access_token)
              .then((verifiedData) => {
                const teamId = verifiedData.team_id;

                async.parallel([
                  function (cb) {
                    const userId = verifiedData.user_id;
                    User.findOrCreate({ where: { userId }, defaults: { teamId } })
                      .then((user) => {
                        cb();
                      })
                      .catch((error) => {
                        return res.send('Error saving slack token', error);
                      });
                    
                    User
                  },
                  function (cb) {
                    Team.update({ bot: data.bot.bot_access_token, slackToken: data.access_token }, { where: { teamId } })
                      .then((team) => {
                        cb();
                      })
                      .catch((error) => {
                        return res.send('Error saving slack token');
                      });
                  }], (er, result) => {
                  return res.send({ message: 'ok' });
                });
              })
              .catch((error) => {
                console.log('Auth test error', error);
              });
          })
            .catch((error) => {
              console.log('Error searching for user', error);
            });
        } else {
          return res.redirect(`${process.env.BASE_URI}fail`);
        }
      })
      .catch((error) => {
        console.log('Some Auth error', error);
      });
  },

  findKey: async (req, res) => {
    try {
      const cellText = req.body.text;
      const authed = new WebClient(req.team.token);

      const cells = await Cell.findAll();
      const cellNames = cells.map(cell => cell.name);
      const cellNamesString = cellNames.join(', ');

      const cell = cells.find(cell => cell.name === cellText);

      if (!cell) {
        let errorMessage;
        if (cellNamesString.length === 0) {
          errorMessage = 'There are no locations for your workspace. Please contact Facilities';
        } else {
          errorMessage = `Please enter a valid location, one of the item in list [${cellNamesString}]`;
        }
        return sendMessage({ responseUrl: req.body.response_url,
                             message: errorMessage });  
      }

      const user = await User.findOne({
        where: {
          userId: req.body.user_id
        }
      });
      if (!user) {
        await User.create({
          userId: req.body.user_id,
          teamId: req.body.team_id,
          cellId: cell.id,
          slacktoken: req.team.token,
          email: req.body.user_name,
          regstate: uuid.v4()
        });
      } else {
        await User.update({ cellId: cell.id, slacktoken: req.team.token, email: req.body.user_name }, { where: {
          userId: req.body.user_id
        } });
        if (user.allocationId) {
          const allocation = await allocationModel.findOne({
            where: { id: user.allocationId }
          });
          const requestedCell = await allocation.getCell();
          const messagePrompt = `Your request for *key ${allocation.lockerNumber}* on ${requestedCell.name} is at the *${allocation.requestStatus} phase*. Please contact Facilities.`
          const message = {
            channel: req.body.user_id,
            text: messagePrompt
          };
          const result = await authed.chat.postMessage(message);
          return result;
        }
      }

      const lockerNoArray = Array.from({ length: cell.numberOfLockers }, (v, k) => k + 1);
      const lockerOccupiedInCell = await allocationModel.findAll({
       where: {
          cellId: cell.id,
          requestStatus: {
            [Op.ne]: 'rejected'
          },
          expired: null,
        }
      });
      
       
      const unavailableLockers = lockerOccupiedInCell.map(allocation => allocation.lockerNumber);
      const availableLockers = lockerNoArray.filter(lockerNumber => !unavailableLockers.includes(lockerNumber));

      
      let messagePayload;

     if (availableLockers.length > 0) {
      const options = availableLockers.map(keyValue => ({
        text: `Key ${keyValue}`,
        value: keyValue
      }));

      messagePayload = {
        channel: req.body.user_id,
        text: 'Select a locker with locker',
        attachments: [{
          text: `Select a locker from ${cell.name}`,
          fallback: `Select a locker from ${cell.name}`,
          color: '#3AA3E3',
          attachment_type: 'default',
          callback_id: 'locker_selection',
          actions: [{
            name: 'empty_lockers',
            text: `Pick a key`,
            type: 'select',
            options
          }]
        }]
      };
     } else {
       messagePayload = {
         channel: req.body.user_id,
         text: `There are no empty lockers on ${cell.name}. Please contact Facilites`
       };
     }
      
      
      const result = await authed.chat.postMessage(messagePayload);
      console.log('message sent', result);
    } catch (errors) {
      console.log(errors, 'the error message');
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  selectKey: async (req, res) => {
    console.log('are we handling selections?');
    const actions = req.requestObject.actions;
    const action = actions.find((action) => {
      return action.name == 'empty_lockers';
    });
  
    const selectedOptions = action.selected_options;
    const selection = selectedOptions[0].value;
    
    const user = await User.findOne({
      where: {
        userId: req.body.user_id
      }
    });
    
    if (!user) return ;
    
    if(user.allocationId) {
      return sendMessage({ responseUrl: req.requestObject.response_url, 
                    message: 'You have already requested for a key'});
    };
   
    const cellId = user.cellId;
    const cell =  await Cell.findOne({
      where: { id: cellId}
    });
    
    if (!cell) return;
    
    const allocation = await cell.getAllocations({
      where: {
        lockerNumber: selection
      }
    });
    
    if (allocation.length === 0) {
      await allocationModel.create({
        cellId,
        requestStatus: 'request',
        requestBy: req.requestObject.user.name,
        lockerNumber: selection
      });
    } else {
      const updatedAllocation = await allocationModel.update({
        requestStatus: 'request',
        requestBy: req.requestObject.user.name
      }, {
        where: { lockerNumber: selection }
      });
    }
    
     const userAllocated = await User.update({
        allocationId: allocation[0].dataValues.id
      }, {
        where: { userId: req.body.user_id }
      });
    
    
    
    sendMessage({ responseUrl: req.requestObject.response_url, 
                 message: 'We are processing your request, contact Facilities for your approved key'});
  }
};

export default slack;
