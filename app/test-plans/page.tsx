import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import TestPlansPage from '@/components/pages/test-plans-page'

export const metadata: Metadata = {
  title: 'Test Plans - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <TestPlansPage />
    </SidebarNew>
  )
}
