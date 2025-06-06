import PublicDisplayPage from '@/components/PublicDisplayPage'
import getDisplayById from '@/lib/display-service'
import { notFound } from 'next/navigation'

interface DisplayPageProps {
  params: Promise<{ id: string }>
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const { id } = await params
  const result = await getDisplayById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <PublicDisplayPage displayId={id} displayData={result.data} />
}
