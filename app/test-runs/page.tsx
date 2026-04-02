import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import TestRunsPage from '@/components/pages/test-runs-page'

export const metadata: Metadata = {
  title: 'Test Runs - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <TestRunsPage />
    </SidebarNew>
  )
}
