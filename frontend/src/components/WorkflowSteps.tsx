import type { RequestStatus } from '../types/requests'
import { WORKFLOW_STEPS, workflowProgress } from '../types/requests'

/**
 * Horizontal stepper visualizing where a request sits in the
 * Submitted → Manager → HR → Ready pipeline. A rejection paints the
 * stage that rejected it red and stops the line there.
 */
export default function WorkflowSteps({ status }: { status: RequestStatus }) {
  const { index, rejected } = workflowProgress(status)

  return (
    <ol className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, i) => {
        const isDone = i < index
        const isCurrent = i === index
        const isRejectedHere = rejected && isCurrent

        const circle = isRejectedHere
          ? 'bg-red-500 text-white'
          : isDone
            ? 'bg-green-500 text-white'
            : isCurrent
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-500'

        return (
          <li key={step} className="flex items-center">
            {i > 0 && <span className={`h-0.5 w-8 ${i <= index ? 'bg-slate-400' : 'bg-slate-200'}`} />}
            <span className="flex flex-col items-center gap-1 px-1">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${circle}`}>
                {isRejectedHere ? '✕' : isDone ? '✓' : i + 1}
              </span>
              <span className="whitespace-nowrap text-[10px] text-slate-500">{step}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
