function update(){
	let toUpdate = {};
	toUpdate["newPrivacySet"] = false;
	if(document.getElementById("true").checked){
		toUpdate["newPrivacySet"] = true;
	}
	req = new XMLHttpRequest;
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			result = JSON.parse(this.responseText);
		}
	}
	req.open("PUT", `http://localhost:3000/update`,true);
	req.setRequestHeader("Content-Type","application/json");
	req.send(JSON.stringify(toUpdate));
	return;	
}