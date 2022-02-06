function registerFunc(){
	let toSend = {};
	username = document.getElementById("username").value;
	password = document.getElementById("password").value;
	if(username === "" || !isNaN(username) || password ===""){
		alert("The username/passowrd is not valid");
		return;
	}
	else{
		toSend["username"] = username;
		toSend["password"] = password;
		toSend["privacy"] = false;
		toSend["loggedIn"] = true;
		console.log("To send obj is:");
		console.log(toSend);
		req = new XMLHttpRequest;
		req.onreadystatechange = function() {
			if(this.readyState==4 && this.status==201){
				result = JSON.parse(this.responseText);
				//redirect to '/users/:userId'
				window.location.replace(`http://localhost:3000/users/${result._id}`);
			}
			else if(this.readyState==4 && this.status==401){
				document.getElementById("addText").innerHTML = `This user already exists`;
			}
		}
		req.open("POST", `http://localhost:3000/registration`,true);
		req.setRequestHeader("Content-Type","application/json");
		req.send(JSON.stringify(toSend));
		return;	
	}
}