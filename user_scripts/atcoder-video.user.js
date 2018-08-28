// ==UserScript==
// @name           AtCoder Video
// @namespace      tatsumack
// @version        0.1.0
// @description    AtCoderコンテストページに解説放送へのリンクを追加します
// @author         tatsumack
// @license        MIT
// @supportURL     https://github.com/tatsumack/atcoder-video/issues
// @match          https://beta.atcoder.jp/contests/*
// @match          https://*.contest.atcoder.jp/*
// ==/UserScript==

(function (callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "//code.jquery.com/jquery-3.3.1.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
})(function ($) {
    const url = location.href;
    const isBeta = url.search("beta") >= 0;
    const contestName = getContestName();
    const cacheDataKey = "atcoder-video-data";
    const cacheFetchedAtKey = "atcoder-video-data-last-fetched-at";
    const cacheMin = 10;

    function onSuccess(data) {
        localStorage.setItem(cacheDataKey, JSON.stringify(data));

        let videoId = getVideoId(data);
        draw(videoId);
    }

    function getVideoId(data) {
        let contestType = "";
        if (contestName.indexOf("abc") >= 0) contestType = "Beginner";
        if (contestName.indexOf("arc") >= 0) contestType = "Regular";
        if (contestName.indexOf("agc") >= 0) contestType = "Grand";
        if (!contestType) return;

        const contestNo = contestName.substr(3, 3);

        let videoId = "";
        data.contents.forEach(function (item) {
            if (videoId) return;
            if (item.title.match(contestType + " Contest " + contestNo)) {
                videoId = item.id;
            } else if (contestType === "Regular" && item.title.match("Regular/Beginner Contest " + contestNo)) {
                videoId = item.id;
            }
        });

        return videoId;
    }

    function draw(videoId) {
        if (!videoId) return;
        if (isBeta) {
            $("#main-container ul").first().append('<li><a target="_blank" href="https://www.youtube.com/watch?v=' + videoId + '"><span class="glyphicon glyphicon-facetime-video" ></span> 解説放送</a></li>');
        } else {
            $("#outer-inner ul").first().append('<li><a target="_blank" href="https://www.youtube.com/watch?v=' + videoId + '"><i class="icon-user"></i> 解説放送</a></li>');
        }
    }

    function getContestName() {
        return isBeta ? url.split("/")[4] : url.split("/")[2].split(".")[0];
    }

    function main() {
        const data = localStorage.getItem(cacheDataKey);
        const lastFetchedAt = localStorage.getItem(cacheFetchedAtKey);
        if (data && lastFetchedAt && new Date().getTime() < Number(lastFetchedAt) + cacheMin * 60 * 1000) {
            onSuccess(JSON.parse(data));
        }
        else {
            $.ajax({
                url: "https://script.google.com/macros/s/AKfycbw1KFPgpRP9ZAVaYJCG6ZXZHAHkAhfi99HQJKcPO0iUp7pdTObM/exec",
                dataType: "json",
                type: "get",
                success: onSuccess
            });
            localStorage.setItem(cacheFetchedAtKey, new Date().getTime().toString());
        }
    }

    main();
});
