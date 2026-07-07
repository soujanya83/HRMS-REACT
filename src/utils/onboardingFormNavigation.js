export const notifyFlutterSaveSuccess = () => {
  if (window.FlutterChannel) {
    window.FlutterChannel.postMessage("SAVE_SUCCESS");
  }
};

export const closeFlutterWebView = () => {
  if (window.FlutterChannel) {
    window.FlutterChannel.postMessage("CLOSE_WEBVIEW");
    return true;
  }

  return false;
};

export const getCurrentEmployeeId = (fallbackEmployeeId) => {
  if (fallbackEmployeeId) return fallbackEmployeeId;

  const queryEmployeeId = new URLSearchParams(window.location.search).get(
    "employeeId",
  );
  if (queryEmployeeId) return queryEmployeeId;

  const employeeStr = localStorage.getItem("employee");
  const userStr = localStorage.getItem("user");

  try {
    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      if (employee?.id) return employee.id;
    }

    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) return user.id;
    }
  } catch {
    return null;
  }

  return null;
};

export const getOnboardingCancelPath = (fallbackEmployeeId) => {
  return "/dashboard/employee-onboarding/certificates";
};
