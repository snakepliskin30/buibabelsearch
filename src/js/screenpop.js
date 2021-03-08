var appName = "ScreenPop_BUI";
var extensionProviderPromise;
var workspaceExtensionPromise;
var globalContextPromise;
var extensionContextPromise;
var extLogger;
var reportId;
var phone;
var columnIndex;
var filterIndex;

getExtensionProvider().then(function (extensionProvider) {
  //trace
  extLogger = extensionProvider.getLogger("ScreenPop_BUI");
  extLogger.trace("Load ScreenPop_BUI Extension");

  var queryString = window.parent.location.search;
  extLogger.trace(queryString);
  var urlParams = new URLSearchParams(queryString);
  phone = urlParams.get("phone");
  extLogger.trace("Phone Number is " + phone);

  if (phone) {
    getExtensionContext().then(function (extensionContext) {
      extensionContext.getProperties(["reportId"]).then(function (collection) {
        reportId = collection.get("reportId").getValue();
        extLogger.trace("Report ID from Configs is " + reportId);
        extensionProvider.registerAnalyticsExtension(function (IAnalyticsContext) {
          IAnalyticsContext.createReport(reportId).then(
            function (IExtensionReport) {
              var reportDefinition = IExtensionReport.getReportDefinition();
              var columnDefinitions = reportDefinition.getColumnDefinitions();
              for (var i = 0; i < columnDefinitions.length; i++) {
                if (columnDefinitions[i].getColumnReference() == "contacts.c_id") {
                  //Get the columnIndex inorder to use in getCells()
                  columnIndex = i;
                  break;
                }
              }
              var filterDetails = IExtensionReport.getReportFilters();
              var filterList = filterDetails.getFilterList();
              for (var j = 0; j < filterList.length; j++) {
                console.log("FilterList Column Ref is " + filterList[j].getColumnReference()); //Print to get the exact Columnreference of any_phone filter inorder to use in next line
                if (filterList[j].getColumnReference() == "contacts.any_phone;2") {
                  //Look for filter Labelled Phone and get it's index
                  filterIndex = j;
                  break;
                }
              }
              filterList[filterIndex].setValue("%" + phone + "%");

              IExtensionReport.setDataHandler(reportDataHandler);
              IExtensionReport.executeReport();
            },
            function (error) {
              extLogger.error("Error: " + error);
            }
          );
        });
      });
    });
  }
});

function reportDataHandler(reportObject) {
  var reportData = reportObject.getReportData();
  var count = reportData.totalRecordCount;
  extLogger.trace("Count of rows returned is " + count);

  if (count == 1) {
    var rowData = reportData.getRows()[0];
    var contactId = rowData.getCells()[columnIndex].getData(); //Make sure the first column of report is Contact ID as we are retrieving the data first cell
    extLogger.trace("Contact ID is " + contactId);
    getRegisteredWorkspaceRecord().then(function (WorkspaceRecord) {
      WorkspaceRecord.editWorkspaceRecord("Contact", contactId);
    });
  }
  if (count == 0) {
    getRegisteredWorkspaceRecord().then(function (WorkspaceRecord) {
      WorkspaceRecord.createWorkspaceRecord("Contact", setPhoneNum);
    });
  }
}

function setPhoneNum(closeHandler) {
  closeHandler.updateField("Contact.PhMobile", phone);
}

/////////////// Extensibility Framework Helper Functions ///////////////////
function getExtensionProvider() {
  if (!extensionProviderPromise) {
    extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load(appName);
  }
  return extensionProviderPromise;
}

function getRegisteredWorkspaceRecord() {
  if (workspaceExtensionPromise) {
    return workspaceExtensionPromise;
  } else {
    workspaceExtensionPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
    getExtensionProvider().then(function (extensionProvider) {
      extensionProvider.registerWorkspaceExtension(function (WRecord) {
        workspaceExtensionPromise.resolve(WRecord);
      });
    });
    return workspaceExtensionPromise;
  }
}

/* function getRegisteredUserInterfaceExtension() {
    if (UIExtensionPromise) {
        return UIExtensionPromise;
    } else {
        UIExtensionPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
        getExtensionProvider().then(function (extensionProvider) {
            extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
                UIExtensionPromise.resolve(IUserInterfaceContext);
            });
        });
        return UIExtensionPromise;
    }
} */

function getGlobalContext() {
  if (globalContextPromise) {
    return globalContextPromise;
  } else {
    globalContextPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
    getExtensionProvider().then(function (extensionProvider) {
      extensionProvider.getGlobalContext().then(function (globalContext) {
        globalContextPromise.resolve(globalContext);
      });
    });
    return globalContextPromise;
  }
}

function getExtensionContext() {
  if (extensionContextPromise) {
    return extensionContextPromise;
  } else {
    extensionContextPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
    getGlobalContext().then(function (globalCtx) {
      globalCtx.getExtensionContext("screenpop").then(function (extensionContext) {
        extensionContextPromise.resolve(extensionContext);
      });
    });
    return extensionContextPromise;
  }
}
