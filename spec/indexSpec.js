/*jslint node: true, jasmine: true, esnext: true */
"use strict";

var fs = require("fs");
var cheerio = require("cheerio");

var scraper = require("../index.js");

describe("scrape", function () {
    it("overview page", function () {

        var overviewPage = fs.readFileSync("spec/razfaz.html", {
            encoding: "utf8"
        });

        var $ = cheerio.load(overviewPage);
        var scraped = scraper.scrape($, $('body'));

        expect(scraped.leagueId).toBe("9446");

        expect(scraped.ranking.map(x => x.rank)).toEqual([1, 2, 3, 4, 5]);
        expect(scraped.ranking[3].team).toBe("Raz Faz");
        expect(scraped.ranking[3].teamId).toBe(25649);
        expect(scraped.ranking[3].games).toBe(3);
        expect(scraped.ranking[3].ballquotient).toBe(0.95);
        expect(scraped.ranking[3].points).toBe(3);

        expect(scraped.games[0].id).toBe(113191);
        expect(scraped.games[0].team).toBe("Raz Faz");
        expect(scraped.games[0].teamId).toBe(25649);
        expect(scraped.games[0].datetime).toBe("2015-10-02T20:15:00Z");
        expect(scraped.games[0].opponent).toBe("Pläuschler Einsiedeln");
        expect(scraped.games[0].opponentId).toBe(25745);
        expect(scraped.games[0].result).toEqual({
            home: 3,
            away: 0
        });
        expect(scraped.games[0].setsResults).toBeNull();
        expect(scraped.games[0].gym).toBeNull();
    });

    it("detail page", function () {
        var detailPage = fs.readFileSync("spec/razfaz-detail.html", {
            encoding: "utf8"
        });

        var $ = cheerio.load(detailPage);
        var game = scraper.scrapeDetail($, $('body'));

        expect(game.gameId).toBe(113191);

        expect(game.setsResults).toEqual({
            home: [25, 25, 26],
            away: [22, 19, 24]
        });

        expect(game.gym).toEqual({
            name: "Turnhaus an der Egg, Zürich",
            map: "http://maps.google.ch/?daddr=Kilchbergstrasse+34+8038+Z%C3%BCrich"
        });
    });

    it("detail page no result", function () {
        var detailPage = fs.readFileSync("spec/razfaz-detail-noresult.html", {
            encoding: "utf8"
        });

        var $ = cheerio.load(detailPage);
        var game = scraper.scrapeDetail($, $('body'));

        expect(game.gameId).toBe(113201);

        expect(game.setsResults).toBeNull();

        expect(game.gym).toEqual({
            name: "Turnhalle Gross, Gross",
            map: "http://maps.google.ch/?daddr=Neumattstrasse+10+8841+Gross"
        });
    });
});
