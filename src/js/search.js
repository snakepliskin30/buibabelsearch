import LOV from "./lov";

export function initializeSearch() {
  //SET EVENT LISTENERS
  document.getElementById("search-main").addEventListener("submit", SearchRecords);
  document.getElementById("clearform").addEventListener("click", ResetForm);

  // CREATE STATE DROPDOWN
  let stateOptions = document.querySelector("[data-option='search-form-state']");
  LOV.STATES.forEach((state) => {
    let option = document.createElement("span");
    option.className = "customoption";
    option.setAttribute("data-value", state.abbreviation);
    option.innerText = state.abbreviation;
    stateOptions.appendChild(option);
  });

  document.querySelectorAll(".customselectwrapper").forEach((wrapper) => {
    wrapper.addEventListener("click", function () {
      this.querySelector(".customselect").classList.toggle("open");
      this.querySelector(".selectbtn").classList.toggle("open");
    });
  });

  for (const option of document.querySelectorAll(".customoption")) {
    option.addEventListener("click", function () {
      console.log(this);
      if (!this.classList.contains("selected")) {
        console.log("option selected");
        this.parentNode.querySelector(".customoption.selected").classList.remove("selected");
        this.classList.add("selected");
        console.log(this.textContent);
        this.closest(".customselect").querySelector(".customselecttrigger span").textContent = this.textContent;
      }
    });
  }
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
    if (document.getElementById("acctnum").value) {
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
      $("#results").DataTable().columns.adjust().draw();
    }
  } catch (e) {
    throw e;
  }
}

function ResetForm() {
  document.getElementById("search-main").reset();
}

function ShowResults() {
  try {
    let table = $("#results").DataTable();
    table.destroy();
    //console.log("test");
    //console.log(global.contacts);
    let contacts = global.searchresults;
    table = $("#results").DataTable({
      data: contacts,
      columns: [{ data: "firstName" }, { data: "lastName" }, { data: "acctnum" }, { data: "id" }],
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
            return '<a class="accountLink" data-id=' + row.id + ">" + data + "</a>";
          },
        },
        {
          targets: 3,
          visible: false,
          searchable: false,
        },
      ],
    });
    console.log(table);
    $("#results tbody").on("click", "tr", function () {
      if ($(this).hasClass("selected")) {
        $(this).removeClass("selected");
      } else {
        table.$("tr.selected").removeClass("selected");
        $(this).addClass("selected");
      }
    });
  } catch (e) {
    console.log(e);
  }
}
