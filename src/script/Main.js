/// <reference path="./libs.d.ts" />
var Main = (function () {
    function Main() {
        // Googleから取得したOAuth 2.0 のClient ID
        var CLIENT_ID = "902347479823-4rleemh315kaedsq8oc9vqegro999b32.apps.googleusercontent.com";
        // client_secret="KrAWzmSybojG5ZpSBtM1Olmc"
        // 認証時にリクエストする機能の範囲
        var SCOPES = ['https://www.googleapis.com/auth/drive'];
        var oauthToken;
        console.log("gapi.auth.authorize");
        gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        }, function (authResult) {
            oauthToken = authResult.access_token;
            console.log(oauthToken);
        });
    }
    return Main;
}());
$(function () {
    new Main();
});
//# sourceMappingURL=Main.js.map