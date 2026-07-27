module.exports=function(app){

app.get('/api/modules',(req,res)=>{

res.json({
system:"Phoenix Core Module System",
status:"online",
modules:[
"system",
"agents",
"vigilax",
"primedox-ai"
]
});

});

};
