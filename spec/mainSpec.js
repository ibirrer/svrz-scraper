/*jslint node: true, jasmine: true */
"use strict";

var scraper = require("../main.js");

describe("scrape", function() {
    it("normal", function(done) {

        scraper.scrape("9170", function(err, schedule) {
            expect(err).toBe(null);
            expect(schedule.leagueId).toBe("9170");
            expect(schedule.ranking[0].rank).toBe(1);
            done();
        });
    });
});
