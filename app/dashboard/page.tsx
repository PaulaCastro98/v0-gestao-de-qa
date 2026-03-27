import { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import DashboardContent from '@/components/dashboard-content'

export const metadata: Metadata = {
  title: 'Dashboard - QA Manager',
  description: 'Dashboard de métricas e relatórios de QA',
}

export default function DashboardPage() {
  return (
    <Sidebar>
      <DashboardContent />
    </Sidebar>
  )
}
