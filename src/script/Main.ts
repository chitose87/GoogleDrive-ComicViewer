/// <reference path="./libs.d.ts" />

class Main {
	public searchText:JQuery = $("[data-js='searchText']");
	public searchBtn:JQuery = $("[data-js='searchBtn']");
	public viewer:Viewer = new Viewer();
	public fileListView:FileListView = new FileListView();

	constructor() {
		AccountMgr.init(()=>this.onLogin());

		this.searchBtn.on("click", ()=>this.search());
	}

	public onLogin() {
		this.searchText.val("https://drive.google.com/drive/u/2/folders/0B31JYfRnUWcPN2NjQXJXd3J4T2M");
		// console.log("onLogin", gapi.client);
		//https://drive.google.com/drive/u/2/folders/0B31JYfRnUWcPN2NjQXJXd3J4T2M
		// gapi.client.drive.files.get({
		// 	fileId: "0B31JYfRnUWcPN2NjQXJXd3J4T2M"
		// }).then((e)=> {
		// 	console.log(e);
		// })
	}

	private search() {
		var str:string = this.searchText.val();
		if (str.indexOf("drive.google.com") >= 0 && str.indexOf("folders") >= 0) {
			str = str.split("folders/")[1];
		}

		this.viewer.start(str);

		// this.fileListView.clear();
	}

	private show(e:any) {
		var files:any[] = e.result.files;
		var nextPageToken:string = e.result.nextPageToken;

		this.fileListView.add(files);

		console.log();
	}
}
// function onApiLoad() {
//
// }

var main:Main;
$(()=> {
	console.log("v0.1");
	main = new Main();
});