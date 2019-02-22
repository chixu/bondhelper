function sum(nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++)
    sum += nums[i];
  return sum;
}

function mean(nums) {
  return sum(nums) / (nums.length);
}

function median(nums) {
  nums.sort();
  return nums[Math.floor(nums.length / 2)];
}

function deviation(nums) {
  if (nums.length <= 1) return 0;
  let m = mean(nums);
  let d = 0;
  for (let i = 0; i < nums.length; i++)
    d += (nums[i] - m) * (nums[i] - m);
  return d / (nums.length - 1);
}

function standardDeviation(nums) {
  return Math.sqrt(deviation(nums));
}

function rank(num, start = 1, fac = 1) {
  if (num == 0 || num == undefined) return 0;
  return Math.max(0, 1 - 1 / ((num - start) / fac + 1));
}

module.exports = {
  sum: sum,
  mean: mean,
  median: median,
  deviation: deviation,
  rank: rank,
  standardDeviation: standardDeviation
};