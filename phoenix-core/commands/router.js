const express=require('express');
const router=express.Router();

router.get('/api/commands',(req,res)=>{
  res.json({
    commands:[
      "system_status",
      "agent_list",
      "service_health"
    ]
  });
});

module.exports=router;
