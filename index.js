var g_myFirebaseRef = new Firebase("https://fiery-inferno-8152.firebaseio.com/");
var g_mainCanvas = document.getElementById("mainCanvas");
var g_account = "";
function userLogin(){
	var accountInput = document.getElementById("AccountInput");
	var passwordInput = document.getElementById("PasswordInput");
	g_myFirebaseRef.child("users/"+accountInput.value+"/password").once("value",function(snapshot){
		if(passwordInput.value == snapshot.val()){
			alert("Loging success!!");
			g_account = accountInput.value;
			accountInput.style.display = "none";
			passwordInput.style.display = "none";
			document.getElementById("LoginButton").style.display = "none";
			document.getElementById("RegisterButton").style.display = "none";
			g_mainCanvas.style.display = "block";
		}else{
			alert("Login failed!");
		}
	});

}
function userRegister(){
	var accountInput = document.getElementById("AccountInput");
	var passwordInput = document.getElementById("PasswordInput");
	var accountString = accountInput.value;
	g_myFirebaseRef.child("users/"+accountInput.value+"/password").once("value",function(snapshot){
		console.log(snapshot.val());
		if(snapshot.val() != null){
			alert("Register fail!!");
		}else{
			var usersRef = g_myFirebaseRef.child("users/"+accountString);
			var json = {
				password:passwordInput.value
			};
			usersRef.update(json);
			alert("Register Success!!");			
		}
	});
	
}
// g_myFirebaseRef.child("users/alanisawesome/date_of_birth").on("value", function(snapshot){
//   alert(snapshot.val());
// });