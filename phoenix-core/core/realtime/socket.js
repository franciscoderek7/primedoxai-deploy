let io;


function init(server){

const Socket=require("socket.io");

io=new Socket(server,{
cors:{
origin:"*"
}
});


io.on(
"connection",
socket=>{

console.log(
"Dashboard connected:",
socket.id
);

});

}


function broadcast(data){

if(io){

io.emit(
"dashboard_update",
data
);

}

}


module.exports={
init,
broadcast
};
