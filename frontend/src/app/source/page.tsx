"use client";

import { useState } from "react";
import SourceTable from "../components/sourceTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePolling } from "@/hooks/usePolling";
import { apiRequest } from "@/utils/api";
import { Source } from "../types";

export default function SourcePage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: sources } = usePolling<Source[]>("/api/v1/sources");

  const handleSubmit = async () => {
    const body = { name, description };
    await apiRequest("/api/v1/sources", "POST", body);
    setOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <main className="page-container">
      <div className="flex items-center justify-between">
        <h1>Sources</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Source</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. web-app"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Primary web application"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <SourceTable sources={sources ?? []} />
      </div>
    </main>
  );
}
