import { Metadata } from 'next'
import SidebarNew from '@/components/sidebar-new'
import MetricasPage from '@/components/pages/metricas-page'

export const metadata: Metadata = {
  title: 'Métricas - QA Manager',
}

export default function Page() {
  return (
    <SidebarNew>
      <MetricasPage />
    </SidebarNew>
  )
}
