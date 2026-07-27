const express = require('express');
const router = express.Router();

router.get('/api/logs',(req,res)=>{
  res.json({
    logs:[
      {
        service:"Phoenix Core",
        event:"system_online",
        time:new Date().toISOString()
      }
    ]
  });
});

module.exports = router;
