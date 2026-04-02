import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import TestCasesPage from '@/components/pages/test-cases-page'

export const metadata: Metadata = {
  title: 'Test Cases - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <TestCasesPage />
    </SidebarNew>
  )
}
