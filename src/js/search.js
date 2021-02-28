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
      if (!this.classList.contains("selected")) {
        this.parentNode.querySelector(".customoption.selected").classList.remove("selected");
        this.classList.add("selected");
        this.closest(".customselect").querySelector(".customselecttrigger span").textContent = this.textContent;
      }
    });
  }

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

function ResetForm() {
  if (document.querySelector(".search-header__error-header").classList.contains("show")) {
    document.querySelector(".search-header__error-header").classList.toggle("show");
  }
  document.getElementById("search-main").reset();
}

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
