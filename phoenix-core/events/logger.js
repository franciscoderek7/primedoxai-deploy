const fs=require("fs");

function logEvent(type,data){

const event={
time:new Date().toISOString(),
type:type,
data:data
};

fs.appendFileSync(
"./logs/events.log",
JSON.stringify(event)+"\n"
);

}

module.exports=logEvent;
