// # AMBJS - A variation of John McCarthy's AMB operator.
//
// Copyright (C) 2011 Patrick Logan
//
// Distributed under the terms of the GNU LESSER GENERAL PUBLIC LICENSE, Version 3.
//
// See the README, COPYING, and COPYING.LESSER files in this distribution.
//
// * "choices" is an array of values.
// * "fn" is a function of two arguments, one of the choices and a function to call if that choice fails.
// * "failure_result" is a value for AMB to return if all choices fail (or if the choices array is empty).
//
// AMB selects one of the choices nondeterministically and applies
// that to the given function along with a "fail" function.
//
// If the function succeeds with the choice then it should return the
// value it computes for that choice. AMB will then return this result
// to its caller.
//
// If the function fails with the choice then should return the result
// of calling the failure function with no arguments.
function amb(choices, fn, failure_result) {
    var cs = choices.slice();
    var fail_token = {};
    var fail = function() { return fail_token; }
    while (cs.length > 0) {
	var c = randomChoice(cs);
	var r = fn(c, fail);
	if (r === fail_token) {
	    cs = _.without(cs, c);
	} else {
	    return r;
	}
    }
    return failure_result;
}

function randomIntegerBetween(min_inclusive, max_exclusive) {
    return Math.floor(Math.random() * (max_exclusive - min_inclusive)) + min_inclusive;
}

function randomChoice(choices) {
    var i = randomIntegerBetween(0, choices.length);
    return choices[i];
}
