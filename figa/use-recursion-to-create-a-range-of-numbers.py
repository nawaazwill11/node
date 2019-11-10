function rangeOfNumbers(startNum, endNum) {
  if (startNum == endNum) {
    return endNum;
  }
  return [].push(rangeOfNumbers(startNum1, endNum));
};

rangeOfNumbers(1, 10)