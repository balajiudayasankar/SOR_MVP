export const SOR_BASE_URL = 'http://localhost:5082/api/v1';

export const NOTIFICATION_POLL_INTERVAL = 30000;

export const AUDIT_PAGE_SIZE = 10;

export const PAY_FREQUENCY_OPTIONS = [
  { value: 1, label: 'Monthly'           },
  { value: 2, label: 'Bi-Monthly'        },
  { value: 3, label: 'Weekly'            },
  { value: 4, label: 'End of Internship' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 1, label: 'Permanent'  },
  { value: 2, label: 'Contract'   },
  { value: 3, label: 'Part-Time'  },
];

export const SOR_ROLES = {
  HR:             'HR',
  HR_HEAD:        'HRHead',
  ADMIN:          'Admin',
  HIRING_MANAGER: 'HiringManager',
  FINANCE:        'Finance',
  MANAGER:        'Manager',
};
