// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\app\casos-teste\page.tsx
import { Metadata } from 'next'
import Sidebar from '@/components/sidebar'
import ControlePage from '@/components/controle-page'

export const metadata: Metadata = {
  title: 'Casos de Teste - QA Manager',
  description: 'Gestao de execucoes de teste e controle de qualidade',
}

export default function CasosTestePage() {
  return (
    <Sidebar>
      <ControlePage />
    </Sidebar>
  )
}