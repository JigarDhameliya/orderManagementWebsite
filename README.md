# orderManagementWebsite
This website manages the orders placed by the users. It uploads everything in the MongoDB database and also make sures the user is logged in before they can make any changes.
NAME: Jigar M. Dhamleiya

To Run
1) Open CMD or terminal in VSCode
2) Navigate to the directory where the file is downloaded
3) run the code "npm install" to install all the dependencies and requires modules to test the program.
4) run the database initializer first to fill in all the data using "node database-initializer.js"
5) run the program using "node server.js" or "npm run dev"

I have edited the database-initializer code to add a new "orders" collection whenever the data is initialized

load the website 
http://localhost:3000/

All supported routes
app.get(["/","/home"]);
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

auth-> Only allow if user is Logged OUT
auth2-> Only allow if user is Logged IN

valid username = anything but numbers and ""
valid password = anything but ""

/public/js -> This folder has all the javascript that is needed
/views -> contains all the pug templates including the partial templates namely the header and the footer.

Thanks
