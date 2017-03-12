/// <reference path="./libs.d.ts" />
var Main = (function () {
    function Main() {
        var _this = this;
        this.searchText = $("[data-js='searchText']");
        this.searchBtn = $("[data-js='searchBtn']");
        this.viewer = new Viewer();
        this.fileListView = new FileListView();
        AccountMgr.init(function () { return _this.onLogin(); });
        this.searchBtn.on("click", function () { return _this.search(); });
    }
    Main.prototype.onLogin = function () {
        this.searchText.val("https://drive.google.com/drive/u/2/folders/0B31JYfRnUWcPN2NjQXJXd3J4T2M");
        // console.log("onLogin", gapi.client);
        //https://drive.google.com/drive/u/2/folders/0B31JYfRnUWcPN2NjQXJXd3J4T2M
        // gapi.client.drive.files.get({
        // 	fileId: "0B31JYfRnUWcPN2NjQXJXd3J4T2M"
        // }).then((e)=> {
        // 	console.log(e);
        // })
    };
    Main.prototype.search = function () {
        var str = this.searchText.val();
        if (str.indexOf("drive.google.com") >= 0 && str.indexOf("folders") >= 0) {
            str = str.split("folders/")[1];
        }
        this.viewer.start(str);
        // this.fileListView.clear();
    };
    Main.prototype.show = function (e) {
        var files = e.result.files;
        var nextPageToken = e.result.nextPageToken;
        this.fileListView.add(files);
        console.log();
    };
    return Main;
}());
// function onApiLoad() {
//
// }
var main;
$(function () {
    console.log("v0.1");
    main = new Main();
});
/// <reference path="./libs.d.ts" />
var AccountMgr = (function () {
    function AccountMgr() {
    }
    AccountMgr.init = function (onLogin) {
        AccountMgr.onLogin = onLogin;
        gapi.load('auth', { 'callback': AccountMgr.onAuthApiLoad });
    };
    AccountMgr.onAuthApiLoad = function () {
        gapi.auth.authorize({
            'client_id': AccountMgr.CLIENT_ID,
            'scope': AccountMgr.SCOPES.join(' '),
            'immediate': false,
            "authuser": -1
        }, AccountMgr.handleAuthResult);
    };
    AccountMgr.handleAuthResult = function (e) {
        console.log(e);
        if (e && !e.error) {
            AccountMgr.oauthToken = e.access_token;
            gapi.load('client:auth2', AccountMgr.initClient);
        }
    };
    AccountMgr.initClient = function (e) {
        console.log("initClient", e);
        gapi.client["init"]({
            discoveryDocs: AccountMgr.DISCOVERY_DOCS
        }).then(function (e) {
            console.log(e);
            AccountMgr.onLogin();
            // listFiles();
            // AccountMgr.getRoot();
        });
    };
    AccountMgr.getRoot = function (e) {
        console.log("getRoot", e);
        gapi.client["drive"].files.get({
            fileId: 'root'
        }).then(function (response) {
            console.log(response);
            AccountMgr.appendPre('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    AccountMgr.appendPre(file.name + ' (' + file.id + ')');
                }
            }
            else {
                AccountMgr.appendPre('No files found.');
            }
        });
    };
    AccountMgr.listFiles = function () {
        console.log("listFiles");
        gapi.client["drive"].files.list({
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name)"
        }).then(function (response) {
            AccountMgr.appendPre('Files:');
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    AccountMgr.appendPre(file.name + ' (' + file.id + ')');
                }
            }
            else {
                AccountMgr.appendPre('No files found.');
            }
        });
    };
    AccountMgr.appendPre = function (message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    };
    AccountMgr.CLIENT_ID = "902347479823-4rleemh315kaedsq8oc9vqegro999b32.apps.googleusercontent.com";
    AccountMgr.SCOPES = ['https://www.googleapis.com/auth/drive'];
    AccountMgr.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    return AccountMgr;
}());
/// <reference path="./libs.d.ts" />
var FileListView = (function () {
    function FileListView() {
        this.jq = $("[data-js='fileList']");
        this.element = $("<li>" +
            "<a>" +
            // "<img />" +
            "<p class='name'></p>" +
            "</a>" +
            "</li>");
        // this.element.append()
    }
    FileListView.prototype.clear = function () {
    };
    FileListView.prototype.add = function (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var element = this.element.clone();
            element.data("id", file.id);
            element.data("mimeType", file.mimeType);
            element.find(".name").html(file.name);
            // element.find("img").attr("src", );
            this.jq.append(element);
        }
    };
    return FileListView;
}());
/// <reference path="./libs.d.ts" />
var FileData = (function () {
    function FileData() {
    }
    return FileData;
}());
/// <reference path="./libs.d.ts" />
var Viewer = (function () {
    // public pageTemplate:JQuery = $("<div>" +
    // 	"<div class='left'></div>" +
    // 	"<div class='right'></div>" +
    // 	"</div>");
    // public
    function Viewer() {
        var _this = this;
        this.jq = $("[data-js='viewer']");
        this.leftView = this.jq.find(".left");
        this.rightView = this.jq.find(".right");
        this.ui = this.jq.find(".ui");
        this.nextBtn = this.jq.find(".nextBtn");
        this.prevBtn = this.jq.find(".prevBtn");
        this.menuBtn = this.jq.find(".menuBtn");
        this.seekBar = this.jq.find(".seekBar");
        this.nov = this.jq.find(".nov");
        this.nextBtn.on("click", function () { return _this.seek(_this.currentPage + 2); });
        this.prevBtn.on("click", function () { return _this.seek(_this.currentPage - 2); });
        this.menuBtn.on("click", function () { return _this.toggleMenu(); });
        this.seekBar.on("click", function (e) {
            _this.nov.css("left", e.offsetX);
            _this.seek(Math.floor((1 - e.offsetX / _this.seekBar.width()) * _this.files.length));
        });
    }
    Viewer.prototype.start = function (folderID) {
        this.folderID = folderID;
        this.files = [];
        this.read();
    };
    Viewer.prototype.read = function (pageToken) {
        var _this = this;
        if (pageToken === void 0) { pageToken = ""; }
        gapi.client.drive.files.list({
            q: "'" + this.folderID + "' in parents",
            orderBy: "name",
            pageToken: pageToken
        }).then(function (e) {
            _this.files = _this.files.concat(e.result.files);
            if (e.result.nextPageToken && e.result.nextPageToken.length > 0) {
                _this.read(e.result.nextPageToken);
            }
            else {
                _this.seek(0);
            }
        });
    };
    Viewer.prototype.seek = function (number) {
        if (number >= this.files.length)
            number = this.files.length - 1;
        if (number < 0)
            number = 0;
        if (number % 2 == 1)
            number -= 1;
        this.currentPage = number;
        var rFile = this.files[number];
        var lFile = this.files[number + 1];
        this.setView(rFile, this.rightView);
        this.setView(lFile, this.leftView);
    };
    Viewer.prototype.setView = function (file, view) {
        if (file) {
            if (file.isLoaded) {
                setPicture();
            }
            else {
                file.path = "https://lh3.google.com/u/2/d/" + file.id;
                var img = new Image();
                img.onload = function () {
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
    };
    Viewer.prototype.toggleMenu = function () {
        this.ui.toggleClass("show");
    };
    return Viewer;
}());
//# sourceMappingURL=index.js.map