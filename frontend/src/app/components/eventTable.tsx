"use client";

import { useState } from "react";
import { Event, SEVERITY_COLOR} from "../types";

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function EventTable({ events }: { events: Event[] }) {
  const [searchField, setSearchField] = useState<string>("id");
  const [searchValue, setSearchValue] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  function search() {
    // TODO: API interaction
    console.log("Search clicked with field:", searchField, "and query:", searchValue);
  }

  function processValue(value: any) {
    // stringfy json obj
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    if (typeof value === "string" && value.length > 20) {
      return value.slice(0, 20) + "...";
    }
    return String(value);
  }
  return (
    <div>
      <div className="flex-row ">
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(events[0] || {}).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <Button variant="outline" onClick={search}>
          Search
        </Button>
      </div>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(events[0] || {}).map((key) => (
                <TableHead>
                  {key}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setSelectedEvent(event)}>
                {Object.entries(event).map(([key, value]) => (
                  <TableCell key={key} style={{ color: key==="severity" ? SEVERITY_COLOR[event.severity] : undefined }}>
                    {processValue(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> 
      {/* TODO: Pagination from API*/}
      <div className="mt-4 flex-row justify-center">
        <Button variant="outline" size="sm">
          Previous
        </Button>
        <div className="text-md text-gray-500" style={{ alignContent: "center", margin: "0 1rem" }}>
          Page 1 of ?
        </div>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              {Object.entries(selectedEvent).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{key}</p>
                  <div>
                    {typeof value === "object" ? (
                      <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-sm" style={{ color: key === "severity" ? SEVERITY_COLOR[selectedEvent.severity] : undefined }}>
                        {String(value)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
