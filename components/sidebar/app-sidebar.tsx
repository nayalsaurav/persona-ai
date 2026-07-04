"use client"

import {
  Sidebar,
} from "@/components/ui/sidebar"
import { AppSidebarHeader } from "@/components/sidebar/sidebar-header"
import { AppSidebarFooter } from "@/components/sidebar/sidebar-footer"
import { SidebarChatList } from "@/components/sidebar/sidebar-chat-list"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <AppSidebarHeader />
      <SidebarChatList />
      <AppSidebarFooter />
    </Sidebar>
  )
}
