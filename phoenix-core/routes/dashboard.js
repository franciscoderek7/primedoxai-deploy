const express=require("express");
const router=express.Router();

const state=require("../core/dashboard/state");

router.get("/api/dashboard",(req,res)=>{
res.json(state);
});

module.exports=router;
