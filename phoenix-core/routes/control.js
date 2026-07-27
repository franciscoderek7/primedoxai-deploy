const express=require('express');
const router=express.Router();
const registry=require('../services/registry');

router.get('/api/control',(req,res)=>{
 res.json({
  system:"Phoenix Core Control Plane",
  status:"online",
  services:registry.getServices(),
  agents:registry.getAgents()
 });
});


router.post('/api/command', express.json(), (req,res)=>{

 const command = req.body?.command || "none";

 res.json({
   accepted:true,
   command:command,
   executed_by:"Phoenix Core",
   timestamp:new Date().toISOString()
 });

});


module.exports=router;
