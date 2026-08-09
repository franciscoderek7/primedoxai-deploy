const express=require("express");
const router=express.Router();

const dashboard=require("../core/dashboard/status");


router.get(
"/api/dashboard-live",
(req,res)=>{
 res.json({
   timestamp:new Date(),
   dashboard
 });
});


module.exports=router;
