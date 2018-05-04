import { WebClient } from '@slack/client';
import buildUrl from 'build-url';
import axios from 'axios';
import uuid from 'uuid';
import async from 'async';
import Sequelize from 'sequelize';
import { testSlackToken } from '../helpers/slackHelpers';
import db from '../models/';

import User from '../models/user';
import Team from '../models/team';
import Cell from '../models/cell';

const Op = Sequelize.Op;

const cellModel = db.Cell;
const userModel = db.User;
const allocationModel = db.Allocation;

const authUrl = 'https://slack.com/oauth/authorize';
const scope = 'commands,bot,im:write,reactions:read,users.profile:read,chat:write:bot,users:read,users:read.email,chat:write:user';

const slack = {
  authorise(req, res, next) {
    const teamId = req.params.id.toUpperCase();
    Team.findOne({
      where: {
        teamId
      }
    }).then((team) => {
      if (!team) {
        const state = uuid.v4();
        Team.create({
          regState: state,
          teamId
        })
          .then((team) => {
            console.log(team);
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
    });
  },

  saveToken(req, res, next) {
    if (!req.query.code) {
      return res.redirect(`${process.env.BASE_URI}fail`);
    }

    const code = req.query.code;
    const regState = req.query.state;
    const authed = new WebClient();

    authed.oauth.access(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET, code)
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
                        return res.send('Error saving slack token');
                      });
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
                  return p.redirect(`${process.env.BASE_URI}calendar/authorise/${userid}`);
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
        console.log('Some Auth error', e);
      });
  },

  findKey: async (req, res) => {
    try {
      const cellText = (req.body.text).toLowerCase();
      const authed = new WebClient(req.body.token);

      const cells = await cellModel.findAll();
      const cellNames = cells.map(cell => cell.name);
      const cellNamesString = cellNames.join(', ');

      const cell = cells.find(cell => cell.name === cellText);

      const checkModel = cellNames.includes(cellText);

      if (!checkModel) {
        const errorMessage = `Please enter a valid location, one of the item in list [${cellNamesString}]`;
        return authed.chat.postMessage({ channel: q.body.channel_id, text: errorMessage });
      }

      const user = await userModel.findOne({
        where: {
          userId: req.body.user_id
        }
      });
      if (!user) {
        await userModel.create({
          userId: req.body.user_id,
          teamId: req.body.team_id,
          cellId: cell.id,
          slacktoken: req.body.token,
          email: req.body.user_name,
          regstate: uuid.v4()
        });
      } else {
        await userModel.update({ cellId: cell.id }, { where: {
          userId: req.body.user_id
        } });
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


      const options = availableLockers.map(keyValue => ({
        text: `Key ${keyValue}`,
        value: keyValue
      }));

      const messagePayload = {
        channel: req.body.channel_id,
        text: `Select a locker from ${cell.name}`,
        fallback: `Select a locker from ${cell.name}`,
        color: '#3AA3E3',
        attachment_type: 'default',
        callback_id: 'locker_selection',
        actions: [{
          name: 'empty_lockers',
          text: `Pick a locker on ${cell.name}`,
          type: 'select',
          options
        }]
      };

      const result = await authed.chat.postMessage(messagePayload);
      console.log('message sent', result);
    } catch (errors) {
      console.log('error sending message', error);
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  // selectKey(req, res) {
  //   const actions = req.requestObject.actions;
  //   const action = actions.find((action) => {
  //     return action.name == 'empty_lockers';
  //   });
  //
  //   const selectedOptions = action.selected_options;
  //   const selection = selectedOptions[0].value;
  //
  //   // UPDATE LIST OF EMPTY KEYS FOR SAID FLOOR
  //   // SAVE KEY TO THE APPROPRIATE USER
  //   User.findOne({ where: {
  //     userId: req.body.user_id
  //   } }).then((user) => {
  //     if (!user) return;
  //     const cell = user.cell;
  //     Cell.getAllocations({ where: {
  //       lockerNumber: selection
  //     } }).then((allocation) => {
  //       const allocation = allocation[0];
  //       Allocation.update({
  //         requestStatus: 'request'
  //       }, { where: { id: allocation.id } })
  //         .then((allocation) => {
  //           User.update({ allocationId: allocation.id },
  //             { where: { userId: req.body.user_id } })
  //             .then((user) => {
  //               // sendMessage()
  //             });
  //         });
  //     });
  //   });
  // }
};

export default slack;
