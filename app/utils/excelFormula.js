/* Based on 
 * - EGM Mathematical Finance class by Enrique Garcia M. <egarcia@egm.co>
 * - A Guide to the PMT, FV, IPMT and PPMT Functions by Kevin (aka MWVisa1)
 */
const DATE = require("./date");
const UNIT_DAYS = 1;


module.exports.XIRR = function (values, dates, guess) {
	// Credits: algorithm inspired by Apache OpenOffice

	// Calculates the resulting amount
	var irrResult = function (values, dates, rate) {
		var r = rate + 1;
		var result = values[0];
		for (var i = 1; i < values.length; i++) {
			result += values[i] / Math.pow(r, DATE.diffInDays(dates[i], dates[0]) / UNIT_DAYS);
			// console.log('irrResult', r, DATE.diffInDays(dates[i], dates[0]));
		}
		// console.log('irrResult', result);
		return result;
	}

	// Calculates the first derivation
	var irrResultDeriv = function (values, dates, rate) {
		var r = rate + 1;
		var result = 0;
		for (var i = 1; i < values.length; i++) {
			var frac = DATE.diffInDays(dates[i], dates[0]) / UNIT_DAYS;
			result -= frac * values[i] / Math.pow(r, frac + 1);
			// console.log('irrResultDeriv', r, frac + 1);
		}
		// console.log('irrResultDeriv', result);
		return result;
	}

	// Check that values contains at least one positive value and one negative value
	var positive = false;
	var negative = false;
	for (var i = 0; i < values.length; i++) {
		if (values[i] > 0) positive = true;
		if (values[i] < 0) negative = true;
	}

	// Return error if values does not contain at least one positive value and one negative value
	if (!positive || !negative) return '#NUM!';

	// Initialize guess and resultRate
	var guess = (typeof guess === 'undefined') ? -0.1 : guess;
	var resultRate = guess;

	// Set maximum epsilon for end of iteration
	var epsMax = 1e-6;

	// Set maximum number of iterations
	var iterMax = 50;

	// Implement Newton's method
	var newRate, epsRate, resultValue;
	var iteration = 0;
	var contLoop = true;
	do {
		resultValue = irrResult(values, dates, resultRate);
		newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
		epsRate = Math.abs(newRate - resultRate);
		resultRate = newRate;
		contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
		// console.log(resultValue, newRate, epsRate, resultRate, contLoop);
	} while (contLoop && (++iteration < iterMax));

	if (contLoop) return '#NUM!';
	// console.log(iteration);
	// Return internal rate of return
	return resultRate;
}