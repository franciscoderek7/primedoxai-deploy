const fs=require('fs');

function getAgents(){
 return JSON.parse(
  fs.readFileSync('./data/agents.json','utf8')
 );
}

function getServices(){
 return {
  services:[
   {
    name:"Phoenix Core",
    port:3000,
    status:"online"
   },
   {
    name:"Vigilax Sentinel",
    port:3002,
    status:"online"
   }
  ]
 };
}

module.exports={
 getAgents,
 getServices
};
