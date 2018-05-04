import { WebClient } from "@slack/client";
import axios from 'axios';

export const testSlackToken = (token) => {
  return new WebClient(token).auth.test();
}

export const sendMessage = ({ responseUrl, message: text, response_type }) => {
  axios.post(responseUrl, { text, response_type })
    .then(response => console.log(response))
    .catch(error => console.log(error));
}

export const sendPrivateMessage = (token, userId, message, payload) {
  let authObject = new WebClient(token);

  return authObject.im.open(userId)
    .then((data) => (authObject.chat.postMessage(data.channel.id, message)))
    .then(response => console.log(response))
    .catch(error => console.log(error));
}
