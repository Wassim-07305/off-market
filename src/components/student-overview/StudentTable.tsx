import type { StudentOverview } from '@/types/database'
import { StudentRow } from './StudentRow'

interface StudentTableProps {
  students: StudentOverview[]
  onSelect: (student: StudentOverview) => void
}

export function StudentTable({ students, onSelect }: StudentTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Élève
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activité
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Progression
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Messages
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dernière connexion
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentRow
              key={student.user_id}
              student={student}
              onClick={() => onSelect(student)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
