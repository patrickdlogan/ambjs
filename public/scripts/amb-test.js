// # AMBJS - A variation of John McCarthy's AMB operator.
//
// Copyright (C) 2011 Patrick Logan
//
// Distributed under the terms of the GNU LESSER GENERAL PUBLIC LICENSE, Version 3.
//
// See the README, COPYING, and COPYING.LESSER files in this distribution.
//
// This file provides examples as qunit tests.  Visiting the file
// ambjs/public/test.html should be sufficient for running the tests
// in a browser.
//
// The script test.sh will run the qunit tests in a shell if phantomjs
// is installed.
$(document).ready(function() {

    // This is a simple use of the identity function in order to have AMB
    // return one of the given choices nondeterministically.
    test("ambiguously selecting a value", function() {
	var n = amb([1, 2, 3, 4, 5], _.identity, null);
	ok(_.include([1, 2, 3, 4, 5], n), "AMB should choose one of the given values: " + n);
    });

    // Given no choices AMB will fail without ever invoking the given
    // function.
    test("no choices always fails", function() {
	var n = amb([], _.identity, null);
	equal(null, n, "AMB should always fail when given no choices.");
    });

    // Nested applications of AMB can be used to search for successful
    // permutations of choices. 
    //
    // In this case "failure" is a misnomer. Each of the failure
    // functions will be called once per choice in order to backtrack
    // through each of the nested choices.
    test("find the sums of pairs less than 10", function() {
	var results = [];
	amb([1, 3, 5], function(x, failOuter) {
	    amb([7, 8, 9], function(y, failInner) {
		if (x + y < 10) {
		    results.push({"x":x, "y":y});
		}
		return failInner();
	    }, null);
	    return failOuter();
	}, null);
	equal(results.length, 2, "AMB should find two successful pairs.");
	ok(results[0].x + results[0].y < 10, "The first pair should be less than 10.");
	ok(results[1].x + results[1].y < 10, "The other pair should be less than 10.");
    });

    // This is a helper function for the next test. This returns true
    // if the last character of the first string is equal to the first
    // character of the second string.
    function adjacent(str1, str2) {
	return _.isString(str1) && _.isString(str2) &&
	    str1.length > 0 && str2.length > 0 &&
	    str1[str1.length - 1] == str2[0];
    }

    // Four nested applications of AMB are used to find all
    // permutations of adjacent sequences. A successful sequence is
    // where a string from the first array of choices is adjecent to a
    // string from the second array of choices. And so on for all four
    // arrays of choices.
    //
    // This is another case where "failure" is a misnomer. Each of the
    // failure functions will be called once per choice in order to
    // backtrack through each of the nested choices.
    test("find adjacent strings", function() {
    	var results = [];
    	amb(["the", "that", "a"], function(s1, fail1) {
    	    amb(["frog", "elephant", "thing"], function(s2, fail2) {
    		if (!adjacent(s1, s2)) {
    		    return fail2();
    		}
    		amb(["walked", "treaded", "grows"], function(s3, fail3) {
    		    if (!adjacent(s2, s3)) {
    			return fail3();
    		    }
    		    amb(["slowly", "quickly", "dreadfully"], function(s4, fail4) {
    			if (adjacent(s3, s4)) {
    			    results.push([s1, s2, s3, s4]);
    			}
			return fail4();
    		    });
    		});
    	    });
    	    return fail1();
    	});
	// Note the utility of higher-order functions.
	function deepEqualOrFail(sequence) {
	    return function(i, fail) {
		if (_.isEqual(sequence, results[i])) {
		    return true;
		} else {
		    return fail();
		}
	    }
	}
	equal(results.length, 2, "AMB should find one sequence of adjacent strings.");
	// Note the utility of AMB in writing test assertions.
	ok(amb([0, 1], deepEqualOrFail(["that", "thing", "grows", "slowly"]),         false));
	ok(amb([0, 1], deepEqualOrFail(["the", "elephant", "treaded", "dreadfully"]), false));
    });

});
