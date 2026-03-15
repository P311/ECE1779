"use client";

import { useState } from "react";
import { Source } from "../types";

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


export default function SourceTable({ sources }: { sources: Source[] }) {
  const [searchField, setSearchField] = useState<string>("id");
  const [searchValue, setSearchValue] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  function search() {
    // TODO: API interaction
    console.log("Search clicked with field:", searchField, "and query:", searchValue);
  }

  function processValue(value: any) {
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
              {Object.keys(sources[0] || {}).map((key) => (
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
              {Object.keys(sources[0] || {}).map((key) => (
                <TableHead key={key}>
                  {key}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id} className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setSelectedSource(source)}>
                {Object.entries(source).map(([key, value]) => (
                  <TableCell key={key}>
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

      <Dialog open={!!selectedSource} onOpenChange={(open) => { if (!open) setSelectedSource(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Source Details</DialogTitle>
          </DialogHeader>
          {selectedSource && (
            <div className="space-y-4 mt-4">
              {Object.entries(selectedSource).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{key}</p>
                  <div>
                    {typeof value === "object" ? (
                      <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-sm">{String(value)}</span>
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
