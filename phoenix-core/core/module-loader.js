const fs=require('fs');
const path=require('path');

function loadModules(app){

const dir=path.join(__dirname,'../modules');

if(!fs.existsSync(dir)){
 console.log("[MODULES] none found");
 return;
}

fs.readdirSync(dir).forEach(file=>{

const full=path.join(dir,file);

if(file.endsWith('.js')){

try{

const module=require(full);

if(typeof module==="function"){
 module(app);
 console.log("[MODULE LOADED]",file);
}

}catch(err){
 console.log("[MODULE ERROR]",file,err.message);
}

}

});

}

module.exports=loadModules;
