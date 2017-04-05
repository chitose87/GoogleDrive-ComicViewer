/// <reference path="./libs.d.ts" />

class Viewer {
    public jq: JQuery = $("[data-js='viewer']");
    public leftView: JQuery = this.jq.find(".left");
    public rightView: JQuery = this.jq.find(".right");
    public ui: JQuery = this.jq.find(".ui");

    public nextBtn: JQuery = this.jq.find(".nextBtn");
    public prevBtn: JQuery = this.jq.find(".prevBtn");
    public menuBtn: JQuery = this.jq.find(".menuBtn");
    public seekBar: JQuery = this.jq.find(".seekBar");
    public nov: JQuery = this.jq.find(".nov");

    public isDouble: boolean;
    public data: any;
    public listData: any;
    private currentPage: number;
    private loadStop: () => void;

    constructor() {
        this.nextBtn.on("click", () => this.seek(this.currentPage + (this.isDouble ? 2 : 1)));
        this.prevBtn.on("click", () => this.seek(this.currentPage - (this.isDouble ? 2 : 1)));
        this.menuBtn.on("click", () => this.toggleMenu());
        this.seekBar.on("click", (e) => {
            this.nov.css("left", e.offsetX);
            this.seek(Math.floor((1 - e.offsetX / this.seekBar.width()) * this.listData.length));
        });

        $(window).on("resize", () => this.resize());
    }

    private resize() {
        var w: number = this.jq.width();
        var h: number = this.jq.height();
        this.isDouble = h < w;
        this.jq.attr("data-layout", this.isDouble ? "double" : "single");

        this.seek(this.currentPage);
    }

    start(listData: any, index: number = 0) {
        this.listData = listData;
        this.currentPage = index;
        this.resize();
    }

    private seek(number: number) {
        if (this.loadStop) this.loadStop();
        if (number >= this.listData.length) number = this.listData.length - 1;
        if (number < 0) number = 0;
        // if (number % 2 == 1)number -= 1;

        this.currentPage = number;
        this.setView(number, this.rightView);
        if (this.isDouble) this.setView(number + 1, this.leftView);
    }

    private setView(index: number, view: JQuery) {
        var file: FileData = this.listData[index];
        if (file) {
            if (file.isLoaded) {
                setPicture();
            } else {
                this.loadPicture(file, () => {
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

    private backGroundLoad(index: number): () => void {
        var file: FileData = this.listData[index];
        if (!file) {
            return;
        } else if (file.isLoaded) {
            return this.backGroundLoad(index + 1);
        } else {
            var cancael: boolean = false;
            this.loadPicture(file, () => {
                if (cancael)return;
                this.loadStop = this.backGroundLoad(index);
            });
            return () => cancael = true;
        }
    }

    private loadPicture(file: FileData, callBack: () => void) {
        file.path = "https://lh3.google.com/u/2/d/" + file.id;
        file.img = new Image();
        file.img.onload = () => {
            file.isLoaded = true;
            callBack();
        };
        file.img.src = file.path;
    }


}