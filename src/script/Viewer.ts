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

	public data:any;
	public folderID:string;
	public files:FileData[];
	private currentPage:number;
	private loadStop:()=>void;
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

	start(data:any) {
		this.data = data;
		this.files = [];

		var ldr:GapiListLoader = new GapiListLoader(true, data.id)
			.onUpdate((data:any[])=> {
				for (var i = 0; i < data.length; i++) {
					var dataEle:any = data[i];
					var li:JQuery = $("<li></li>")
						.html(dataEle.name)
						.data("data", dataEle)
						.attr("data-id", dataEle.id);
					if (dataEle.mimeType.indexOf("folder") >= 0)li.addClass("folder");
					if (dataEle.mimeType.indexOf("image") >= 0)li.addClass("image");
					ullv.append(li);
				}
				// this.sort(ullv);
			})
			.onComplete((allData:any[])=> {
				console.log("onComplete", allData);
			})
			.start();

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
		if (this.loadStop)this.loadStop();
		if (number >= this.files.length)number = this.files.length - 1;
		if (number < 0)number = 0;
		// if (number % 2 == 1)number -= 1;

		this.currentPage = number;
		this.setView(number, this.rightView);
		this.setView(number + 1, this.leftView);
	}

	private setView(index:number, view:JQuery) {
		var file:FileData = this.files[index];
		if (file) {
			if (file.isLoaded) {
				setPicture();
			} else {
				this.loadPicture(file, ()=> {
					setPicture();
					if (view == this.leftView) {
						this.loadStop = this.backGroundLoad(index + 1);
					}
				});
			}
		}
		function setPicture() {
			view.css("background-image", "url(" + file.path + ")");
		}
	}

	private toggleMenu() {
		this.ui.toggleClass("show");
	}

	private backGroundLoad(index:number):()=>void {
		var file:FileData = this.files[index];
		if (!file) {
			return;
		} else if (file.isLoaded) {
			return this.backGroundLoad(index + 1);
		} else {
			var cancael:boolean = false;
			this.loadPicture(file, ()=> {
				if (cancael)return;
				this.loadStop = this.backGroundLoad(index);
			});
			return ()=>cancael = true;
		}
	}

	private loadPicture(file:FileData, callBack:()=>void) {
		file.path = "https://lh3.google.com/u/2/d/" + file.id;
		file.img = new Image();
		file.img.onload = ()=> {
			file.isLoaded = true;
			callBack();
		};
		file.img.src = file.path;
	}
}