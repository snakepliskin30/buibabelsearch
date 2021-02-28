export function initializeResults() {
  //SET EVENT LISTENERS
  document.getElementById("resultstable").addEventListener("click", OpenAccount);
  document.querySelector(".back-to-search").addEventListener("click", BackToSearch);
}

function BackToSearch() {
  document.querySelector(".search").classList.toggle("show");
  document.querySelector(".results").classList.toggle("show");
}

async function OpenAccount(e) {
  e.stopPropagation();
  if (e.target.classList.contains("accountLink")) {
    const id = e.target.getAttribute("data-id");
    let p_id = "";
    let contactObj = results.find((contact) => contact.id == id);
    console.log(contactObj);
    ORACLE_SERVICE_CLOUD.extension_loader.load("SocoBUISearchExt").then(function (IExtensionProvider) {
      IExtensionProvider.getGlobalContext().then(function (globalContext) {
        p_id = globalContext.getProfileId();
        console.log("profile id is " + p_id);
        globalContext.getSessionToken().then(function (sessionToken) {
          $.ajax({
            url: "https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/searchandcreate.php",
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
              IExtensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                localStorage.setItem("contactObj", JSON.stringify(contactObj));
                workspaceRecord.editWorkspaceRecord("Contact", data);
              });
            },
          });
        });
      });
    });
  }
}
