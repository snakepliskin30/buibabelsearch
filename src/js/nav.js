import { table, adjustTable, getData } from "./contacts";

export function activateTab(e) {
  console.log("tab-changed");
  const tabs = document.querySelectorAll("[data-tab-target]");
  const tabContents = document.querySelectorAll("[data-tab-content]");
  //LOOP THRU ALL TABS AND REMOVE THE ACTIVE
  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  //SET ACTIVE TO THE EVENT TARGET
  e.target.classList.add("active");

  //LOOP THRU ALL THE TAB CONTENTS AND REMOVE THE ACTIVE
  tabContents.forEach((tabContent) => {
    tabContent.classList.remove("active");
  });

  //SET THE ACTIVE CONTENT BASED ON THE TAB TARGET DATA-SET
  const tabTarget = e.target.dataset.tabTarget;
  try {
    document.querySelector(tabTarget).classList.add("active");

    //table.columns.adjust().draw();
    if (tabTarget === "#contacts-view") {
      getData();
      adjustTable();
    }
  } catch (e) {}
}

export function closeTab(e) {
  e.stopPropagation();
  const parentElement = e.target.parentElement; //li element
  const grandParent = parentElement.parentElement; //ul element
  grandParent.removeChild(parentElement); //remove li from ul

  const main = document.querySelector(`[data-tab-target="#main-view"]`);
  main.click();
}

export function goToTab(e) {
  const target = e.target.dataset.tabLink;
  const query = `[data-tab-target="${target}"]`;
  let name = "";
  let nameArr = target.split("-");
  for (let i = 0; i < nameArr.length - 1; i++) {
    if (i == 0) {
      name += nameArr[i].replace("#", "");
    } else {
      name += " " + nameArr[i];
    }
  }
  let isExisting = document.querySelector(query); //check if tab already exist
  if (!isExisting) {
    let tabList = document.getElementById("tabList");

    let icon = document.createElement("i");
    icon.className = "fas fa-times tab-close";
    icon.addEventListener("click", closeTab);

    let li = document.createElement("li");
    li.setAttribute("data-tab-target", target);
    li.innerText = name;
    li.addEventListener("click", activateTab);

    li.appendChild(icon);
    tabList.appendChild(li);
    isExisting = document.querySelector(query);
  }

  isExisting.click();
}
//NAVIGATION END
