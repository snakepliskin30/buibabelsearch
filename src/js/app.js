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
  let configSettings = getConfigSetting();
  initializeSearch();
  initializeResults();
});

export function memoize(func) {
  let cache = [];

  return async (url, id, body) => {
    if (cache[`${url}${id}`]) {
      console.log("from cache");
      return cache[`${url}${id}`];
    }
    console.log("from cache");
    let data = await func(url, id, body);
    cache[`${url}${id}`] = data;
    return data;
  };
}

async function getConfigSetting() {
  const IExtensionProvider = await ORACLE_SERVICE_CLOUD.extension_loader.load("SocoBUISearchExt");
  const globalContext = await IExtensionProvider.getGlobalContext();
  const sessionToken = await globalContext.getSessionToken();
  global.sessionToken = sessionToken;
  console.log(sessionToken);
  console.log("getAccountId", globalContext.getAccountId());
  console.log("getInterfaceId", globalContext.getInterfaceId());
  console.log("getInterfaceName", globalContext.getInterfaceName());
  console.log("getInterfaceUrl", globalContext.getInterfaceUrl());
  console.log("getProfileName", globalContext.getProfileName());
  console.log("getExtensionContext", globalContext.getAccountId());
  console.log("getContainerContext", globalContext.getAccountId());
  // let x = await fetch("https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/configuration?q=select name from configuration where name like 'CUSTOM_CFG_CX%' limit 100");
  // console.log(x);
}

let results = [];

// document.querySelector(".customselectwrapper").addEventListener("click", function () {
//   this.querySelector(".customselect").classList.toggle("open");
//   this.querySelector(".selectbtn").classList.toggle("open");
// });
