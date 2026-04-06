import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import { CasosTestePage } from '@/components/casos-teste-page'

export const metadata: Metadata = {
  title: 'Casos de Teste - QA Manager',
  description: 'Gerenciamento de casos de teste',
}

export default function Page() {
  return (
    <SidebarNew>
      <CasosTestePage />
    </SidebarNew>
  )
}
