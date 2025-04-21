import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const defineAbilitiesFor = (role) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  role = role?.toLowerCase();

  if (role === 'admin') {
    can('manage', 'Users');
    can('manage', 'Department');
    can('view', 'LeaveStatus');
    can('view', 'OwnTime');
  } else if (role === 'employee') {
    can('view', 'OwnTime');
    can('request', 'Leave');
    can('view', 'LeaveStatus');
  }

  return build();
};
