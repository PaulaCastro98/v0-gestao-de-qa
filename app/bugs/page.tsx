import { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import { BugsPage } from '@/components/bugs-page'

export const metadata: Metadata = {
  title: 'Bugs - QA Manager',
  description: 'Gerenciamento de bugs com evidências',
}

export default function Page() {
  return (
    <Sidebar>
      <BugsPage />
    </Sidebar>
  )
}
