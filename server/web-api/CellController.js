import Validator from 'validatorjs';
import db from '../models/';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;
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
      }
      return res.status(400).json({ message: 'validation error(s)', errors: validator.errors.all() });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async retrieve(req, res) {
    try{
        const cells = await cellModel.findAndCountAll();
      return res.status(200).json({ message: 'List of cells', data: cells });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async update(req, res) {
    try{
      const { name, numberOfLockers } = req.body;
      const cellExist = await cellModel.findById(req.params.id);
      if(cellExist) {
        const validator = new Validator(req.body, cellModel.createRules());
        if (validator.passes()) {
          const nameExist = await cellModel.findOne({ where: { name, id: { [Op.ne]: req.params.id } } });
          if(!nameExist) {
            const cell = await cellExist.update({ name, numberOfLockers });
            return res.status(201).json({ message: 'Cell updated successfully', data: cell });
          }
          return res.status(409).json({ message: 'Name already exist' });
        }
        return res.status(400).json({ message: 'validation error(s)', errors: validator.errors.all() });
      }
      return res.status(404).json({ message: 'Cell does not exist' });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async deleteCell(req, res) {
    try{
      const cellExist = await cellModel.findById(req.params.id);
      if(cellExist) {
        await cellExist.destroy();
        return res.status(200).json({ message: 'Deleted successfully' });
      }
      return res.status(404).json({ message: 'Cell does not exist' });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  }
};

export default cellController;