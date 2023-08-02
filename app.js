//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encryption = require('mongoose-encryption'); ---level2
// const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;---level2
// const md5 = require('md5'); ---level3
// const bcrypt = require('bcrypt'); //level4
// const saltRounds = 10; //level4
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const port = 3000;
 
const app = express();

// console.log(process.env.API_KEY);
 
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//?Yeri önemli--cookie
app.use(session({
  secret:"Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());//initialize:kimlik doğrulama için passporu ayarlar.--cookie
app.use(passport.session());   //session oluşturur ve kullanıcıya özel oturum --cookie


main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 
    // mongoose.set("useCreateIndex",true);--cookie-kullanımdan kaldırılma uyarısı oluşursa
   console.log("connected to the server");  
 };

const userSchema = new mongoose.Schema({ //encryption için değiştirildi
  email: String,
  password: String
});

// userSchema.plugin(mongooseFieldEncryption, {secret:process.env.SECRET,fields: ["password"]});

userSchema.plugin(passportLocalMongoose);//şifreleri hash & salt için mongodb'ye kaydeder--cookie
 

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());//kimlik doğrulama,serileştirme,seriden çıkarma--cookie
passport.serializeUser(User.serializeUser()); //serialise:kimlik bilgilerini cookie doldurur.
passport.deserializeUser(User.deserializeUser());

 
app.get("/",function(req,res){
 res.render("home");
});

app.get("/login",function(req,res){
 res.render("login");
});

app.get("/register",function(req,res){
 res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets")
  }else{
    res.redirect("/login")
  }
})

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/register",  function(req,res){
  //lvl5
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );


  // try {
    //lvl-4::
    // bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email:req.body.username,
    //         password:hash
    //     });
    //     const result = await newUser.save();
    //     if(result){
    //         res.render('secrets');
    //     }else{
    //         console.log("Login Failed");
    //     }
    // });

    //* const newUser = new User({
    //*     email:req.body.username,
    //*     password:md5(req.body.password)
    //* });
    //* const result = await newUser.save();
    //* if(result){
    //*     res.render('secrets');
    //* }else{
    //*     console.log("Login Failed");
    //* }
// } catch (err) {
//     console.log(err);
// }
});

app.post("/login",(req,res)=>{
  //?lvl5
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
 
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });

  // const username = req.body.username;
    //*const password =md5(req.body.password);
    // const password =req.body.password;

  // try {
      //?lvl4
      // const foundName = await User.findOne({email:username})
      // if(foundName){
      //   bcrypt.compare(password, foundName.password, function(err, result) {
      //       if(result === true){
      //           res.render('secrets');
      //       }else{
      //           console.log('Password Does not Match...Try Again !')
      //       }
      //   });
        //*   if(foundName.password===password){
        //*       res.render('secrets');
        //*   }else{
        //*       console.log('Password Does not Match...Try Again !')
        //*   }
      // }else{
      //     console.log("User Not found...")
      // }
  // } catch (error) {
  //     console.log(error);
  // }
});







 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});