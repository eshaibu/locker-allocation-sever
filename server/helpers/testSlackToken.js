import { WebClient } from "@slack/client";
import axios from "axios";

export const testSlackToken = (token) => {
  return new WebClient(token).auth.test();
}

export const sendMessage = ({ responseUrl, text, response_type }) => {
  axios.post(responseUrl, { response_type,  text })
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.log(error);
    })
}


export const privateMessage = (token, userId, message, payload) {
  let authClient = new WebClient(token);
  return authClient.im.open(userId)
    .then((data) => {
      return authClient.chat.postMessage(data.channel.id, message);
    })
    .then(result => (console.log("Private message sent!");))
    .catch(error => (console.log(error);))
}
