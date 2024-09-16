const backToTop = () => {
  const scrollPercent = document.getElementById("scroll-percent");
  const backToTopBtn = document.querySelector(".back-to-top");
  backToTopBtn.onclick = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  window.addEventListener("scroll", (event) => {
    const el = document.documentElement;
    const percent = Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100);
    scrollPercent.innerHTML = percent + '%';
    if (percent > 1) {
      if (!backToTopBtn.classList.contains("back-to-top-on")) {
        backToTopBtn.classList.add("back-to-top-on");
      }
    } else {
      if (backToTopBtn.classList.contains("back-to-top-on")) {
        backToTopBtn.classList.remove("back-to-top-on");
      }
    }
  })
};

document.addEventListener("DOMContentLoaded", backToTop);