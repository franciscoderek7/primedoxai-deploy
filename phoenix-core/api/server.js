const express=require("express");
const fs=require("fs");

const app=express();

app.use(express.json());


app.get("/health",(req,res)=>{
res.json({
status:"online",
service:"Phoenix Core",
timestamp:new Date().toISOString()
});
});


app.get("/agents",(req,res)=>{
res.json(
JSON.parse(
fs.readFileSync("../agents/registry.json")
)
);
});


app.post("/task",(req,res)=>{

const task={
time:new Date().toISOString(),
request:req.body
};

fs.appendFileSync(
"../logs/tasks.log",
JSON.stringify(task)+"\n"
);

res.json({
accepted:true,
task
});

});


app.listen(3001,()=>{
console.log("Phoenix Core API running on port 3001");
});
