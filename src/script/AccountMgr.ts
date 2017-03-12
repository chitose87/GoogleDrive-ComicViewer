/// <reference path="./libs.d.ts" />

declare var google:any;
class AccountMgr {

	static CLIENT_ID = "902347479823-4rleemh315kaedsq8oc9vqegro999b32.apps.googleusercontent.com";
	static SCOPES = ['https://www.googleapis.com/auth/drive'];
	static DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
	static oauthToken;
	static onLogin:()=>void;

	static init(onLogin:()=>void) {
		AccountMgr.onLogin = onLogin;
		gapi.load('auth', {'callback': AccountMgr.onAuthApiLoad});
	}

	private static onAuthApiLoad() {
		gapi.auth.authorize(
			{
				'client_id': AccountMgr.CLIENT_ID
				, 'scope': AccountMgr.SCOPES.join(' ')
				, 'immediate': false
				, "authuser": -1
			},
			AccountMgr.handleAuthResult);
	}

	private static handleAuthResult(e) {
		console.log(e);
		if (e && !e.error) {
			AccountMgr.oauthToken = e.access_token;
			gapi.load('client:auth2', AccountMgr.initClient);
		}
	}

	private static initClient(e) {
		console.log("initClient",e);
		gapi.client["init"]({
			discoveryDocs: AccountMgr.DISCOVERY_DOCS
			// clientId: CLIENT_ID,
			// scope: SCOPES.join(' ')
		}).then((e)=> {

			console.log(e);
			AccountMgr.onLogin();

			// listFiles();
			// AccountMgr.getRoot();
		});
	}

	private static getRoot(e) {
		console.log("getRoot",e);
		gapi.client["drive"].files.get({
			fileId: 'root'
		}).then((response)=> {
			console.log(response)
			AccountMgr.appendPre('Files:');
			var files = response.result.files;
			if (files && files.length > 0) {
				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					AccountMgr.appendPre(file.name + ' (' + file.id + ')');
				}
			} else {
				AccountMgr.appendPre('No files found.');
			}
		});
	}


	private static listFiles() {
		console.log("listFiles");
		gapi.client["drive"].files.list({
			'pageSize': 10,
			'fields': "nextPageToken, files(id, name)"
		}).then((response)=> {
			AccountMgr.appendPre('Files:');
			var files = response.result.files;
			if (files && files.length > 0) {
				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					AccountMgr.appendPre(file.name + ' (' + file.id + ')');
				}
			} else {
				AccountMgr.appendPre('No files found.');
			}
		});
	}

	private static appendPre(message) {
		var pre = document.getElementById('content');
		var textContent = document.createTextNode(message + '\n');
		pre.appendChild(textContent);
	}
}


