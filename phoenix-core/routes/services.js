const express = require('express');
const router = express.Router();
const registry = require('../services/registry');

router.get('/api/services', (req,res)=>{
  res.json(registry.getServices());
});

router.post('/api/services/register',(req,res)=>{
  res.json(
    registry.registerService(req.body)
  );
});

module.exports = router;
