'use client'
import React, { useEffect, useState } from 'react';
import SideNav from '@/components/SideNav';
import Overview from './Overview';
import { useRouter } from 'next/navigation';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login page if no user data is found
      router.push("/auth/signin");
    }
  }, [router]);

  return (
    <>
      <div className="flex h-screen">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Overview />
        </div>
      </div>
    </>
  );
};

export default Dashboard;