function loginFunc(){
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
		req = new XMLHttpRequest;
		req.onreadystatechange = function() {
			if(this.readyState==4 && this.status==200){
				window.location.replace(`http://localhost:3000/home`);
			}
			else if(this.readyState==4 && this.status==401){
				document.getElementById("addText").innerHTML = `Wrong username / password <br>`;
			}
		}
		req.open("POST", `http://localhost:3000/login`,true);
		req.setRequestHeader("Content-Type","application/json");
		req.send(JSON.stringify(toSend));
		return;	
	}
	
}