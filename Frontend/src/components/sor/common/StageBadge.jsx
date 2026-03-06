import React from 'react';
import { getStageConfig } from '../../../utils/sor/candidateHelpers';
import '../../../styles/sor/components/StageBadge.css';

const StageBadge = ({ stage }) => {
  const config = getStageConfig(stage);
  return (
    <span className={`sor-badge sor-badge-${config.bg}`}>
      {config.label}
    </span>
  );
};

export default StageBadge;
