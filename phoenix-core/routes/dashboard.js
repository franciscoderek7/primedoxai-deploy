const express=require('express');
const router=express.Router();
const registry=require('../services/registry');

router.get('/api/dashboard',(req,res)=>{
  const data=registry.getServices();

  res.json({
    platform:"Francisco Holdings AI Operating System",
    core:"Phoenix Core",
    services:data.services,
    status:"operational"
  });
});

module.exports=router;
