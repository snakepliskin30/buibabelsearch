import Select from "./select";
import { memoize } from "./app";

export function initializeSearch() {
  //SET EVENT LISTENERS
  document.getElementById("search-main").addEventListener("submit", SearchRecords);
  document.getElementById("clearform").addEventListener("click", ResetForm);

  document.querySelectorAll("[data-custom-select]").forEach((element) => {
    new Select(element);
  });
  /*
  // CREATE STATE DROPDOWN
  let stateOptions = document.querySelector("[data-option='search-form-state']");
  LOV.STATES.forEach((state) => {
    let option = document.createElement("span");
    option.className = "customoption";
    option.setAttribute("data-value", state.abbreviation);
    option.innerText = state.abbreviation;
    stateOptions.appendChild(option);
  });

  // SET DROPDOWN STATES
  document.querySelectorAll(".customselectwrapper").forEach((wrapper) => {
    wrapper.addEventListener("click", function () {
      this.querySelector(".customselect").classList.toggle("open");
      this.querySelector(".selectbtn").classList.toggle("open");
    });
  });

  document.querySelectorAll(".customselectwrapper").forEach((wrapper) => {
    wrapper.addEventListener("blur", function () {
      console.log("test");
      this.querySelector(".customselect").classList.remove("open");
      this.querySelector(".selectbtn").classList.remove("open");
    });
  });

  document.querySelectorAll(".customselectwrapper").forEach((wrapper) => {
    wrapper.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "Space":
          e.target.querySelector(".customselect").classList.toggle("open");
          e.target.querySelector(".selectbtn").classList.toggle("open");
          break;
        case "Enter":
        case "Escape":
          e.target.querySelector(".customselect").classList.remove("open");
          e.target.querySelector(".selectbtn").classList.remove("open");
          break;
        // case "ArrowUp":
        //   let currentVal = this.querySelector(".customselecttrigger span").innerText;
        //   let index = "";
        //   [...this.querySelector("customoptions.children")].forEach((element, index) => {
        //     if(element.innerText === currentVal) {

        //     }
        //   })
      }
    });
  });

  for (const option of document.querySelectorAll(".customoption")) {
    option.addEventListener("click", function () {
      if (!this.classList.contains("selected")) {
        this.parentNode.querySelector(".customoption.selected").classList.remove("selected");
        this.classList.add("selected");
        this.closest(".customselect").querySelector(".customselecttrigger span").textContent = this.textContent;
      }
    });
  }
  */

  //SET FIELD VALIDATIONS
  new Cleave("#acctnum", {
    blocks: [10],
    numericOnly: true,
  });

  new Cleave("#primphone", {
    blocks: [3, 3, 4],
    delimiter: "-",
    numericOnly: true,
  });

  new Cleave("#ssn", {
    blocks: [3, 2, 4],
    delimiter: "-",
    numericOnly: true,
  });

  new Cleave("#zip", {
    blocks: [5],
    numericOnly: true,
  });
}

async function OpenSingleAccount(contactObj) {
  let p_id = "";
  ORACLE_SERVICE_CLOUD.extension_loader.load("SocoBUISearchExt").then(function (IExtensionProvider) {
    IExtensionProvider.getGlobalContext().then(function (globalContext) {
      p_id = globalContext.getProfileId();
      console.log("profile id is " + p_id);
      globalContext.getSessionToken().then(function (sessionToken) {
        $.ajax({
          url: "https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/searchandcreate.php",
          type: "post",
          data: {
            acctNum: contactObj[0].acctnum,
            f_name: contactObj[0].firstName,
            l_name: contactObj[0].lastName,
          },
          headers: {
            P_SID: sessionToken,
            P_ID: p_id,
          },
          dataType: "json",
          success: function (data) {
            console.log(data);
            IExtensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
              localStorage.setItem("contactObj", JSON.stringify(contactObj[0]));
              workspaceRecord.editWorkspaceRecord("Contact", data);
            });
          },
        });
      });
    });
  });
}

function SearchRecords(e) {
  e.preventDefault();
  if (document.querySelector(".search-header__error-header").classList.contains("show")) {
    document.querySelector(".search-header__error-header").classList.toggle("show");
  }
  document.body.classList.toggle("waiting");
  try {
    if (document.getElementById("zip").value) {
      let url = `http://localhost:3001/contacts`;
      SearchApi(url);
    } else if (document.getElementById("acctnum").value) {
      let acctnum = document.getElementById("acctnum").value;
      let url = `http://localhost:3001/contacts?acctnum=${acctnum}`;
      SearchApi(url);
    } else if (document.getElementById("fname").value) {
      let fname = document.getElementById("fname").value;
      let url = `http://localhost:3001/contacts?firstName=${fname}`;
      SearchApi(url);
    } else if (document.getElementById("lname").value) {
      let lname = document.getElementById("lname").value;
      let url = `http://localhost:3001/contacts?lastName=${lname}`;
      SearchApi(url);
    }
  } catch (e) {
    console.log(e);
  } finally {
    document.body.classList.toggle("waiting");
  }
}

async function SearchApi(url) {
  try {
    let count = 0;
    let data = {};
    const result = await fetch(url);
    data = await result.json();
    count = data.length;
    global.searchresults = data;
    if (count == 0) {
      document.querySelector(".search-header__error-header").classList.toggle("show");
    } else if (count == 1) {
      OpenSingleAccount(data);
    } else {
      ShowResults();
      document.querySelector(".search").classList.toggle("show");
      document.querySelector(".results").classList.toggle("show");
      $("#searchresults").DataTable().columns.adjust().draw();
    }
  } catch (e) {
    throw e;
  }
}

async function ResetForm() {
  /*
  if (document.querySelector(".search-header__error-header").classList.contains("show")) {
    document.querySelector(".search-header__error-header").classList.toggle("show");
  }
  document.getElementById("search-main").reset();
  alert(document.getElementById("searchstate").innerText);
  */

  // FETCH POST JAVASCRIPT CALL
  /*
  let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/latest/queryResults/?query=select name from configuration where name like 'CUSTOM_CFG_CX%' limit 100";
  let authorization = "C096064:Welcome#2022";
  let encoded = btoa(authorization);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    referrerPolicy: "no-referrer",
    headers: {
      Authorization: `Session ${global.sessionToken}`,
      "Content-Type": "text/plain",
      Connection: "close",
      "OSvC-CREST-Application-Context": "Query",
    },
  });
  */

  /*
  console.log("auth");
  let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/contacts/434";
  // let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select name from configuration where name like 'CUSTOM_CFG_CX%' limit 100";
  let req = new XMLHttpRequest();
  let auth = btoa("C096064:Welcome#2022");
  req.open("GET", url, true);
  req.withCredentials = true;
  req.setRequestHeader("Authorization", "Session " + global.sessionToken);
  req.setRequestHeader("Content-Type", "text/plain");
  req.setRequestHeader("OSvC-CREST-Application-Context", "Query");

  req.onload = function () {
    if (this.status == 200) {
      console.log(this.responseText);
    } else {
      console.log(this);
    }
  };

  req.send();

  */
  console.log("accounts?q");
  // QUERIES
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/contacts/434";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/configurations";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/configurations?fields=name,value";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/configurations?q=lookupname like 'CUSTOM_CFG_CX%'"; //not working
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/contacts?q=CustomFields.c.acct_num='4565698312'";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select lookupname from configurations where name like 'CUSTOM_CFG_CX%'"; -- forbidden
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select name.last, name.first from contacts where id=434";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select name, value from configurations where name = 'CUSTOM_CFG_CX_CUSTOMER_SEARCH'";
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select name, value from configurations where name LIKE '%CUSTOM_CFG_CX%'"; -- forbidden
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/queryResults/?query=select name.first, name.last from contact where name.last LIKE 'Drink%'"; //--forbidden;
  //let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/contacts-search-form";

  //CREATE
  let url = "https://accenture6--tst3.custhelp.com/services/rest/connect/v1.4/contacts/";

  let newContact = {};
  //Name fields
  let name = {};
  name.first = "Rod";
  name.last = "Tolaresa";
  newContact.name = name;
  //Custom fields -- camelcasing matters!!
  let customFields = {
    c: {
      acct_num: "123456789",
    },
  };
  newContact.customFields = customFields;
  //Email
  let emails = [
    {
      address: "test1@test.com",
      addressType: {
        lookupName: "Email - Primary",
      },
    },
    {
      address: "pinoy@test.com",
      addressType: {
        lookupName: "Alternate Email 1",
      },
    },
  ];
  newContact.emails = emails;
  //Phones
  let phones = [
    {
      number: "1234567890",
      phoneType: {
        lookupName: "Office Phone",
      },
    },
    {
      number: "987654321",
      phoneType: {
        lookupName: "Home Phone",
      },
    },
  ];
  newContact.phones = phones;
  newContact.contactType = {
    lookupName: "Person",
  };

  let response = await fetch(url, {
    method: "POST", // GET method for queries
    headers: {
      Authorization: `Session ${global.sessionToken}`,
      "Content-Type": "application/json",
      "OSvC-CREST-Application-Context": "Query",
    },
    body: JSON.stringify(newContact), //don't include body for get requests
  });

  let data = await response.json();
  console.log(data);

  // console.log("change xmlhttpreq");
  // console.log(response);

  // let obj = { answer: 30 };
  // let x = await postData("https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/myunsecuredscript.php", obj);
  // console.log(x);
}

// Example POST method implementation:
// async function postData(url = "", data = {}) {
//   let formData = new FormData();
//   formData.append("requestName", "getAccount");
//   formData.append("requestBody", JSON.stringify(data));
//   const response = await fetch(url, {
//     method: "POST",
//     credentials: "same-origin",
//     headers: {
//       P_SID: "sessionToken-test",
//       P_ID: "p_id-test",
//     },
//     body: formData,
//   }); // parses JSON response into native JavaScript objects
// }

function ShowResults() {
  try {
    let table = $("#searchresults").DataTable();
    table.destroy();
    let contacts = global.searchresults.map((obj) => ({ ...obj, fullName: obj.firstName + " " + obj.lastName }));
    console.log(contacts);
    table = $("#searchresults").DataTable({
      data: contacts,
      columns: [
        { data: "opco", title: "Operating Company" },
        { data: "fullName", title: "Customer Name" },
        { data: "acctnum", title: "Account NUmber" },
        { data: "premiseAddr", title: "Premise Address" },
        { data: "accountStatus", title: "Account Status" },
        { data: "revenueClass", title: "Revenue Class" },
      ],
      scrollY: "390",
      scrollCollapse: false,
      bLengthChange: false,
      bFilter: false,
      bInfo: false,
      bAutoWidth: false,
      paging: false,
      columnDefs: [
        /*
        {
          targets: 0,
          width: "25%",
        },
        {
          targets: 1,
          width: "25%",
        },
        {
          targets: 2,
          width: "25%",
          data: "acctnum",
          render: function (data, type, row) {
            return '<a class="accountLink" data-id=' + row.id + ">" + data + "</a>";
          },
        },
        {
          targets: 3,
          visible: false,
          searchable: false,
        },
        {
          targets: 4,
          data: "dob",
          width: "25%",
          render: function (data, type, row) {
            if (parseInt(row.dob.substring(0, 4)) >= 1966) {
              return '<input type="checkbox" checked="checked"></input>';
            } else {
              return '<input type="checkbox"></input>';
            }
          },
        },
        */
        {
          targets: 6,
          data: "revenueClass",
          render: function (data, type, row) {
            if (row.revenueClass === "Residential") {
              return '<a class="accountLink" data-id=' + row.id + ">Open in 360</a>";
            } else {
              return '<a class="accountLink" data-id=' + row.id + ">Open in CSS</a>";
            }
          },
        },
      ],
    });
    // $("#results tbody").on("click", "tr", function () {
    //   if ($(this).hasClass("selected")) {
    //     $(this).removeClass("selected");
    //   } else {
    //     table.$("tr.selected").removeClass("selected");
    //     $(this).addClass("selected");
    //   }
    // });

    document
      .getElementById("searchresults")
      .querySelectorAll("td")
      .forEach((e) => {
        e.addEventListener("click", SelectRow);
      });
  } catch (e) {
    console.log(e);
  }
}

function SelectRow(e) {
  if (e.target.closest("tr").classList.contains("selected")) {
    e.target.closest("tr").classList.remove("selected");
  } else {
    if (document.getElementById("searchresults").querySelector("tr.selected")) {
      document.getElementById("searchresults").querySelector("tr.selected").classList.remove("selected");
    }
    e.target.closest("tr").classList.add("selected");
  }
}
