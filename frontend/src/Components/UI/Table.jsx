import React from "react";

const projects = [
  {
    name: "sample",
    region: "AWS Asia Pacific 1 (Singapore)",
    createdAt: "Jun 22, 2025 8:48 am",
    storage: "33.13 MB",
    pgVersion: "17",
  },
  {
    name: "TenderUday",
    region: "AWS Asia Pacific 1 (Singapore)",
    createdAt: "Mar 23, 2025 5:53 pm",
    storage: "31.06 MB",
    pgVersion: "17",
  },
  {
    name: "online_tender_m...",
    region: "AWS Asia Pacific 1 (Singapore)",
    createdAt: "Feb 23, 2025 6:00 pm",
    storage: "31.07 MB",
    pgVersion: "17",
  },
  {
    name: "aipdf_bot",
    region: "Azure East US 2 (Virginia)",
    createdAt: "Jan 17, 2025 8:02 am",
    storage: "34.36 MB",
    pgVersion: "17",
  },
  {
    name: "sample",
    region: "AWS Asia Pacific 1 (Singapore)",
    createdAt: "Jan 5, 2025 12:09 pm",
    storage: "30.81 MB",
    pgVersion: "16",
  },
];

const Table = () => {
  return (
    <div className="overflow-x-auto mt-6 text-white">
      <table className=" w-full border border-[var(--border-color)] text-sm">
        <thead className="border-b border-[var(--secondary-color)] bg-[var(--accent-color)] text-left text-[var(--secondary-color)]">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Created At</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj, idx) => (
            <tr
              key={idx}
              className="border-t border-[var(--border-color)] hover:bg-[var(--accent-color)]"
            >
              <td className="px-4 py-4">{proj.name}</td>
              <td className="px-4 py-4">{proj.region}</td>
              <td className="px-4 py-4">{proj.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
