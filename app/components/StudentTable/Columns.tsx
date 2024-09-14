"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type StudentData = {
  
  name: string;
  Id: string;
  email: string;
  PDFURL: string;
};

export const columns: ColumnDef<StudentData>[] = [
 
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "Id",
    header: "Id",
  },
  {
    accessorKey: "email",
    header: "Email",

  },
  {
    accessorKey: "PDFURL",
    header: "PDFURL",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.email)}
            >
              Copy Student Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View student</DropdownMenuItem>
            <DropdownMenuItem>View Student Copy</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]