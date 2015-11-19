/*jslint node: true, jasmine: true, esnext: true */
"use strict";

var scraper = require("../index.js");
var fs = require("fs");

describe("scrape", function() {
    it("normal", function() {
        var html = fs.readFileSync("spec/razfaz.html", {
            encoding: "utf8"
        });

        var scraped = scraper.scrape(html);

        expect(scraped.ranking.map(x => x.rank)).toEqual([1, 2, 3, 4, 5]);
        expect(scraped.ranking[3].team).toBe("Raz Faz");
        expect(scraped.ranking[3].games).toBe(3);
        expect(scraped.ranking[3].ballquotient).toBe(0.95);
        expect(scraped.ranking[3].points).toBe(3);

        expect(scraped.games[0].id).toBe(113191);
        expect(scraped.games[0].team).toBe("Raz Faz");
        expect(scraped.games[0].teamId).toBe(25649);
        expect(scraped.games[0].date).toBe("20151020");
        expect(scraped.games[0].time).toBe("20:15");
        expect(scraped.games[0].opponent).toBe("Pläuschler Einsiedeln");
        expect(scraped.games[0].opponentId).toBe(25745);
        expect(scraped.games[0].result).toEqual({
            home: 3,
            away: 0
        });
    });
});