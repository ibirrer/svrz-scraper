/*jslint node: true */
"use strict";

var isNode = require('detect-node');

function scrape($, doc) {
    var rows = $(doc).find('table.tx_clicsvws_pi1_mainTableGroupResultsTable tr');
    if (!rows || rows.length < 2) {
        console.log(rows);
        throw ("failed to scrape league");
    }

    var games = rows
        .slice(1) // skip table header
        .map(function() { // map rows to document
            var cols = $(this).children();
            return {
                id: +cols.eq(1).text(),
                team: cols.eq(3).text(),
                teamId: +extractTeamIdFromLink(cols.eq(3).find('a').attr("href")),
                date: convertDate(cols.eq(0).text().slice(0, 8)),
                time: cols.eq(0).text().slice(9),
                opponent: cols.eq(5).text(),
                opponentId: +extractTeamIdFromLink(cols.eq(5).find('a').attr("href")),
                result: convertResult(cols.eq(6).text())
            };
        }).get();

    var leagueId;
    var selector = 'table.tx_clicsvws_pi1_mainTableGroupRankingTable > tbody > tr';
    if (isNode) {
        selector = 'table.tx_clicsvws_pi1_mainTableGroupRankingTable > tr';
    }

    var ranking = $(doc).find(selector)
        .slice(1) // skip table header
        .map(function() {
            var cols = $(this).children();
            leagueId = cols.eq(1).html().match(/group_ID=(([0-9])*)/)[1];
            return {
                rank: +cols.eq(0).text(),
                team: cols.eq(1).text(),
                games: +cols.eq(2).text(),
                ballquotient: parseFloat(cols.eq(6).text()),
                points: +cols.eq(7).text()
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

// Converts a date from '02.10.13' to '20130302'
function convertDate(date) {
    var p = date.split('.');
    return '20' + p[2] + p[1] + p[0];
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

module.exports = {
    scrape: scrape,
    urlFromLeagueId: urlFromLeagueId
};
