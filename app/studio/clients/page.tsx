"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/PayModal";
import { I } from "@/components/icons";
import { todayISO, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Client } from "@/lib/types";

const blank = (): Client => ({
  id: uid("cl"),
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  createdAt: todayISO(),
});

export default function ClientsPage() {
  const { state, saveClient, deleteClient } = useStore();
  const [editing, setEditing] = useState<Client | null>(null);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl">Clients</h1>
          <p className="mt-1 text-sm text-muted">
            People, brands, and companies you invoice.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setEditing(blank())}>
          {I.plus({ size: 16 })} New client
        </button>
      </div>

      {editing && (
        <form
          className="mt-8 grid gap-3 rounded-2xl border border-line bg-bg2 p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveClient(editing);
            setEditing(null);
          }}
        >
          {(
            [
              ["name", "Name"],
              ["company", "Company"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["address", "Address"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span className="label">{label}</span>
              <input
                className="field"
                value={editing[key]}
                onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                required={key === "name"}
              />
            </label>
          ))}
          <label className="sm:col-span-2">
            <span className="label">Notes</span>
            <textarea
              className="field min-h-20"
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-gold" type="submit">
              Save client
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {state.clients.length === 0 && !editing ? (
        <div className="mt-10">
          <EmptyState
            title="No clients"
            copy="Add a person or a company. You can invoice either."
            action={
              <button className="btn btn-gold" onClick={() => setEditing(blank())}>
                Add client
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line">
          {state.clients.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p>{c.name}</p>
                <p className="text-sm text-muted">
                  {c.company || "Independent"} · {c.email}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost !py-1.5" onClick={() => setEditing(c)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger !py-1.5"
                  onClick={() => deleteClient(c.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
