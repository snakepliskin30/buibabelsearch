let searchResultsCount = 0;
let globalvariable = "I AM A GLOBAL VARIABLE";

ORACLE_SERVICE_CLOUD.extension_loader.load("NavigationExt", "1").then(function (extensionProvider) {
  extensionProvider.getGlobalContext().then(function (globalContext) {
    globalContext.registerAction("GlobalAction", function (param) {
      return `${globalvariable} and i am the parameter from: ${param}`;
    });
  });
});

function createNavigationItem() {
  //The following function creates the navigation item and a child item.
  //!!! REMEMBER !!! -- Extension type of the addin should be console. Tried others but it's not working.
  try {
    ORACLE_SERVICE_CLOUD.extension_loader.load("NavigationExt", "1").then(function (extensionProvider) {
      var extLogger = extensionProvider.getLogger("NavigationExt");
      extLogger.trace("Load ScreenPop_BUI Extension");

      extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
        IUserInterfaceContext.getNavigationSetContext().then(function (INavigationSetContext) {
          //From Navigation Set Context the code can get an existing Id. we are not using an existing id in this sample code.
          INavigationSetContext.getNavigationItem("id").then(function (INavigationItem) {
            //Setting a label for the parent item.
            INavigationItem.setLabel("Customer Search");

            //Creating a child item.
            var childNavigationItem1 = INavigationItem.createChildItem();

            //Setting a label to the child item.
            childNavigationItem1.setLabel("Customer Search");

            //Handling an action to call the popup function that is defined later in this code.
            childNavigationItem1.setHandler(function (INavigationItem) {
              myContent();
            });

            //Don't forget to add the child to the parent item created early in this code.
            INavigationItem.addChildItem(childNavigationItem1);
            INavigationItem.render();
          });
        });
      });
    });
  } catch (e) {
    console.log("error in create navigation item");
  }
}

function myContent() {
  try {
    ORACLE_SERVICE_CLOUD.extension_loader.load("NavigationExt", "1").then(function (extensionProvider) {
      extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
        IUserInterfaceContext.getContentPaneContext().then(function (IContentPaneContext) {
          //In this case, we are creating a content pane, and I will give an Id for this content.
          IContentPaneContext.createContentPane("contentPaneSampleCode").then(function (IContentPane) {
            // With this function, the code is passing a name to show on the top of the content.
            IContentPane.setName("Search Contact");

            // With this function, the code is passing the URL (embedded page) through a variable.
            IContentPane.setContentUrl("../SocoBUISearchExt/index.html");
          });
        });
      });
    });

    /* SIDE-BAR LANG TO, IT WON'T OCCUPY THE WHOLE CONTENT COMPARED SA CONTENTPANE
		ORACLE_SERVICE_CLOUD.extension_loader.load("NavigationExt", "1").then(function(extensionProvider){
			extensionProvider.registerUserInterfaceExtension(function(IUserInterfaceContext){
				IUserInterfaceContext.getLeftSidePaneContext().then(function(leftSidePaneContext){	
				
					//In this case, we are creating a content pane, and I will give an Id for this content.
					leftSidePaneContext.getSidePane("c65e1220-081c-11e7-9017-d8cb8acd6be1").then(function(leftPanelMenu)
					{
					  // With this function, the code is passing a name to show on the top of the content.
					  //leftPanelMenu.setName("Search Contact");
					  leftPanelMenu.setLabel("Search Contact");
					  leftPanelMenu.setVisible(true);

					  // With this function, the code is passing the URL (embedded page) through a variable.
					  leftPanelMenu.setContentUrl("../SocoBUISearchExt/index-77c64b616e74fca5ae4624091523019a.html");
					  
					  //Font awesome is not included by default, but you can use it as per this example
					  var icon = leftPanelMenu.createIcon('font awesome');
					  icon.setIconClass('fas fa-search');
					  leftPanelMenu.addIcon(icon);
					  
					  leftPanelMenu.render();
					});
				});
			});
		});
		*/
  } catch (e) {
    console.log("error in myContent function");
  }
}

function checkSearchCriteria() {
  let queryString = window.parent.location.search;
  console.log(queryString);
  let urlParams = new URLSearchParams(queryString);
  let phone = urlParams.get("phone");
  let account = urlParams.get("account");
  let fname = urlParams.get("fname");
  console.log("my phone is", phone);
  console.log("my account is", account);

  if (account) {
    let url = `http://localhost:3001/contacts?acctnum=${account}`;
    SearchApi(url);
  } else if (phone) {
    let url = `http://localhost:3001/contacts?primphone=${phone}`;
    SearchApi(url);
  } else if (fname) {
    let url = `http://localhost:3001/contacts?firstName=${fname}`;
    SearchApi(url);
  } else {
    myContent();
  }
}

async function SearchApi(url) {
  try {
    let count = 0;
    let data = {};
    const result = await fetch(url);
    data = await result.json();
    count = data.length;
    if (count == 0) {
      window.localStorage.setItem("screenPopResultCount", count);
      myContent();
    } else if (count == 1) {
      OpenSingleAccount(data[0]);
    } else {
      window.localStorage.setItem("screenPopResultCount", count);
      window.localStorage.setItem("screenPopData", JSON.stringify(data));
      myContent();
    }
  } catch (e) {
    throw e;
  }
}

// Example POST method implementation:
async function OpenSingleAccount(data) {
  const url = "https://accenture6--tst3.custhelp.com/cgi-bin/accenture6.cfg/php/custom/searchandcreate.php";

  const IExtensionProvider = await ORACLE_SERVICE_CLOUD.extension_loader.load("NavigationExt", "1");
  const globalContext = await IExtensionProvider.getGlobalContext();
  const sessionToken = await globalContext.getSessionToken();

  console.log(data);

  let formData = new FormData();
  formData.append("acctNum", data.acctnum);
  formData.append("f_name", data.firstName);
  formData.append("l_name", data.lastName);

  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      P_SID: sessionToken,
      P_ID: globalContext.getProfileId(),
    },
    body: formData,
  }); // parses JSON response into native JavaScript objects

  const id = await response.json();
  window.localStorage.setItem("contactObj", JSON.stringify(data));
  IExtensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
    workspaceRecord.editWorkspaceRecord("Contact", id);
  });
}

//even this add-in has two functions, we want to start the add-in by creating the navigation sets and the navigation will call popup when it is required.
createNavigationItem();
//myContent();
//console.log("my parent's location is", window.parent.location);
checkSearchCriteria();
