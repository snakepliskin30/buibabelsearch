import "../css/utilities.css";
import "../css/navbar.css";
import "../css/main.css";
import "../css/panel.css";
import "../css/media.css"; // always keep this css file imported last

import "core-js/stable/promise";
import "regenerator-runtime/runtime";
import "whatwg-fetch";

//document.addEventListener("DOMContentLoaded", getAsyncData);

let results = [];

document.getElementById("searchForm").addEventListener("submit", SearchRecords);
document.getElementById("clearform").addEventListener("click", ResetForm);
document.getElementById("resultstable").addEventListener("click", OpenAccount);

async function OpenAccount(e) {
  e.stopPropagation();
  if (e.target.classList.contains("accountLink")) {
    const id = e.target.getAttribute("data-id");
    let p_id = "";
    let contactObj = results.find((contact) => contact.id == id);
    console.log(contactObj);
    ORACLE_SERVICE_CLOUD.extension_loader
      .load("SocoBUISearchExt")
      .then(function (IExtensionProvider) {
        IExtensionProvider.getGlobalContext().then(function (globalContext) {
          p_id = globalContext.getProfileId();
          console.log("profile id is " + p_id);
          globalContext.getSessionToken().then(function (sessionToken) {
            $.ajax({
              url:
                "https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/searchandcreate.php",
              type: "post",
              data: {
                acctNum: contactObj.acctnum,
                f_name: contactObj.firstName,
                l_name: contactObj.lastName,
              },
              headers: {
                P_SID: sessionToken,
                P_ID: p_id,
              },
              dataType: "json",
              success: function (data) {
                console.log(data);
                IExtensionProvider.registerWorkspaceExtension(function (
                  workspaceRecord
                ) {
                  localStorage.setItem(
                    "contactObj",
                    JSON.stringify(contactObj)
                  );
                  workspaceRecord.editWorkspaceRecord("Contact", data);
                });
              },
            });
          });
        });
      });
  }
}

async function OpenSingleAccount(contactObj) {
  let p_id = "";
  ORACLE_SERVICE_CLOUD.extension_loader
    .load("SocoBUISearchExt")
    .then(function (IExtensionProvider) {
      IExtensionProvider.getGlobalContext().then(function (globalContext) {
        p_id = globalContext.getProfileId();
        console.log("profile id is " + p_id);
        globalContext.getSessionToken().then(function (sessionToken) {
          $.ajax({
            url:
              "https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/searchandcreate.php",
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
              IExtensionProvider.registerWorkspaceExtension(function (
                workspaceRecord
              ) {
                localStorage.setItem(
                  "contactObj",
                  JSON.stringify(contactObj[0])
                );
                workspaceRecord.editWorkspaceRecord("Contact", data);
              });
            },
          });
        });
      });
    });
}

async function SearchRecords(e) {
  e.preventDefault();
  try {
    let count = 0;
    let data = {};
    if (document.getElementById("acctnum").value) {
      const acctnum = document.getElementById("acctnum").value;
      const result = await fetch(
        `http://localhost:3001/contacts?acctnum=${acctnum}`
      );
      data = await result.json();
      count = data.length;
      results = data;
      ShowResults();
      document.getElementById("searchResults").classList.add("show");
      $("#resultstable").DataTable().columns.adjust().draw();
      if (count == 1) {
        OpenSingleAccount(data);
      }
    } else if (document.getElementById("fname").value) {
      const fname = document.getElementById("fname").value;
      const result = await fetch(
        `http://localhost:3001/contacts?firstName=${fname}`
      );
      data = await result.json();
      count = data.length;
      results = data;
      ShowResults();
      document.getElementById("searchResults").classList.add("show");
      $("#resultstable").DataTable().columns.adjust().draw();
      if (count == 1) {
        OpenSingleAccount(data);
      }
    } else if (document.getElementById("lname").value) {
      const lname = document.getElementById("lname").value;
      const result = await fetch(
        `http://localhost:3001/contacts?lastName=${lname}`
      );
      data = await result.json();
      count = data.length;
      results = data;
      ShowResults();
      document.getElementById("searchResults").classList.add("show");
      $("#resultstable").DataTable().columns.adjust().draw();
      if (count == 1) {
        OpenSingleAccount(data);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function ResetForm() {
  document.getElementById("searchResults").classList.remove("show");
  document.getElementById("searchForm").reset();
}

function ShowResults() {
  let table = $("#resultstable").DataTable();
  table.destroy();
  //console.log("test");
  //console.log(global.contacts);
  let contacts = results;
  table = $("#resultstable").DataTable({
    data: contacts,
    columns: [
      { data: "firstName" },
      { data: "lastName" },
      { data: "acctnum" },
      { data: "id" },
    ],
    scrollY: "410",
    scrollCollapse: false,
    bLengthChange: false,
    bFilter: false,
    bInfo: false,
    bAutoWidth: false,
    columnDefs: [
      {
        targets: 0,
        width: 300,
      },
      {
        targets: 1,
        width: 300,
      },
      {
        targets: 2,
        data: "acct-num",
        render: function (data, type, row) {
          return (
            '<a class="accountLink" data-id=' + row.id + ">" + data + "</a>"
          );
        },
      },
      {
        targets: 3,
        visible: false,
        searchable: false,
      },
    ],
  });
  $("#resultstable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      table.$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });
}
