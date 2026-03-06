import React from 'react';
import { getTypeConfig } from '../../../utils/sor/offerHelpers';

const OfferTypeBadge = ({ offerType }) => {
  const config = getTypeConfig(offerType);
  return (
    <span className={`sor-badge sor-badge-${config.bg}`}>
      {config.label}
    </span>
  );
};

export default OfferTypeBadge;
