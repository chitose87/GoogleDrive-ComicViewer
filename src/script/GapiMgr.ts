/// <reference path="./libs.d.ts" />
declare var google:any;
class GapiMgr {
}

class GapiListLoader {

	public folderID:string;
	public files:any[] = [];
	private pageToken:string = "";
	private _onUpdate:(data:any[])=>void;
	private _onComplete:(data:any[])=>void;
	private isLoop:boolean;

	constructor(isLoop:boolean, folderID:string) {
		this.isLoop = isLoop;
		this.folderID = folderID;
	}

	public onUpdate(callBack:(data:any[])=>void):GapiListLoader {
		this._onUpdate = callBack;
		return this;
	}

	public onComplete(callBack:(data:any[])=>void):GapiListLoader {
		this._onComplete = callBack;
		return this;
	}

	public start():GapiListLoader {
		this._read();
		return this;
	}

	private _read() {
		gapi.client.drive.files.list({
			q: "'" + this.folderID + "' in parents and trashed = false"
			, orderBy: "folder,name"
			, pageToken: this.pageToken
		}).then((e)=> {
			this.files = this.files.concat(e.result.files);
			if (this._onUpdate)this._onUpdate(e.result.files);
			if (e.result.nextPageToken && e.result.nextPageToken.length > 0) {
				this.pageToken = e.result.nextPageToken;
				if (this.isLoop)this._read();
			} else if (this._onComplete) {
				this._onComplete(this.files);
			}
		});
	}
}