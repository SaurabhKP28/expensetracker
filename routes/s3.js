const express = require('express');
const router = express.Router();
const { uploadToS3 } = require('../controllers/s3');
const authenticate = require('../middleware/auth');
const UserService = require('../services/userservices'); // ✅ FIXED import

router.get('/download', authenticate, async (req, res) => {
  try {
    const expenses = await UserService.getExpenses(req, {}); // ✅ use correct service

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found' });
    }

    /*
    let csvContent = 'Date,Description,Category,Amount,Frequency\n';
    expenses.forEach(expense => {
      const dateObj = new Date(expense.createdAt);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.toLocaleString('default', { month: 'short' })}/${dateObj.getFullYear()}`;
      csvContent += `${formattedDate},"${(expense.description || '').replace(/"/g, '""')}",${expense.category},${parseFloat(expense.amount).toFixed(2)},${expense.frequency || 'N/A'}\n`;
    });
     */
    let csvContent = 'ID,Date,Description,Category,Amount,Frequency\n';
    expenses.forEach(expense => {
    const dateObj = new Date(expense.createdAt);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.toLocaleString('default', { month: 'short' })}/${dateObj.getFullYear()}`;
    csvContent += `${expense.id},${formattedDate},"${(expense.description || '').replace(/"/g, '""')}",${expense.category},${parseFloat(expense.amount).toFixed(2)},${expense.frequency || 'N/A'}\n`;
    });


    const userId = req.user.id;
    const filename = `Expenses_${userId}_${new Date().toISOString()}.csv`;
    const fileURL = await uploadToS3(csvContent, filename);

    res.status(200).json({ fileURL });
  } catch (err) {
    console.error('Download error:', err.stack || err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;
