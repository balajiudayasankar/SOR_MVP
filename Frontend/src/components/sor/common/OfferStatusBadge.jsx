import React from 'react';
import { getStatusConfig } from '../../../utils/sor/offerHelpers';
import '../../../styles/sor/components/OfferStatusBadge.css';

const OfferStatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <span className={`sor-badge sor-badge-${config.bg}`}>
      {config.label}
    </span>
  );
};

export default OfferStatusBadge;
