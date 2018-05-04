/* eslint no-loop-func:0 */
import Validator from 'validatorjs';
import Sequelize from 'sequelize';
import db from '../models/';

const Op = Sequelize.Op;
const cellModel = db.Cell;
const allocationModel = db.Allocation;

const cellController = {
  async create(req, res) {
    try {
      const { name, numberOfLockers } = req.body;
      const validator = new Validator(req.body, cellModel.createRules());
      if (validator.passes()) {
        const nameExist = await cellModel.findOne({ where: { name } });
        if (!nameExist) {
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
    try {
      const cellExist = await cellModel.findById(req.params.id);
      if (cellExist) {
        const lockerNoArray = Array.from({ length: cellExist.numberOfLockers }, (v, k) => k + 1);
        const lockerOccupiedInCell = await allocationModel.findAll({
          where: {
            cellId: req.params.id,
            requestStatus: {
              [Op.ne]: 'rejected'
            },
            expired: null,
          }
        });
        const unavailableLockers = lockerOccupiedInCell.map(allocation => allocation.lockerNumber);
        const availableLockers = lockerNoArray.filter(lockerNumber => !unavailableLockers.includes(lockerNumber));
        const cell = { ...cellExist.dataValues, unavailableLockers, availableLockers };
        return res.status(200).json({ message: 'Cell retrieved', data: cell });
      }
      return res.status(404).json({ message: 'Cell does not exist' });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async list(req, res) {
    try {
      const cells = await cellModel.findAndCountAll();

      // console.log(cells.rows);

      const cellsResult = [];
      for (let i = 0; i < cells.rows.length; i += 1) {
        allocationModel.findAll({
          where: {
            cellId: cells.rows[i].id,
            requestStatus: {
              [Op.ne]: 'rejected'
            },
            expired: null,
          }
        })
          .then((lockerOccupiedInCell) => {
            const lockerNoArray = Array.from({ length: cells.rows[i].numberOfLockers }, (v, k) => k + 1);
            const unavailableLockers = lockerOccupiedInCell.map(allocation => allocation.lockerNumber);
            const availableLockers = lockerNoArray.filter(lockerNumber => !unavailableLockers.includes(lockerNumber));
            const cellWithInfo = { ...cells.rows[i], unavailableLockers, availableLockers };
            console.log(cellWithInfo, '>>>>>>>>');
            cellsResult.push(cellWithInfo);
          });
      }

      return res.status(200).json({ message: 'List of cells', data: cellsResult });

      // const cellsResult = cells.rows.map((cell) => {
      //   const lockerNoArray = Array.from({ length: cell.numberOfLockers }, (v, k) => k + 1);
      //   const lockerOccupiedInCell = allocationModel.findAll({
      //     where: {
      //       cellId: cell.id,
      //       requestStatus: {
      //         [Op.ne]: 'rejected'
      //       },
      //       expired: null,
      //     }
      //   });
      //   const unavailableLockers = lockerOccupiedInCell.map(allocation => allocation.lockerNumber);
      //   const availableLockers = lockerNoArray.filter(lockerNumber => !unavailableLockers.includes(lockerNumber));
      //   const cellWithInfo = { ...cell.dataValues, unavailableLockers, availableLockers };
      //   console.log(cellWithInfo, '>>>>>>>>');
      //   // cellsResult.push(cellWithInfo);
      //   return cellWithInfo;
      // });

      // Promise.all(cellsResult).then((completed) => {
      //   // document.writeln( `\nResult: ${completed}`)
      //   return res.status(200).json({ message: 'List of cells', data: completed });
      // });
      // return res.status(200).json({ message: 'List of cells', data: cells });
    } catch (errors) {
      console.log(errors);
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async update(req, res) {
    try {
      const { name, numberOfLockers } = req.body;
      const cellExist = await cellModel.findById(req.params.id);
      if (cellExist) {
        const validator = new Validator(req.body, cellModel.createRules());
        if (validator.passes()) {
          const nameExist = await cellModel.findOne({ where: { name, id: { [Op.ne]: req.params.id } } });
          if (!nameExist) {
            // check when locker reduced, ensure you remove all allocations to those lockers not in
            // current capacity (rare case)
            if (numberOfLockers < cellExist.numberOfLockers) {
              await allocationModel.destroy({
                where: {
                  cellId: req.params.id,
                  lockerNumber: {
                    [Op.gt]: numberOfLockers
                  }
                }
              });
            }
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
    try {
      const cellExist = await cellModel.findById(req.params.id);
      if (cellExist) {
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
