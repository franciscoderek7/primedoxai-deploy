const express=require('express');
const router=express.Router();

const registry=require('../core/agent-registry');

router.get('/api/agents',(req,res)=>{
 res.json({
   count:registry.getAgents().length,
   agents:registry.getAgents()
 });
});

module.exports=router;
