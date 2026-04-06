import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import ProjetosPage from '@/components/pages/projetos-page'

export const metadata: Metadata = {
  title: 'Projetos - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <ProjetosPage />
    </SidebarNew>
  )
}
