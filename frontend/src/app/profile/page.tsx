"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineLogout } from "react-icons/hi";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-8">
          My Profile
        </h1>
        <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl font-bold text-amber-700 dark:text-amber-400 mb-6">
            {user.first_name?.[0] || user.username[0]}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-neutral-500">First Name</span>
                <p className="font-medium mt-0.5">{user.first_name || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Last Name</span>
                <p className="font-medium mt-0.5">{user.last_name || "—"}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-500">Username</span>
              <p className="font-medium mt-0.5">{user.username}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-500">Email</span>
              <p className="font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Link href="/orders">
              <Button variant="outline">My Orders</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2 !text-red-500">
              <HiOutlineLogout className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
