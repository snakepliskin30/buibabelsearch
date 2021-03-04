import LOV from "./lov.js";

/********************* 

	<div class="customselectwrapper" tabindex="0">
      <div class="customselect">
        <div class="customselecttrigger">
          <span>All Companies</span>
        </div>
        <div class="customoptions">
          <span class="customoption selected" data-value="AllCompanies">All Companies</span>
          <span class="customoption" data-value="Soco">Soco</span>
        </div>
        <div class="selectbtn">
          <i class="fas fa-chevron-down fa-lg"></i>
        </div>
      </div>
    </div>

*************************/

export default class Select {
  constructor(element) {
    this.element = element;
    this.optiontype = this.element.dataset.customSelect;
    this.optiondefault = this.element.dataset.customDefault;
    this.customgroup = document.createElement("div");
    this.customlabel = document.createElement("div");
    this.customlabeltext = this.element.dataset.customLabel ? this.element.dataset.customLabel : "";
    this.customselectwrapper = document.createElement("div");
    this.customselect = document.createElement("div");
    this.customselecttrigger = document.createElement("div");
    this.selectedValue = document.createElement("span");
    this.selectedValueIndex = 0;
    this.customoptions = document.createElement("div");
    this.selectbtn = document.createElement("div");
    this.arrow = document.createElement("i");
    this.optionsArr = LOV[this.optiontype.toUpperCase()];
    builCustomSelect(this);
    element.style.display = "none";
    element.after(this.customgroup);
  }
}

function builCustomSelect(select) {
  if (select.optionsArr == undefined || select.optionsArr?.length == 0) {
    select.selectedValue.innerText = "No list of values found";
  } else {
    select.optionsArr.forEach((state, index) => {
      if (index == 0 && !select.optiondefault) {
        let option = document.createElement("span");
        option.setAttribute("class", "customoption selected");
        option.setAttribute("data-value", state.value);
        option.innerText = state.display;
        select.customoptions.appendChild(option);
        select.selectedValue.innerText = state.display;
        select.element.innerText = state.value;
        select.selectedValueIndex = index;
      } else {
        let option = document.createElement("span");
        if (select.optiondefault === state.display) {
          option.setAttribute("class", "customoption selected");
          option.scrollIntoView({ block: "nearest" });
          select.selectedValue.innerText = state.display;
          select.element.textContent = state.value;
          select.selectedValueIndex = index;
        } else {
          option.setAttribute("class", "customoption");
        }
        option.setAttribute("data-value", state.value);
        option.textContent = state.display;
        select.customoptions.appendChild(option);
      }
    });
  }
  select.customgroup.setAttribute("class", "customgroup");
  select.customlabel.setAttribute("class", "customlabel");
  select.customlabel.innerText = select.customlabeltext;
  select.customselectwrapper.setAttribute("class", "customselectwrapper");
  select.customselectwrapper.setAttribute("tabindex", "0");
  select.customselect.setAttribute("class", "customselect");
  select.customselecttrigger.setAttribute("class", "customselecttrigger");
  select.customoptions.setAttribute("class", "customoptions");
  select.selectbtn.setAttribute("class", "selectbtn");
  select.arrow.setAttribute("class", "fas fa-chevron-down fa-lg");

  select.customselecttrigger.appendChild(select.selectedValue);
  select.selectbtn.appendChild(select.arrow);

  select.customselect.appendChild(select.customselecttrigger);
  select.customselect.appendChild(select.customoptions);
  select.customselect.appendChild(select.selectbtn);

  select.customselectwrapper.appendChild(select.customselect);

  select.customgroup.appendChild(select.customlabel);
  select.customgroup.appendChild(select.customselectwrapper);

  //ADD EVENT LISTENERS
  select.customselectwrapper.addEventListener("click", () => {
    select.customselect.classList.toggle("open");
    select.selectbtn.classList.toggle("open");
    scrollToSelected(select);
  });

  select.customselectwrapper.addEventListener("blur", () => {
    console.log("test");
    select.customselect.classList.remove("open");
    select.selectbtn.classList.remove("open");
  });

  [...select.customoptions.children].forEach((e) => {
    e.addEventListener("click", () => {
      if (!e.getAttribute("class").includes("selected")) {
        let newIndex = select.optionsArr.findIndex((o) => o.display === e.innerText);
        let display = e.innerText;
        let value = e.getAttribute("data-value");
        selectValue(select, display, value, newIndex);
      }
    });
  });

  let debounceTimeout;
  let searchTerm = "";
  select.customselectwrapper.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        e.target.querySelector(".customselect").classList.toggle("open");
        e.target.querySelector(".selectbtn").classList.toggle("open");
        scrollToSelected(select);
        break;
      case "Enter":
      case "Escape":
        e.target.querySelector(".customselect").classList.remove("open");
        e.target.querySelector(".selectbtn").classList.remove("open");
        scrollToSelected(select);
        break;
      case "ArrowUp":
        e.stopPropagation();
        if (select.selectedValueIndex != 0) {
          let option = select.optionsArr[select.selectedValueIndex - 1];
          let display = option.display;
          let value = option.value;
          selectValue(select, display, value, select.selectedValueIndex - 1);
        }
        break;
      case "ArrowDown":
        e.stopPropagation();
        if (select.selectedValueIndex != select.optionsArr.length) {
          let option = select.optionsArr[select.selectedValueIndex + 1];
          let display = option.display;
          let value = option.value;
          selectValue(select, display, value, select.selectedValueIndex + 1);
        }
        break;
      default:
        clearTimeout(debounceTimeout);
        searchTerm += e.key;
        debounceTimeout = setTimeout(() => {
          searchTerm = "";
        }, 500);
        let searchedOptionIndex = select.optionsArr.findIndex((o) => {
          return o.display.toLowerCase().startsWith(searchTerm.toLowerCase());
        });
        if (searchedOptionIndex && searchedOptionIndex != -1) {
          let option = select.optionsArr[searchedOptionIndex];
          selectValue(select, option.display, option.value, searchedOptionIndex);
        }
        break;
    }
  });
}

function selectValue(select, newDisplay, newValue, newIndex) {
  select.selectedValue.innerText = newDisplay;
  select.element.innerText = newValue;
  select.selectedValueIndex = newIndex;

  [...select.customoptions.children].forEach((o) => {
    if (o.textContent === newDisplay) {
      o.setAttribute("class", "customoption selected");
      o.scrollIntoView({ block: "nearest" });
    } else {
      o.setAttribute("class", "customoption");
    }
  });
}

function scrollToSelected(select) {
  [...select.customoptions.children].forEach((o) => {
    if (o.getAttribute("class").includes("selected")) {
      o.scrollIntoView({ block: "nearest" });
    }
  });
}
