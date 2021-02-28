import "../css/utilities.css";
import "../css/search.css";
import "../css/form.css";
import "../css/table.css";
import "../css/media.css"; // always keep this css file imported last

import "core-js/stable/promise";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

import { initializeSearch } from "./search";
import { initializeResults } from "./results";

document.addEventListener("DOMContentLoaded", () => {
  initializeSearch();
  initializeResults();
});

let results = [];

// document.querySelector(".customselectwrapper").addEventListener("click", function () {
//   this.querySelector(".customselect").classList.toggle("open");
//   this.querySelector(".selectbtn").classList.toggle("open");
// });
