import axiosClient from "../axiosClient";

export const getNotifications = (organizationId, page = 1) => {
  return axiosClient.get("/notifications", {
    params: {
      organization_id: organizationId,
      page,
    },
    headers:{
      "organization-id": organizationId
    }
  });
};

export const markAsRead = (id) => {
  return axiosClient.post(`/notifications/${id}/mark-as-read`);
};

export const getNotificationSettings = (organizationId) => {
  return axiosClient.get("/notification-settings", {
    params: {
      organization_id: organizationId,
    },
  });
};

export const syncNotificationSettings = (organizationId, roles) => {
  return axiosClient.post("/notification-settings/sync", {
    organization_id: organizationId,
    roles,
  });
};

export const muteNotificationSetting = (organizationId, roleName, duration) => {
  return axiosClient.post("/notification-settings/mute", {
    organization_id: organizationId,
    role_name: roleName,
    duration,
  });
};
