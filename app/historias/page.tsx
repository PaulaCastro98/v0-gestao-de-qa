import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import { HistoriasPage } from '@/components/historias-page'

export const metadata: Metadata = {
  title: 'Histórias - QA Manager',
  description: 'Gerenciamento de histórias de features',
}

export default function Page() {
  return (
    <SidebarNew>
      <HistoriasPage />
    </SidebarNew>
  )
}
