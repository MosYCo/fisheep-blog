const createTocBtn = () => {
  const title = document.querySelector(".post-title");
  const mdbody = document.querySelector(".markdown-body");
  if (!mdbody) {
    return;
  }
  const titles = Array.from(mdbody.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(el => ({
    level: el.tagName.toLowerCase().replace("h", ""),
    title: el.innerText
  }));
  const menuBtn = document.createElement("div");
  menuBtn.setAttribute("style", `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #fff;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
  `);
  const barIcon = document.createElement("i");
  barIcon.classList.add("fa", "fa-bars");
  menuBtn.appendChild(barIcon);
  menuBtn.onclick = () => {
    console.log("12313");
  }

  document.body.appendChild(menuBtn);
  console.log(1111, title, titles);
};

const createTocMenu = () => {
  const div = document.create
};

document.addEventListener('DOMContentLoaded', createTocBtn);