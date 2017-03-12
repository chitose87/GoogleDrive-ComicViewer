/// <reference path="./libs.d.ts" />

class FileListView {
	public jq:JQuery = $("[data-js='fileList']");
	public element:JQuery = $("<li>" +
		"<a>" +
		// "<img />" +
		"<p class='name'></p>" +
		"</a>" +
		"</li>");

	constructor() {
		// this.element.append()
	}

	clear() {

	}

	add(files:any[]) {
		for (var i = 0; i < files.length; i++) {
			var file:any = files[i];
			var element:JQuery = this.element.clone();
			element.data("id", file.id);
			element.data("mimeType", file.mimeType);
			element.find(".name").html(file.name);
			// element.find("img").attr("src", );

			this.jq.append(element);
		}
	}

}