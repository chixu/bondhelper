function sum(nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++)
    sum += nums[i];
  return sum;
}

function mean(nums) {
  return sum(nums) / (nums.length);
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

module.exports = {
  sum: sum,
  mean: mean,
  deviation: deviation,
  standardDeviation: standardDeviation
};