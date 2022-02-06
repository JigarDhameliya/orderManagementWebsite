const express = require('express');
const session = require('express-session');
const req = require('express/lib/request');
const res = require('express/lib/response');
const MongoDBStore = require('connect-mongodb-session')(session); 
let mongo = require('mongodb');
let mc = mongo.MongoClient;
let db;
let store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/a4',
	collection: 'sessions',
	databaseName: 'a4'
});

let app = express();

//sessions data
app.use(session({
	secret: "some secret key here",
	store:store,
	resave:true,
	saveUninitialized:false,
	cookie:{
		maxAge: 1000*60*60*24*7
	}
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("Public"));
app.set("view engine", "pug");
app.use(function(req,res,next){
	console.log(req.method+ " for " + req.url);
	console.log("session id: " + req.session.id);
	next();
})
app.use(globalSession);

//All the supported routes routes
app.get(["/","/home"],function(req,res,next){res.render("pages/home",{motto: "We are making what you are craving!"});});
app.get("/login",auth,loginPage);
app.post("/login",auth,login);
app.get("/logout",auth2,logout);
app.get("/registration",auth,registrationPage);
app.post("/registration",auth,register);
app.get("/users/:uid",auth2,singleUser);
app.get("/users",auth2,multipleUsers);
app.get("/orderform",auth2,orderform);
app.put("/update",auth2,update);
app.post("/orders",auth2,orders);
app.get("/orders/:oid",auth2,singleOrder);

//makes our session data global so pug templates can access it.
//(Inspired by Joseph's workshop)
function globalSession(req,res,next){
	if(req.session){
		res.locals.session = req.session;
		next();
	}
}

//Only allow if user is Logged OUT
function auth(req,res,next){
	if(req.session.loggedin){
		res.status(401).send("Unauthorized");
		return;
	}
	next();
}

//Only allow if user is Logged IN
function auth2(req,res,next){
	if(!req.session.loggedin){
		res.status(401).send("Unauthorized");
		return;
	}
	next();
}

function loginPage(req,res,next){
	res.render("pages/login");
}
//Try to find the user. If you do find it then check the passowrd and provide appropriate response
function login(req, res, next){

	let username = req.body.username;
	let password = req.body.password;

	db.collection('users').findOne({username:{$regex: new RegExp(username), $options: "i"}},function(err,result){
		if(err) throw err;
		if(result === null){
			res.status(401).send("Unauthorized");
			return;
		}
		if(result.password === password){
			req.session.loggedin = true;
			req.session.username = username;
			req.session.userID = result._id;
			res.locals.session = req.session;
			res.status(200).send("Logged in");
		}
		else{
			res.status(401).send("Not authorized. Invalid password.");
		}
	});
}

//LogOut of the application
function logout(req, res, next){
	req.session.loggedin = false;
	req.session.username = undefined;
	res.redirect("/home");
}

//Render the register form
function registrationPage(req,res,next){
	res.render("pages/registrationForm");
}

//Register a new user iff a username with same name doesn't exist.
function register(req,res,next){
	let username = req.body.username;
	db.collection("users").findOne({username:{$regex: new RegExp(username), $options: "i"}}, function(err,result1){
		if(err) throw err;
		if(result1 === null){
			db.collection("users").insertOne(req.body, function(err,result2){
				if(err) throw err;
				req.session.loggedin = true;
				req.session.username = username;
				db.collection("users").findOne({username:req.session.username}, function(err,result3){
					if(err) throw err;
					req.session.userID = result3._id;
					res.locals.session = req.session;
					res.status(201).json(result3);
				});
			});
		}
		else{
			let temp = result1.username.localeCompare(username);
			if(temp !== 0){
				db.collection("users").insertOne(req.body, function(err,result2){
					if(err) throw err;
					req.session.loggedin = true;
					req.session.username = username;
					db.collection("users").findOne({username:req.session.username}, function(err,result3){
						if(err) throw err;
						req.session.userID = result3._id;
						res.locals.session = req.session;
						res.status(201).json(result3);
					});
				});
			}
			else{
				res.status(401).send("User already exists");
			}
		}
	});
}

//Fetch details of single user and send it to pug to render the details
function singleUser(req,res,next){
	let oid;
	try{
		oid = new mongo.ObjectId(req.params.uid);
	}
	catch{
		oid = undefined;
	}
	
	if(oid){
		db.collection('users').findOne({"_id":oid},function(err,result){
			if(err) throw err;
			if(result === null){
				res.status(401).send("Invalid User ID");
				return;
			}
			db.collection('orders').find({"uid":oid}).toArray(function(err,result1){
				if(err) throw err;
				if(result === null){
					res.status(401).send("Invalid User ID");
					return;
				}
				if(result.privacy === false || req.session.username === result.username){
					res.render("pages/singleUser",{user:result,orders:result1});
				}
				else{
					res.status(403).send("The User you are requesting is private");
				}
			});
		});
	}
	else{
		res.status(404).send("Invalid User ID");
	}
}

//Show a list of all users matching the query.
//If there is no query show all public users
function multipleUsers(req,res,next){
	if(!req.query.name){
		db.collection("users").find({"privacy":false}).toArray(function(err,result){
			if(err) throw err;
			if(!result === null){
				res.status(404).send("No content to show");
				return;
			}
			else{
				res.render("pages/usersList", {users:result});
			}
		});
		return;
	}
	else if(isNaN(req.query.name)){
		db.collection('users').find({username:{$regex: new RegExp(req.query.name), $options: "i"}, "privacy":false}).toArray(function(err,result){
			if(err) throw err;
			if(result.length === 0){
				res.status(404).send(`No users with name ${req.query.name}`);
				return;
			}
			else{
				res.render("pages/usersList",{users:result});
			}
		});
	}
	else{
		res.status(404).send("Invalid user name");
	}
}

//Validate and render OrderForm
function orderform(req,res,next){
	res.render("pages/orderform");
	return;
}

//Update the privacy settings of the user
function update(req,res,next){
	privacySet = req.body.newPrivacySet;
	console.log("the privacy set is: " +  privacySet);
	db.collection("users").updateOne({username:res.locals.session.username}, {$set: {privacy: privacySet}}, function(err,result){
		if(err) throw err;
		//console.log("Updated");
	});
}

//Add the orders to "orders" collection
function orders(req,res,next){
	db.collection("orders").insertOne({uid:req.session.userID, order:req.body}, function(err,result){
		if(err) throw err;
		//console.log(result);
	});
	res.status(200).send("Order Placed");
}

//Fetch details of the single order the user is requesting for
function singleOrder(req,res,next){
	let objectId;
	try{
		objectId = new mongo.ObjectId(req.params.oid);
	}
	catch{
		objectId = undefined;
	}
	
	if(objectId){
		db.collection('orders').findOne({"_id":objectId},function(err,result){
			if(err) throw err;
			if(result === null){
				res.status(404).send("Wrong object id");
				return;
			}
			let userID;
			try{
				userID = new mongo.ObjectId(result.uid);
			}
			catch{
				userID = undefined;
			}
			if(userID){
				db.collection('users').findOne({"_id":userID},function(err,result1){
					if(err) throw err;
					if(result === null){
						res.status(404).send("Wrong object id");
						return;
					}
					res.render("pages/singleOrder",{userOrder:result, user:result1});
				});
			}
			else{
				res.status(404).send("Invalid User ID");
			}
		});
	}
	else{
		res.status(404).send("Invalid Order ID");
	}
	
}

mc.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;
  db = client.db('a4');
  app.listen(3000);
  console.log("Listening on port 3000");
});
