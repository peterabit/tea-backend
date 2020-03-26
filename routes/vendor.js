const express = require('express');
const router = express.Router();
const db = require('../migrations/_connect_db')
const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads' });
const fs = require('fs');


router.get('/try-get', (req, res) => {
  const sql = "SELECT `id`, `vendorAccount`, `vendorPassword`, `vendorName`, `vendorEmail`, `vendorPhone`, `vendorZone`, `vendorAddress`, `vendorImg`, `vendorAbout`, `vendorBanner`, `createdAt`, `updatedAt` FROM `vendordata` WHERE 1";

  db.query(sql, (error, results, fields) => {
    if (error) throw error
    res.json(results);

  });
  return
});

//廠商列表取得頁面
router.get('/getallvendor', (req, res) => {
  const sql = "SELECT `id`,`vendorName`, `vendorZone`, `vendorImg` FROM `vendordata` WHERE 1";

  db.query(sql, (error, results, fields) => {
    if (error) throw error
    for (i = 0; i < results.length; i++) {
      results[i].vendorImg = "http://localhost:3333/images/" + results[i].vendorImg
    }
    // console.log(results)
    res.json(results);
  });
  return
});



//前端取得某個廠商頁面
router.get('/getvendorpage', (req, res) => {
  const sql = "SELECT `vendorName`, `vendorPhone`, `vendorZone`, `vendorImg`, `vendorAbout`, `vendorBanner` FROM `vendordata` WHERE id='11'";

  db.query(sql, (error, results, fields) => {
    if (error) throw error
    results[0].vendorImg = "http://localhost:3333/images/" + results[0].vendorImg
    results[0].vendorBanner = "http://localhost:3333/images/" + results[0].vendorBanner
    console.log(results);
    res.json(results);
  });
  return
});

//後端預覽廠商前台API
router.get('/previewvendor/:id', (req, res) => {
  const sql = "SELECT `vendorName`, `vendorPhone`, `vendorZone`, `vendorImg`, `vendorAbout`, `vendorBanner` FROM `vendordata` WHERE id=?";
  db.query(sql, req.params.id, (error, results, fields) => {
    if (error) throw error
    results[0].vendorImg = "http://localhost:3333/images/" + results[0].vendorImg
    results[0].vendorBanner = "http://localhost:3333/images/" + results[0].vendorBanner
    console.log(results);
    res.json(results);
  });
  return
});


// get Events
//廠商註冊API
router.post('/vendorsignup', (req, res) => {
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



//廠商登入API
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
        if (req.body.vendorPassword === results[0].vendorPassword) {
          data.success = true;
          data.message.type = 'primary';
          data.message.text = '有相符資料'
          data.vendorid = results[0].id
        }
      } else {
        data.message.text = '無相符資料'
      }
      return res.json(data);
    });
  } catch (error) {
    throw error
  }

});

//取得廠商資料API
router.get('/getvendordata/:id', (req, res) => {
  const sql = "SELECT `vendorName`, `vendorEmail`, `vendorPhone`, `vendorZone`, `vendorAddress`, `vendorImg`,`vendorAbout` ,`vendorBanner` FROM `vendordata` WHERE id=?";
  let id = req.params.id
  console.log(id)
  db.query(sql, id, (error, results, fields) => {
    if (error) throw error
    console.log('還沒改', results)
    results[0].vendorImg = "http://localhost:3333/images/" + results[0].vendorImg
    results[0].vendorBanner = "http://localhost:3333/images/" + results[0].vendorBanner
    console.log(results)
    res.json(results);

  });
  return
});





//更新廠商資料API

router.post('/updatedata', upload.single('vendorImg'), (req, res) => {
  let venderObj = {
    vendorName: req.body.vendorName,
    vendorEmail: req.body.vendorEmail,
    vendorPhone: req.body.vendorPhone,
    vendorZone: req.body.vendorZone,
    vendorAddress: req.body.vendorAddress,
  }
  try {
    const data = { success: false, message: { type: 'danger', text: '', url: '', imgmsg: '' } };
    if (req.file) {
      switch (req.file.mimetype) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case undefined:
          fs.rename(req.file.path, './public/images/' + req.file.originalname, error => {
            if (error) {
              data.success = false;
              data.message.imgmsg = '無法搬動檔案';
            } else {
              data.success = true;
              data.message.imgmsg = '';
            }
          });
          break;
        default:
          fs.unlink(req.file.path, error => {
            data.message.imgmsg = '不接受式這種檔案格';
          });
      }
      req.file.path = req.file.originalname
      venderObj['vendorImg'] = req.file.path
    } else {
      data.success = true;
      data.message.imgmsg = '';
    }
    const sql = "UPDATE vendordata SET ?  WHERE id=?";
    db.query(sql, [venderObj, req.body.localId], (error, results, fields) => {
      if (error) { throw error }
      if (results.length === 1) {
        // console.log('results',results)
        data.success = true;
        data.message.type = 'primary';
        data.message.text = '更新成功'
      } else {
        data.message.text = '無更新'
      }
      return res.json(data);
    });
  } catch (error) {
    throw error
  }

});



//更新關於我跟Banner

router.post('/updateabout', upload.single('vendorBanner'), (req, res) => {
  let venderObj = {
    vendorAbout: req.body.vendorAbout,
  }
  try {
    const data = { success: false, message: { type: 'danger', text: '', url: '', imgmsg: '' } };
    if (req.file) {
      switch (req.file.mimetype) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case undefined:
          fs.rename(req.file.path, './public/images/' + req.file.originalname, error => {
            if (error) {
              data.success = false;
              data.message.imgmsg = '無法搬動檔案';
            } else {
              data.success = true;
              data.message.imgmsg = '';
            }
          });
          break;
        default:
          fs.unlink(req.file.path, error => {
            data.message.imgmsg = '不接受式這種檔案格';
          });
      }
      req.file.path = req.file.originalname
      venderObj['vendorBanner'] = req.file.path
    } else {
      data.success = true;
      data.message.imgmsg = '';
    }
    const sql = "UPDATE vendordata SET ?  WHERE id=?";
    db.query(sql, [venderObj, req.body.localId], (error, results, fields) => {
      if (error) { throw error }
      if (results.length === 1) {
        // console.log('results',results)
        data.success = true;
        data.message.type = 'primary';
        data.message.text = '更新成功'
      } else {
        data.message.text = '無更新'
      }
      return res.json(data);
    });
  } catch (error) {
    throw error
  }

});
//更新關於我跟Banner區結束


//取得廠商訂單API(列表)
router.get('/getvendorderlist/:id', (req, res) => {
  const sql = "SELECT `memberId`, `vendorId`, `totalPrice`, `coupon` FROM `orderdata` WHERE vendorId=?";
  let id = req.params.id
  console.log(id)
  db.query(sql, id, (error, results, fields) => {
    if (error) throw error

    console.log(results)
    res.json(results);

  });
  return
});




//取得廠商訂單API(詳細)
router.get('/getvendorder/:id', (req, res) => {
  const sql = "SELECT orderdata.id , orderdata.memberId ,orderdetail.productName ,orderdetail.productPrice ,orderdetail.productAmount FROM orderdata INNER JOIN orderdetail ON orderdata.id=orderdetail.orderId WHERE vendorId=?";
  let id = req.params.id
  console.log(id)
  db.query(sql, id, (error, results, fields) => {
    if (error) throw error

    console.log(results)
    res.json(results);

  });
  return
});



module.exports = router;
