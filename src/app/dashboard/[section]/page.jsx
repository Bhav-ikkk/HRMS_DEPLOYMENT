'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';

const SectionComponents = {
  employee: dynamic(() => import('@/app/dashboard/_sections/employee')),
  department: dynamic(() => import('@/app/dashboard/_sections/department')),
  time_status: dynamic(() => import('@/app/dashboard/_sections/time_status')),
  leave_request: dynamic(() => import('@/app/dashboard/_sections/leave_request')),
   approve: dynamic(() => import('@/app/dashboard/_sections/approve')),
  profile: dynamic(() => import('@/app/dashboard/_sections/profile')),

};

export default function DashboardSectionPage() {
  const { section } = useParams();
  const router = useRouter();

  if (section === 'logout') {
    router.push('/login');
    return null;
  }

  const Component = SectionComponents[section];
  if (!Component) return <p>404: Section not found</p>;

  return <Component />;
}
