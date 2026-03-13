import React from "react";
import StoreSettingsPage from "./setting";
import UserManagementPage from "./user";

export default function SettingUser() {
  return (
    <div className="flex flex-col xl:flex-row justify-between ">
      <StoreSettingsPage />
      <UserManagementPage />
    </div>
  );
}
