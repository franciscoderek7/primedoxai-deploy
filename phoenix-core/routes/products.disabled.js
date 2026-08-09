const express=require('express');
const router=express.Router();

const products=require('../products/catalog');

router.get('/api/products',(req,res)=>{
 res.json({
  products
 });
});

module.exports=router;
