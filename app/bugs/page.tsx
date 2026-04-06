import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import BugsPage from '@/components/pages/bugs-page'

export const metadata: Metadata = {
  title: 'Bugs - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <BugsPage />
    </SidebarNew>
  )
}
