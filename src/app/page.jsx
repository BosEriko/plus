'use client';

import Template from '@template';
import useAuthStore from '@stores/useAuthStore';

export default function Home() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="text-gray-600 p-4">Loading...</div>;
  }

  if (user) {
    return (
      <Template.Dashboard>
        <div className="container mx-auto my-4">
          Dashboard
        </div>
      </Template.Dashboard>
    );
  }

  return (
    <Template.Landing>
      <div className="container mx-auto my-4">
        Landing Page
      </div>
    </Template.Landing>
  );
}
