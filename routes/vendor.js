const express = require('express');
const router = express.Router();
const db = require('../migrations/_connect_db')

// get Events
router.post('/try-insert', (req, res) => {
  try {
    const data = { success: false, message: { type: 'danger', text: '' } };
    data.body = req.body;
    console.log('req.body', req.body)
    const sql = "INSERT INTO vendordata(vendorAccount,vendorPassword,vendorEmail,vendorPhone) VALUE(?,?,?,?) ";
    db.query(sql, [req.body.vendorAccount, req.body.vendorPassword, req.body.vendorEmail, req.body.vendorPhone], (error, results, fields) => {
      if (error) { throw error }

      if (results.affectedRows === 1) {
        data.success = true;
        data.message.type = 'primary';
        data.message.text = '新增完成'
      } else {
        data.message.text = '資料沒有新增'
      }
      return res.json(data);
    });
  } catch (error) {
    throw error
  }

});


router.post('/try-logindata', (req, res) => {
  try {
    const data = { success: false, message: { type: 'danger', text: '' } };
    data.body = req.body;
    console.log('req.body', req.body)
    const sql = "SELECT id,vendorAccount,vendorPassword FROM vendordata WHERE vendorAccount=?";
    db.query(sql, req.body.vendorAccount, (error, results, fields) => {
      if (error) { throw error }
      console.log(results.length)
      if (results.length === 1) {
        console.log(results)
        data.success = true;
        data.message.type = 'primary';
        data.message.text = '有相符資料'
        data.vendorid=results[0].id
      } else {
        data.message.text = '無相符資料'
      }
      return res.json(data);
    });
  } catch (error) {
    throw error
  }

});

module.exports = router;
