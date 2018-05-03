import Validator from 'validatorjs';
import db from '../models/';

const allocationModel = db.Allocation;

const allocationController = {
  async create(req, res) {
    try{

    } catch (errors) {
      return res.status(400).json(
        { message: 'Some server problems, please try again', errors });
    }
  }
};

export default allocationController;