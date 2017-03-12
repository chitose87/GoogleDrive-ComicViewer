/// <reference path="./libs.d.ts" />

class Viewer {
	public jq:JQuery = $("[data-js='viewer']");
	public leftView:JQuery = this.jq.find(".left");
	public rightView:JQuery = this.jq.find(".right");
	public ui:JQuery = this.jq.find(".ui");

	public nextBtn:JQuery = this.jq.find(".nextBtn");
	public prevBtn:JQuery = this.jq.find(".prevBtn");
	public menuBtn:JQuery = this.jq.find(".menuBtn");
	public seekBar:JQuery = this.jq.find(".seekBar");
	public nov:JQuery = this.jq.find(".nov");

	public folderID:string;
	public files:FileData[];
	private currentPage:number;
	// public pageTemplate:JQuery = $("<div>" +
	// 	"<div class='left'></div>" +
	// 	"<div class='right'></div>" +
	// 	"</div>");
	// public

	constructor() {
		this.nextBtn.on("click", ()=>this.seek(this.currentPage + 2));
		this.prevBtn.on("click", ()=>this.seek(this.currentPage - 2));
		this.menuBtn.on("click", ()=>this.toggleMenu());
		this.seekBar.on("click", (e)=> {
			this.nov.css("left", e.offsetX);
			this.seek(Math.floor((1 - e.offsetX / this.seekBar.width()) * this.files.length));

		});
	}

	start(folderID:string) {
		this.folderID = folderID;
		this.files = [];

		this.read();
	}

	private read(pageToken:string = "") {
		gapi.client.drive.files.list({
			q: "'" + this.folderID + "' in parents"
			, orderBy: "name"
			, pageToken: pageToken
		}).then((e)=> {
			this.files = this.files.concat(e.result.files);
			if (e.result.nextPageToken && e.result.nextPageToken.length > 0) {
				this.read(e.result.nextPageToken)
			} else {
				this.seek(0);
			}
		});
	}

	private seek(number:number) {
		if (number >= this.files.length)number = this.files.length - 1;
		if (number < 0)number = 0;
		if (number % 2 == 1)number -= 1;

		this.currentPage = number;
		var rFile:FileData = this.files[number];
		var lFile:FileData = this.files[number + 1];
		this.setView(rFile, this.rightView);
		this.setView(lFile, this.leftView);
	}

	private setView(file:FileData, view:JQuery) {
		if (file) {
			if (file.isLoaded) {
				setPicture();
			} else {
				file.path = "https://lh3.google.com/u/2/d/" + file.id;
				var img = new Image();
				img.onload = ()=> {
					file.isLoaded = true;
					setPicture();
				};
				img.src = file.path;
				file.img = img;
			}
		}
		function setPicture() {
			view.css("background-image", "url(" + file.path + ")");
		}
	}

	private toggleMenu() {
		this.ui.toggleClass("show");
	}
}