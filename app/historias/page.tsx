import { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import { HistoriasPage } from '@/components/historias-page'

export const metadata: Metadata = {
  title: 'Histórias - QA Manager',
  description: 'Gerenciamento de histórias de features',
}

export default function Page() {
  return (
    <Sidebar>
      <HistoriasPage />
    </Sidebar>
  )
}
