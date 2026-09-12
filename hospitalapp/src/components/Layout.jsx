import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./nav";

export default function Layout({ isSidebarOpen, toggleSidebar, SidebarComponent }) {
  return (
    <div className="layout-container">
      <Nav toggleSidebar={toggleSidebar} />
      {SidebarComponent && (
        <SidebarComponent isOpen={isSidebarOpen} />
      )}
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
}