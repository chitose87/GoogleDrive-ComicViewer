/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/gapi/index.d.ts" />
/// <reference path="../../node_modules/vue/types/index.d.ts" />

/// <reference path="./Main.ts" />
/// <reference path="./AccountMgr.ts" />
/// <reference path="./FileListView.ts" />
/// <reference path="./Viewer.ts" />
/// <reference path="./FileData.ts" />
/// <reference path="./GapiMgr.ts" />

declare namespace gapi.client {
	export var drive:Drive;
}
declare class Drive {
	files:any;
	// get:(fileId:string, parameters:any=null)=>void;
}