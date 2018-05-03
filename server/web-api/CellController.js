import Validator from 'validatorjs';
import db from '../models/';

const cellModel = db.Cell;

const cellController = {
  async create(req, res) {
    try{
      const { name, numberOfLockers } = req.body;
      const validator = new Validator(req.body, cellModel.createRules());
      if (validator.passes()) {
        const nameExist = await cellModel.findOne({ where: { name } });
        if(!nameExist) {
          const cell = await cellModel.create({ name, numberOfLockers });
          return res.status(201).json({ message: 'Cell creation successful', data: cell });
        }
        return res.status(409).json({ message: 'Name already exist' });
      } else {
        return res.status(400).json({ message: 'validation error(s)', errors: validator.errors.all() });
      }
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  }
};

export default cellController;