function wait(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(() => {
      return resolve();
    }, milliseconds));
}

function waitUntil(conditionFunction, interval = 5000) {
  return new Promise(async (resolve) => {
    while (true) {
      let result = conditionFunction();
      if (result instanceof Promise) {
        result = await result;
      }
      if (result) {
        return resolve();
      }
      await wait(interval);
    }
  });
}

module.exports = {
  wait,
  waitUntil,
};
