"use client";
import styles from "./page.module.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usersQuery } from "@/lib/api-queries";
import { Button } from "@/components/ui/button";
import { UserFilters } from "@/app/users/_components/user-filters";
import { UserTable } from "@/app/users/_components/user-table";
export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const result = useQuery(usersQuery(search, status === "all" ? "" : status));
  const users = result.data?.users || [];
  const total = result.data?.total || 0;
  const busy = result.isFetching;
  const error = result.error?.message || "";
  return (
    <main className={`users-page ${styles.page}`}>
      <header className="heading">
        <div>
          <div className="eyebrow">LINE OFFICIAL ACCOUNT</div>
          <h1>
            Users <span className="count">{total}</span>
          </h1>
          <p>รายชื่อผู้ใช้และสถานะการเพิ่มเพื่อนของบัญชีนี้</p>
        </div>
        <Button variant="outline" disabled={busy} onClick={() => void result.refetch()}>
          รีเฟรช
        </Button>
      </header>
      <section className={`users-panel ${styles.panel}`}>
        <UserFilters query={query} status={status} onQueryChange={setQuery} onStatusChange={setStatus} />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <UserTable users={users} busy={busy} error={error} query={query} status={status} />
        <p className="users-note">“ไม่ทราบสถานะ” หมายถึงระบบยังไม่มี event เพิ่มเพื่อนหรือบล็อกของผู้ใช้นั้น</p>
      </section>
    </main>
  );
}
