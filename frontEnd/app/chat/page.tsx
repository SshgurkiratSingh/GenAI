"use client"; // Add this at the top

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import Link from "next/link"; 

const ExampleTable = () => {
  return (
    <div>
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>Chat title</TableColumn>
          <TableColumn>File name</TableColumn>
          <TableColumn>Continue Chat</TableColumn>
          <TableColumn>Delete Chat</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>1</TableCell>
            <TableCell>CEO</TableCell>
            <TableCell>
              <Link href="/continue-chat">
                <button>Continue</button>
              </Link>
            </TableCell>
            <TableCell>
              <Link href="/delete-chat">
                <button>Delete</button>
              </Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default ExampleTable;
