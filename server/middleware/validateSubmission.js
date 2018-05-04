const vaildateSubmission = (req, res, next) => {
  const requestObject = JSON.parse(req.body.payload);

  q.body.token = requestObject.token;
  q.body.user_id = requestObject.user.id;
  q.requestObject = requestObject;

  if (requestObject.callback_id != 'locker_selection'){ 
    return res.status(400).send({ text: "Something went wrong, try again" });
  }
  next();
}
