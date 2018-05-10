const validateSubmission = (req, res, next) => {
  const requestObject = JSON.parse(req.body.payload);

  req.body.token = requestObject.token;
  req.body.user_id = requestObject.user.id;
  req.requestObject = requestObject;
  req.body.team_id = requestObject.team.id;

  if (requestObject.callback_id != 'locker_selection'){
    return res.status(400).send({ text: "Something went wrong, try again" });
  }
  next();
}

export default validateSubmission;
