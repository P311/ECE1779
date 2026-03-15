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
              <TableRow key={event.id} className="hover:bg-gray-100 hover:cursor-pointer">
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
    </div>
  );
}
