/// <reference path="./libs.d.ts" />

// Googleから取得したOAuth 2.0 のClient ID
const CLIENT_ID = "902347479823-4rleemh315kaedsq8oc9vqegro999b32.apps.googleusercontent.com";
// client_secret="KrAWzmSybojG5ZpSBtM1Olmc"
// 認証時にリクエストする機能の範囲
var SCOPES = ['https://www.googleapis.com/auth/drive'];
class Main {
	constructor() {

	}
}
function checkAuth() {

	var oauthToken;

	console.log("gapi.auth.authorize");
	gapi.auth.authorize(
		{

			'immediate': true
		}
		, (authResult)=> {
			oauthToken = authResult.access_token;
			console.log(oauthToken);
		}
	);
}
function onApiLoad() {
	gapi.load('auth', {'callback': onAuthApiLoad});
	gapi.load('picker', {'callback': onPickerApiLoad});
}
function onAuthApiLoad() {
	gapi.auth.authorize(
		{
			'client_id': CLIENT_ID,
			'scope': SCOPES.join(' '),
			'immediate': false
		},
		(e)=>{
			console.log(e)
		});
}

function onPickerApiLoad() {
	// pickerApiLoaded = true;
	// createPicker();
}

var main:Main;
$(()=> {
	main = new Main();
});

