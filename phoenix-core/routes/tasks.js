const express = require('express');
const router = express.Router();

let tasks = [];
let events = [];

router.get('/api/tasks',(req,res)=>{
  res.json({
    count: tasks.length,
    tasks
  });
});

router.post('/api/tasks',(req,res)=>{

  console.log("TASK BODY:", req.body);

  const command =
    req.body && (
      req.body.command ||
      req.body.task ||
      req.body.action
    ) || "unknown";

  const task={
    id:Date.now().toString(),
    command,
    status:"queued",
    created:new Date().toISOString()
  };

  tasks.push(task);

  events.push({
    event:"task_created",
    task_id:task.id,
    command,
    time:new Date().toISOString()
  });

  res.json({
    accepted:true,
    task
  });
});

router.get('/api/audit',(req,res)=>{
  res.json({events});
});

module.exports=router;
