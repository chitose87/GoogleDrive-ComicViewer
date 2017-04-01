/// <reference path="./libs.d.ts" />

class FileListView {
	public jq:JQuery = $("[data-js='fileList']");
	public element:JQuery = $("<li>" +
		"<a>" +
		// "<img />" +
		"<p class='name'></p>" +
		"</a>" +
		"</li>");

	private _onSelect:(parentData:any, targetData:any)=>void;

	constructor() {

		this.jq.on("click", (e)=> {
			var via:JQuery = $(e.target);
			var target:JQuery;

			if ((target = via.hasClass("folder") ? via : via.parent(".folder")).length) {
				// folder
				this.setFolder(target);
			} else if ((target = via.hasClass("image") ? via : via.parent(".image")).length) {
				// image
				// var lv = this.refreshFolder(target) - 2;
				// var ullv = this.jq.find("[data-lv=" + lv + "]");
				//
				// var select:JQuery = ullv.find(".select");
				this._onSelect(target.parent("ul").data("data"), target.data("data"));
			}
		})
	}

	init():FileListView {
		this.setFolder();
		return this;
	}

	onSelect(callBack:(data:any)=>void):FileListView {
		this._onSelect = callBack;
		return this;
	}

	clear() {

	}

	//
	private refreshFolder(viaElement:JQuery):number {
		var $ul:JQuery = viaElement.parent("ul");
		var lv = parseInt($ul.data("lv")) + 1;
		var _lv = lv;
		while (true) {
			var _jq = this.jq.find("[data-lv=" + _lv + "]");
			if (_jq.length) {
				_jq.remove();
				_lv++;
			} else break;
		}
		viaElement.parent().find("li").removeClass("select");
		viaElement.addClass("select");
		return lv;
	}

	// フォルダーリストを表示
	private setFolder(viaElement:JQuery = null) {
		console.log("setFolder", viaElement);
		var lv = 0;
		var folderID:string = "root";
		if (viaElement) {
			lv = this.refreshFolder(viaElement);
			folderID = viaElement.data("data").id;
		}

		var ullv:JQuery = $("<ul></ul>").attr("data-lv", lv);
		this.jq.append(ullv);

		var ldr:GapiListLoader = new GapiListLoader(true, folderID)
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
	}

	// ソート　フォルダ＆名前
	// private sort(targetList:JQuery) {
	// 	var $items:JQuery = targetList.find("li");
	// 	$items.sort(function (a, b) {
	// 		if (a.innerHTML < b.innerHTML) return -1;
	// 		if (a.innerHTML > b.innerHTML) return 1;
	// 		return 0;
	// 	});
	// 	var folders:any[] = [];
	// 	var images:any[] = [];
	// 	var files:any[] = [];
	// 	$items.each((index, elem)=> {
	// 		if ($(elem).hasClass("folder")) {
	// 			folders.push(elem);
	// 		} else if ($(elem).hasClass("image")) {
	// 			images.push(elem);
	// 		} else {
	// 			files.push(elem);
	// 		}
	// 	});
	//
	// 	// targetList.empty();
	// 	files = folders.concat(images).concat(files);
	// 	for (var i = 0; i < files.length; i++) {
	// 		targetList.append(files[i]);
	// 	}
	// }
}