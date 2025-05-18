const Expense = require('../models/Expense');

const getExpenses = async (req, where = {}) => {
  const userId = req.user.id;

  return await Expense.findAll({
    where: {
      UserId: userId,
      ...where
    },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = {
  getExpenses
};
