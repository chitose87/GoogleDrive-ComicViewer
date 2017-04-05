/// <reference path="./libs.d.ts" />
var Main = (function () {
    function Main() {
        var _this = this;
        this.content = $("#content");
        this.searchText = $("[data-js='searchText']");
        this.searchBtn = $("[data-js='searchBtn']");
        this.viewer = new Viewer();
        this.fileListView = new FileListView();
        AccountMgr.init(function () { return _this.onLogin(); });
        // this.searchBtn.on("click", ()=>this.search());
    }
    Main.prototype.onLogin = function () {
        var _this = this;
        this.searchText.val("https://drive.google.com/drive/u/2/folders/0B31JYfRnUWcPN2NjQXJXd3J4T2M");
        this.fileListView
            .init()
            .onSelect(function (listData, index) {
            _this.viewer.start(listData, index);
            location.hash = "#viewer";
            // this.content.attr("data-mode", "viewer");
        });
        $(window).on("hashchange", function () {
            switch (location.hash) {
                case "#viewer":
                    _this.content.attr("data-mode", "viewer");
                    break;
                default:
                    _this.content.attr("data-mode", "");
                    location.hash = "";
            }
        }).trigger("hashchange");
    };
    Main.prototype.search = function () {
        var str = this.searchText.val();
        if (str.indexOf("drive.google.com") >= 0 && str.indexOf("folders") >= 0) {
            str = str.split("folders/")[1];
        }
        // this.viewer.start(str);
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
var FileListView = (function () {
    function FileListView() {
        var _this = this;
        this.jq = $("[data-js='fileList']");
        this.element = $("<li>" +
            "<a>" +
            // "<img />" +
            "<p class='name'></p>" +
            "</a>" +
            "</li>");
        this.jq.on("click", function (e) {
            var via = $(e.target);
            var target;
            if ((target = via.hasClass("folder") ? via : via.parent(".folder")).length) {
                // folder
                _this.setFolder(target);
            }
            else if ((target = via.hasClass("image") ? via : via.parent(".image")).length) {
                // image
                // var lv = this.refreshFolder(target) - 2;
                // var ullv = this.jq.find("[data-lv=" + lv + "]");
                //
                // var select:JQuery = ullv.find(".select");
                _this._onSelect(target.parent("ul").data("data"), target.index());
            }
        });
    }
    FileListView.prototype.onSelect = function (callBack) {
        this._onSelect = callBack;
        return this;
    };
    FileListView.prototype.init = function () {
        this.setFolder();
        return this;
    };
    FileListView.prototype.clear = function () {
    };
    // 不要ディレクトリを非表示
    FileListView.prototype.refreshFolder = function (viaElement) {
        var $ul = viaElement.parent("ul");
        var lv = parseInt($ul.data("lv")) + 1;
        var _lv = lv;
        while (true) {
            var _jq = this.jq.find("[data-lv=" + _lv + "]");
            if (_jq.length) {
                _jq.remove();
                _lv++;
            }
            else
                break;
        }
        viaElement.parent().find("li").removeClass("select");
        viaElement.addClass("select");
        return lv;
    };
    // フォルダーリストを表示
    FileListView.prototype.setFolder = function (viaElement) {
        if (viaElement === void 0) { viaElement = null; }
        console.log("setFolder", viaElement);
        var lv = 0;
        var folderID = "root";
        if (viaElement) {
            lv = this.refreshFolder(viaElement);
            folderID = viaElement.data("data").id;
        }
        var ullv = $("<ul></ul>")
            .attr("data-lv", lv);
        this.jq.append(ullv);
        var ldr = new GapiListLoader(true, folderID)
            .onUpdate(function (data) {
            ullv.data("data", data);
            for (var i = 0; i < data.length; i++) {
                var dataEle = data[i];
                var li = $("<li></li>")
                    .html(dataEle.name)
                    .data("data", dataEle)
                    .attr("data-id", dataEle.id);
                if (dataEle.mimeType.indexOf("folder") >= 0)
                    li.addClass("folder");
                if (dataEle.mimeType.indexOf("image") >= 0)
                    li.addClass("image");
                ullv.append(li);
            }
        })
            .onComplete(function (allData) {
            console.log("onComplete", allData);
        })
            .start();
    };
    return FileListView;
}());
/// <reference path="./libs.d.ts" />
var Viewer = (function () {
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
        this.nextBtn.on("click", function () { return _this.seek(_this.currentPage + (_this.isDouble ? 2 : 1)); });
        this.prevBtn.on("click", function () { return _this.seek(_this.currentPage - (_this.isDouble ? 2 : 1)); });
        this.menuBtn.on("click", function () { return _this.toggleMenu(); });
        this.seekBar.on("click", function (e) {
            _this.nov.css("left", e.offsetX);
            _this.seek(Math.floor((1 - e.offsetX / _this.seekBar.width()) * _this.files.length));
        });
        $(window).on("resize", function () { return _this.resize(); });
    }
    Viewer.prototype.resize = function () {
        var w = this.jq.width();
        var h = this.jq.height();
        this.isDouble = h < w;
        this.jq.attr("data-layout", this.isDouble ? "double" : "single");
        this.seek(this.currentPage);
    };
    Viewer.prototype.start = function (listData, index) {
        if (index === void 0) { index = 0; }
        this.listData = listData;
        this.currentPage = index;
        this.resize();
    };
    Viewer.prototype.seek = function (number) {
        if (this.loadStop)
            this.loadStop();
        if (number >= this.listData.length)
            number = this.listData.length - 1;
        if (number < 0)
            number = 0;
        // if (number % 2 == 1)number -= 1;
        this.currentPage = number;
        this.setView(number, this.rightView);
        if (this.isDouble)
            this.setView(number + 1, this.leftView);
    };
    Viewer.prototype.setView = function (index, view) {
        var _this = this;
        var file = this.listData[index];
        if (file) {
            if (file.isLoaded) {
                setPicture();
            }
            else {
                this.loadPicture(file, function () {
                    setPicture();
                    if (view == _this.leftView) {
                        _this.loadStop = _this.backGroundLoad(index + 1);
                    }
                });
            }
        }
        function setPicture() {
            view.css("background-image", "url(" + file.path + ")");
        }
    };
    Viewer.prototype.toggleMenu = function () {
        this.ui.toggleClass("show");
    };
    Viewer.prototype.backGroundLoad = function (index) {
        var _this = this;
        var file = this.listData[index];
        if (!file) {
            return;
        }
        else if (file.isLoaded) {
            return this.backGroundLoad(index + 1);
        }
        else {
            var cancael = false;
            this.loadPicture(file, function () {
                if (cancael)
                    return;
                _this.loadStop = _this.backGroundLoad(index);
            });
            return function () { return cancael = true; };
        }
    };
    Viewer.prototype.loadPicture = function (file, callBack) {
        file.path = "https://lh3.google.com/u/2/d/" + file.id;
        file.img = new Image();
        file.img.onload = function () {
            file.isLoaded = true;
            callBack();
        };
        file.img.src = file.path;
    };
    return Viewer;
}());
/// <reference path="./libs.d.ts" />
var FileData = (function () {
    function FileData() {
    }
    return FileData;
}());
/// <reference path="./libs.d.ts" />
var GapiMgr = (function () {
    function GapiMgr() {
    }
    return GapiMgr;
}());
var GapiListLoader = (function () {
    function GapiListLoader(isLoop, folderID) {
        this.files = [];
        this.pageToken = "";
        this.isLoop = isLoop;
        this.folderID = folderID;
    }
    GapiListLoader.prototype.onUpdate = function (callBack) {
        this._onUpdate = callBack;
        return this;
    };
    GapiListLoader.prototype.onComplete = function (callBack) {
        this._onComplete = callBack;
        return this;
    };
    GapiListLoader.prototype.start = function () {
        this._read();
        return this;
    };
    GapiListLoader.prototype._read = function () {
        var _this = this;
        gapi.client.drive.files.list({
            q: "'" + this.folderID + "' in parents and trashed = false",
            orderBy: "folder,name",
            pageToken: this.pageToken
        }).then(function (e) {
            _this.files = _this.files.concat(e.result.files);
            if (_this._onUpdate)
                _this._onUpdate(e.result.files);
            if (e.result.nextPageToken && e.result.nextPageToken.length > 0) {
                _this.pageToken = e.result.nextPageToken;
                if (_this.isLoop)
                    _this._read();
            }
            else if (_this._onComplete) {
                _this._onComplete(_this.files);
            }
        });
    };
    return GapiListLoader;
}());
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
//# sourceMappingURL=index.js.map