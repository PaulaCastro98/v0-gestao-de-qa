import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import TestSuitesPage from '@/components/pages/test-suites-page'

export const metadata: Metadata = {
  title: 'Test Suites - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <TestSuitesPage />
    </SidebarNew>
  )
}
