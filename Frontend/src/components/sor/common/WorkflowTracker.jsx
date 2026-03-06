import React from 'react';
import { getStepConfig } from '../../../utils/sor/workflowHelpers';
import '../../../styles/sor/components/WorkflowTracker.css';

const WorkflowTracker = ({ steps = [], currentStepIndex = 0 }) => {
  return (
    <div className="workflow-tracker">
      {steps.map((step, idx) => {
        const config    = getStepConfig(step.status);
        const isCurrent = step.status === 'Pending' && idx === currentStepIndex;
        return (
          <div key={step.offerWorkflowStepId || idx}
            className={`wf-step ${isCurrent ? 'wf-step--active' : ''} wf-step--${config.color}`}>
            <div className="wf-step__icon">{config.icon}</div>
            <div className="wf-step__content">
              <div className="wf-step__role">
                Step {step.stepOrder}: <strong>{step.role}</strong>
              </div>
              <div className={`wf-step__status text-${config.color}`}>
                {config.label}
                {step.approverName && ` — ${step.approverName}`}
              </div>
              {step.comments && (
                <div className="wf-step__comments">
                  <small className="text-muted">💬 {step.comments}</small>
                </div>
              )}
              {step.actionDate && (
                <div className="wf-step__date">
                  <small className="text-muted">
                    {new Date(step.actionDate).toLocaleDateString('en-IN')}
                  </small>
                </div>
              )}
            </div>
            {idx < steps.length - 1 && <div className="wf-connector" />}
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowTracker;
