// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\app\casos-teste\page.tsx
import { Metadata } from 'next'
import Navbar from '@/components/navbar'
import ControlePage from '@/components/controle-page' // Importa como default

export const metadata: Metadata = {
  title: 'Controle de QA - Sistema de Gestão',
  description: 'Gestão de execuções de teste e controle de qualidade',
}

export default function CasosTestePage() {
  return (
    <>
      <Navbar />
      <ControlePage />
    </>
  )
}