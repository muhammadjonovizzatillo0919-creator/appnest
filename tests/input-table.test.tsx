import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/core/Input";
import { Table } from "@/components/core/Table";

describe("Input", () => {
  it("label maydon bilan bog'lanadi (htmlFor/id)", () => {
    render(<Input label="Email" placeholder="a@b.com" />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("placeholder", "a@b.com");
    expect(input.tagName).toBe("INPUT");
  });

  it("qiymat o'zgarishida onChange chaqiriladi", async () => {
    const onChange = vi.fn();
    render(<Input label="Ism" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Ism"), "A");
    expect(onChange).toHaveBeenCalled();
  });

  it("xato holatda aria-invalid belgilanadi", () => {
    render(<Input label="Email" error="Email noto'g'ri" />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Email noto'g'ri")).toBeInTheDocument();
  });

  it("label berilmasa maydon ham bo'lmaydi", () => {
    render(<Input placeholder="Qidirish" />);
    expect(screen.getByPlaceholderText("Qidirish")).toBeInTheDocument();
  });
});

interface Row {
  id: number;
  name: string;
}

describe("Table", () => {
  const rows: Row[] = [
    { id: 1, name: "Alisher" },
    { id: 2, name: "Dilnoza" },
  ];

  it("sarlavhalarni chizadi", () => {
    render(
      <Table<Row>
        columns={[
          { key: "id", label: "ID", accessor: (r) => r.id },
          { key: "name", label: "Ism", accessor: (r) => r.name },
        ]}
        data={rows}
      />
    );

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Ism")).toBeInTheDocument();
  });

  it("ma'lumot qatorlarini chizadi", () => {
    render(
      <Table<Row>
        columns={[
          { key: "id", label: "ID", accessor: (r) => r.id },
          { key: "name", label: "Ism", accessor: (r) => r.name },
        ]}
        data={rows}
      />
    );

    expect(screen.getByText("Alisher")).toBeInTheDocument();
    expect(screen.getByText("Dilnoza")).toBeInTheDocument();
  });

  it("bo'sh holat matnini ko'rsatadi", () => {
    render(
      <Table<Row>
        columns={[{ key: "id", label: "ID", accessor: (r) => r.id }]}
        data={[]}
        emptyMessage="Ma'lumot topilmadi"
      />
    );

    expect(screen.getByText("Ma'lumot topilmadi")).toBeInTheDocument();
  });

  it("o'chirish tugmasi onDelete ni chaqiradi", async () => {
    const onDelete = vi.fn();
    render(
      <Table<Row>
        columns={[{ key: "name", label: "Ism", accessor: (r) => r.name }]}
        data={rows}
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getAllByText("O'chirish")[0]);
    expect(onDelete).toHaveBeenCalledWith(rows[0], 0);
  });
});
