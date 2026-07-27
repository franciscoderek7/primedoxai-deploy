const agents = [
  {
    id:"phoenix-core",
    name:"Phoenix Core",
    type:"orchestrator",
    status:"online",
    capabilities:[
      "task_routing",
      "system_control",
      "agent_management"
    ]
  },
  {
    id:"vigilax",
    name:"Vigilax Sentinel",
    type:"security_agent",
    status:"online",
    capabilities:[
      "fraud_detection",
      "security_monitoring"
    ]
  },
  {
    id:"primedox-ai",
    name:"PrimeDox AI",
    type:"document_agent",
    status:"planned",
    capabilities:[
      "document_processing",
      "document_generation"
    ]
  }
];

function getAgents(){
 return agents;
}

function findAgent(capability){
 return agents.find(a =>
   a.capabilities.includes(capability)
 );
}

module.exports={
 getAgents,
 findAgent
};
