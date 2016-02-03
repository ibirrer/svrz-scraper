/*jslint node: true */
"use strict";

var isNode = require('detect-node');

function scrapeDetail($, doc) {
    var gameId = +$(doc).find('table.tx_clicsvws_pi1_mainTableGroup:nth-child(8) tr:nth-child(1) > td:nth-child(2)')
        .text();


    var setsResult = null;
    var setsRow = $(doc).find('table.tx_clicsvws_pi1_mainTableGroup:nth-child(8) tr:nth-child(11) > td:nth-child(2)');
    if (setsRow.text() !== "") {
        var setsRowSplitted = zip(setsRow.text()
            .split(" ")
            .map(function (x) { return x.split(":") })
            );

        setsResult = {
            home: setsRowSplitted[0].map(toInt),
            away: setsRowSplitted[1].map(toInt)
        }
    }

    var gymName = $(doc).find('table.tx_clicsvws_pi1_mainTableGroup:nth-child(8) tr:nth-child(7) > td:nth-child(2) > a:nth-child(1)')
        .text();

    var map = $(doc).find('table.tx_clicsvws_pi1_mainTableGroup:nth-child(8) tr:nth-child(7) > td:nth-child(2) > a:nth-child(3)')
        .attr("href");

    // if gym map is not available on sportstätten.ch, the google maps link is on second position
    if (!map) {
        map = $(doc).find('table.tx_clicsvws_pi1_mainTableGroup:nth-child(8) tr:nth-child(7) > td:nth-child(2) > a:nth-child(2)')
            .attr("href");
    }


    return {
        gameId: gameId,
        setsResults: setsResult,
        gym: {
            name: gymName,
            map: map
        }
    };
};

function scrape($, doc) {
    var rows = $(doc).find('table.tx_clicsvws_pi1_mainTableGroupResultsTable tr');
    if (!rows || rows.length < 2) {
        console.log(rows);
        throw ("failed to scrape league");
    }

    var games = rows
        .slice(1) // skip table header
        .map(function () { // map rows to document
            var cols = $(this).children();
            return {
                id: +cols.eq(1).text(),
                team: cols.eq(3).text(),
                teamId: +extractTeamIdFromLink(cols.eq(3).find('a').attr("href")),
                datetime: convertDate(cols.eq(0).text().slice(0, 8)) + "T" + cols.eq(0).text().slice(9) + ":00Z",
                opponent: cols.eq(5).text(),
                opponentId: +extractTeamIdFromLink(cols.eq(5).find('a').attr("href")),
                result: convertResult(cols.eq(6).text()),
                setsResults: null,
                gym: null
            };
        }).get();

    var leagueId;
    var selector = 'table.tx_clicsvws_pi1_mainTableGroupRankingTable > tbody > tr';
    if (isNode) {
        selector = 'table.tx_clicsvws_pi1_mainTableGroupRankingTable > tr';
    }

    var ranking = $(doc).find(selector)
        .slice(1) // skip table header
        .map(function () {
            var cols = $(this).children();
            leagueId = cols.eq(1).html().match(/group_ID=(([0-9])*)/)[1];
            return {
                rank: +cols.eq(0).text(),
                team: cols.eq(1).text(),
                teamId: +extractTeamIdFromLink(cols.eq(1).find('a').attr("href")),
                games: +cols.eq(2).text(),
                ballquotient: parseFloat(cols.eq(6).text()),
                points: +cols.eq(7).text(),
            };
        }).get();

    return {
        'leagueId': leagueId,
        'games': games,
        'ranking': ranking
    };
}

function urlFromLeagueId(leagueId) {
    return "http://www.svrz.ch/index.php?id=73&nextPage=1&group_ID=" + leagueId;
}

// Converts a date from '02.10.13' to '2013-03-02'
function convertDate(date) {
    var p = date.split('.');
    return '20' + p[2] + "-" + pad(p[1]) + "-" + pad(p[0]);
}

function pad(num) {
    var s = "000000000" + num;
    return s.substr(s.length - 2);
}

// Converts a result from '3:1' to { home: 3, away: 1 }. Converts to null if result is empty
function convertResult(result) {
    if (!result) {
        return null;
    }
    var p = result.split(":");
    return {
        home: +p[0],
        away: +p[1]
    };
}

// Extracts the teamId from a link like '/index.php?id=73&nextPage=2&group_ID=7806&team_ID=22069'
function extractTeamIdFromLink(link) {
    return /team_ID=([0-9]{5})/.exec(link)[1];
}

function toInt(x) {
    return +x;
}

// form http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
function zip(arrays) {
    return arrays[0].map(function (_, i) {
        return arrays.map(function (array) { return array[i] })
    });
}

module.exports = {
    scrape: scrape,
    scrapeDetail: scrapeDetail,
    urlFromLeagueId: urlFromLeagueId
};
