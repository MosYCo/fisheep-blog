//  Resize
window.addEventListener('resize', debounce(() => {
  const navBar = document.getElementById("nav-bar");
  if (!navBar) {
    return;
  }
  const width = document.body.clientWidth;
  if (navBar.classList.contains("nav-bar-slide-up")) {
    width > 900 && navBar.classList.remove('nav-bar-slide-up');
  }
  if (navBar.classList.contains("nav-bar-wrapper-on")) {
    navBar.classList.remove('nav-bar-wrapper-on');
  }
}));
//  点击toggle按钮
const handleToggleMenu = () => {
  const width = document.body.clientWidth;
  if (width > 900) {
    return;
  }
  const navBar = document.getElementById("nav-bar");
  if (!navBar.classList.contains("nav-bar-slide-up")) {
    navBar.classList.add('nav-bar-slide-up');
  }
  if (navBar.classList.contains("nav-bar-wrapper-on")) {
    navBar.classList.remove('nav-bar-wrapper-on');
  } else {
    navBar.classList.add('nav-bar-wrapper-on');
  }
}
document.getElementById("toggle-menu-btn").onclick = () => {
  handleToggleMenu();
}