const express=require('express');
const router=express.Router();

const taskRouter=require('../core/task-router');

router.post('/api/execute',(req,res)=>{

 const command=req.body.command || "unknown";

 const result=taskRouter.routeTask(command);

 res.json({
   accepted:true,
   result
 });

});

module.exports=router;
