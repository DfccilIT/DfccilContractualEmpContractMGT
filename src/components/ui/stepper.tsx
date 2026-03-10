import React from 'react'

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div className="flex-1" key={index}>
            <div className="flex items-center w-full">
              {/* Step Circle */}
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 ${
                  isCompleted ? 'bg-primary text-white' : isCurrent ? 'bg-primary/40 text-primary' : 'bg-gray-300 text-gray-600'
                }`}
              >
                <span className="text-sm font-bold">{index + 1}</span>
              </div>

              {/* Step Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-[3px] mx-2 sm:mx-4 rounded-lg ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`}></div>
              )}
            </div>

            {/* Step Info */}
            <div className="mt-2 text-center sm:text-left">
              <h6 className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-500'}`}>{step.title}</h6>
              <p className="text-xs text-gray-500">{isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Stepper
