var express = require("express");
var router = express.Router();
var md5 = require('md5');
//var bodyParser = require("body-parser");

//app.use(bodyParser.urlencoded({extended:false}));
router.post('/loginForm', function(req, res){
    let name = req.body.authentication__username;
    let password = md5(req.body.authentication__password);
    res.send("hi " + name + ". Your hashed password is: " + password);
});

module.exports = router;