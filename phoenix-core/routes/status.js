const express = require('express');
const router = express.Router();

router.get('/api/status',(req,res)=>{
  res.json({
    platform:"Francisco Holdings AI Operating System",
    core:"Phoenix Core",
    status:"operational",
    timestamp:new Date().toISOString()
  });
});

module.exports = router;
