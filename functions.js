function isPrimeThisNumber(n) {
  // This function takes an integer and returns whether it is a prime number or not. Complexity O(n^1/2)
  for (let i = 2; i * i <= n; i++) {
    if (n % i == 0) return false;
  }
  return true;
}

function tripleSum(arr = [], targetSum = 0) {
  // This function return all the distinc triplet i,j,k i<j<k,
  // where arr[i] + arr[j] + arr[k] sum up to target. Complexity O(n^2)
  let visited = new Set();
  let sol = [];
  arr = arr.sort();
  for (let i = 0; i < arr.length; i++) {
    let target = targetSum - arr[i];
    let isSeen = new Set();
    for (let j = i + 1; j < arr.length; j++) {
      if (isSeen.has(target - arr[j])) {
        let key = `${arr[i]},${arr[j]},${target - arr[j]}`;
        if (!visited.has(key)) sol.push([arr[i], arr[j], target - arr[j]]);
        visited.add(key);
      } else {
        isSeen.add(arr[j]);
      }
    }
  }
  return sol;
}

function simulateLongTask(delayS = 10) {
  // This function simulate a task that will take 10 seconds to finish
  let now = Date.now();
  let iter = 0;
  let MAX_DELAY = delayS * 1000; // 10 seconds 100000 milliseconds
  while (Date.now() - now < MAX_DELAY) {
    iter++;
  }
  return iter;
}

async function getProductFromExternalApi() {
  const axios = require('axios');
  let limit = 25;
  let skip = 0;
  let { total } = (await axios.get('https://dummyjson.com/products?limit=0'))
    .data;
  let arrayPromises = [];
  while (skip < total) {
    arrayPromises.push(
      axios.get(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
    );
    skip = Math.min(skip + limit, total);
  }
  let allData = (await Promise.all(arrayPromises)).reduce((acc, curr) => {
    const { products } = curr.data;
    acc = acc.concat(products);
    return acc;
  }, []);
  return allData;
}

function sumUpTo(n) {
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    sum += i;
  }
  return sum;
}

module.exports = {
  tripleSum,
  simulateLongTask,
  isPrimeThisNumber,
  getProductFromExternalApi,
  sumUpTo,
};
