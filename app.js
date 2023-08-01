//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encryption = require('mongoose-encryption');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;


const port = 3000;
 
const app = express();

console.log(process.env.API_KEY);
 
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 
   console.log("connected to the server");  
 };

const userSchema = new mongoose.Schema({ //encryption için değiştirildi
  email: String,
  password: String
});

//secret
userSchema.plugin(mongooseFieldEncryption, {secret:process.env.SECRET,fields: ["password"]});
 

const User = new mongoose.model("User", userSchema);

 
app.get("/",function(req,res){
 res.render("home");
});

app.get("/login",function(req,res){
 res.render("login");
});

app.get("/register",function(req,res){
 res.render("register");
});

app.post("/register", async function(req,res){
  try {
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });
    const result = await newUser.save();
    if(result){
        res.render('secrets');
    }else{
        console.log("Login Failed");
    }
} catch (err) {
    console.log(err);
}
});

app.post("/login",async(req,res)=>{
  const username = req.body.username;
  const password = req.body.password;

  try {
      const foundName = await User.findOne({email:username})
      if(foundName){
          if(foundName.password===password){
              res.render('secrets');
          }else{
              console.log('Password Does not Match...Try Again !')
          }
      }else{
          console.log("User Not found...")
      }
  } catch (error) {
      console.log(error);
  }
});







 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});