const registry=require('./agent-registry');

function routeTask(command){

 let agent="phoenix-core";

 if(command.includes("security")){
   agent="vigilax";
 }

 if(command.includes("document")){
   agent="primedox-ai";
 }

 return {
   command,
   assigned_agent:agent,
   routed_at:new Date().toISOString()
 };
}

module.exports={
 routeTask
};
