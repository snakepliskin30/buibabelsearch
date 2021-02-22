//import { Global, records } from "./app";
let table = {};

export function adjustTable() {
  table.columns.adjust().draw();
}

export function getData() {
  //const response = await fetch("http://localhost:3001/contacts/");
  //global.contacts = records;
  //console.log(global.contacts);
  //console.log(records);
  //console.log(global.contacts);
  //showContactBtn.disabled = false;
  ShowContactsTable();
  const data = localStorage.getItem("accountData");
  document.getElementById("acct-name").innerText = localStorage.getItem(
    "accountName"
  );
  localStorage.removeItem("accountName");
}

export function callAlert(e) {
  e.stopPropagation();
  if (e.target.classList.contains("dataColumnLink")) {
    const id = e.target.getAttribute("data-id");
    let contactObj = global.contacts.find((contact) => contact.id == id);
    global.selectedContact = contactObj;
    //const contactpanel = document.getElementById("detalye");
    const test = $("#firstName");
    $("#selectedcontactfname").text(global.selectedContact.firstName);
    $("#selectedcontactlname").text(global.selectedContact.lastName);
    $("#selectedcontactdob").text(global.selectedContact.dob);
  }
}

export function ShowContactsTable() {
  table = $("#contacts-table").DataTable();
  table.destroy();
  //console.log("test");
  //console.log(global.contacts);
  let contacts = global.contacts;
  table = $("#contacts-table").DataTable({
    data: contacts,
    columns: [
      { data: "firstName" },
      { data: "lastName" },
      { data: "dob" },
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
        data: "dob",
        render: function (data, type, row) {
          return (
            '<a class="dataColumnLink" data-id=' + row.id + ">" + data + "</a>"
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
  $("#contacts-table tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      global.selectedContact = {};

      $("#selectedcontactfname").text("");
      $("#selectedcontactlname").text("");
      $("#selectedcontactdob").text("");
    } else {
      table.$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
      global.selectedContact = table.row(this).data();

      $("#selectedcontactfname").text(global.selectedContact.firstName);
      $("#selectedcontactlname").text(global.selectedContact.lastName);
      $("#selectedcontactdob").text(global.selectedContact.dob);
    }
  });
}

//END OF CONTACTS
