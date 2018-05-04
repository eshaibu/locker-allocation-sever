import Validator from 'validatorjs';
import Sequelize from 'sequelize';
import db from '../models/';

const Op = Sequelize.Op;
const allocationModel = db.Allocation;
const cellModel = db.Cell;

const allocationController = {
  async create(req, res) {
    try{
      const { requestBy, cellId, lockerNumber, requestStatus } = req.body;
      const validator = new Validator(req.body, allocationModel.createRules(), { "email.requestBy": 'Invalid Email' });
      if (validator.passes()) {
        // ensure user eligible to make request
        const checkUserCanRequest = await allocationModel.findOne({
          where: {
            requestBy: {
              [Op.eq]: requestBy
            },
            requestStatus: {
              [Op.ne]: 'rejected'
            },
            expired: {
              [Op.eq]: null
            },
          }
        });
        if (checkUserCanRequest) {
          return res.status(409).json({ message: 'You can not apply again', checkUserCanRequest });
        }
        // ensure locker available
        const lockerOccupied = await allocationModel.findOne({
          where: {
            requestStatus: {
              [Op.ne]: 'rejected'
            },
            lockerNumber: {
              [Op.eq]: lockerNumber
            },
            expired: {
              [Op.eq]: null
            },
          }
        });

        if (lockerOccupied) {
          return res.status(404).json({ message: 'Locker not available', lockerOccupied });
        }

        // Ensure locker number passed within range of locker numbers in cell
        const cell = await cellModel.findById(cellId);
        if (lockerNumber > 0 && lockerNumber <= cell.numberOfLockers) {
          const data = await allocationModel.create({ requestBy, cellId, lockerNumber, requestStatus });
          return res.status(201).json({ message: 'Locker request successful', data });
        }
        return res.status(400).json({ message: 'Invalid locker number' });
      }
      return res.status(400).json({ message: 'validation error(s)', errors: validator.errors.all() });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async approveOrExpire(req, res) {
    try{
      const allocationExist = await allocationModel.findById(req.params.id);
      if(allocationExist) {
        if(req.body.action === 'approve'){
          await allocationExist.update({ requestStatus: 'approved', expired: null });
          return res.status(201).json({ message: 'Approved and key collected' });
        }
        if(req.body.action === 'reject'){
          await allocationExist.update({ requestStatus: 'rejected', expired: new Date() });
          return res.status(201).json({ message: 'Rejected request' });
        }
        await allocationExist.update({ expired: new Date() });
        return res.status(201).json({ message: 'Locker key successfully returned' });
      }
      return res.status(404).json({ message: 'Allocation request does not exist' });
    } catch (errors) {
      return res.status(400).json({ message: 'Some server problems, please try again', errors });
    }
  },

  async list(req, res) {
    try {
      const page = (req.query.page <= 0 || req.query.page === undefined) ? 0 : req.query.page - 1;
      const limit = req.query.limit || 4;
      const offset = limit * page;
      const order = (req.query.order && req.query.order.toLowerCase() === 'desc')
        ? [['createdAt', 'DESC']] : [['createdAt', 'ASC']];
      const queryBuilder = {
        limit, offset, order,
        include: [{
          model: cellModel,
          attributes: ['name', 'numberOfLockers']
        }]
      };
      const data = await allocationModel.findAndCountAll(queryBuilder);
      return res.status(200).json({message: 'List of requests', data });
    } catch (errors) {
      return res.status(400).json({message: 'Some server problems, please try again', errors});
    }
  }
};

export default allocationController;