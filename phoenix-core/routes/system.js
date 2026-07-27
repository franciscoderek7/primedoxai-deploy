const express = require('express');
const router = express.Router();

router.get('/api/system', (req,res)=>{
  res.json({
    system:"Phoenix Core",
    status:"online",
    timestamp:new Date().toISOString(),
    runtime:process.version,
    platform:process.platform
  });
});

module.exports = router;
