// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\app\casos-teste\page.tsx
import { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import { CasosTestePage } from '@/components/casos-teste-page'

export const metadata: Metadata = {
  title: 'Casos de Teste - QA Manager',
  description: 'Gerenciamento de casos de teste',
}

export default function Page() {
  return (
    <Sidebar>
      <CasosTestePage />
    </Sidebar>
  )
}
