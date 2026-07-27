const fs=require('fs');

const TASKS="./data/tasks.json";
const LOGS="./data/logs.json";

function read(file){
 return JSON.parse(fs.readFileSync(file,"utf8"));
}

function write(file,data){
 fs.writeFileSync(file,JSON.stringify(data,null,2));
}

function createTask(command){

 const tasks=read(TASKS);
 const logs=read(LOGS);

 const task={
  id:Date.now().toString(),
  command,
  status:"queued",
  created:new Date().toISOString()
 };

 tasks.tasks.push(task);

 logs.events.push({
  event:"task_created",
  task_id:task.id,
  time:new Date().toISOString()
 });

 write(TASKS,tasks);
 write(LOGS,logs);

 return task;
}

function getTasks(){
 return read(TASKS);
}

function getLogs(){
 return read(LOGS);
}

module.exports={
 createTask,
 getTasks,
 getLogs
};
