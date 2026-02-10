import { useState } from 'react'
import { Users } from 'lucide-react'
import { useStudentsOverview } from '@/hooks/useStudentOverview'
import { StudentTable } from '@/components/student-overview/StudentTable'
import { StudentDetailDrawer } from '@/components/student-overview/StudentDetailDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import type { StudentOverview } from '@/types/database'

export default function StudentOverviewPage() {
  const { data: students, isLoading } = useStudentsOverview()
  const [selectedStudent, setSelectedStudent] = useState<StudentOverview | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Suivi des élèves</h1>
        <p className="text-sm text-muted-foreground">
          Suivez la progression et l'activité de vos élèves.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : !students || students.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Aucun élève"
          description="Aucun élève n'a encore été inscrit."
        />
      ) : (
        <StudentTable
          students={students}
          onSelect={setSelectedStudent}
        />
      )}

      {/* Drawer */}
      <StudentDetailDrawer
        student={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}
