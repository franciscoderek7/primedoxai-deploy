const fs=require('fs');
const path=require('path');

const file=path.join(__dirname,'registry.json');

function getAgents(){
 return JSON.parse(fs.readFileSync(file,'utf8'));
}

function addAgent(agent){
 const data=getAgents();
 data.agents.push(agent);
 fs.writeFileSync(file,JSON.stringify(data,null,2));
 return data;
}

module.exports={getAgents,addAgent};
