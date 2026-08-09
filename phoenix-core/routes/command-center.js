const express=require("express");

const router=express.Router();

const omniaguard=require("../core/omniaguard/status");

const primedox=require("../core/primedox/status");


router.get(
"/api/command-center",
(req,res)=>{

res.json({

omniaguard,
primedox

});

});


module.exports=router;
