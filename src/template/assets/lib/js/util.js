const debounce = (fn, delay = 500) => {
  let timer;
  return function () {
    window.clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      window.clearTimeout(timer);
    }, delay);
  }
}