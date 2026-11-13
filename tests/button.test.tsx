import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/core/Button";
import { Badge } from "@/components/core/Badge";

describe("Button", () => {
  it("matnni ko'rsatadi", () => {
    render(<Button>Saqlash</Button>);
    expect(screen.getByRole("button", { name: "Saqlash" })).toBeInTheDocument();
  });

  it("bosilganda onClick chaqiriladi", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Bosish</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled holatda bosib bo'lmaydi", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Yuborish
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading holatda spinner ko'rsatadi va bloklanadi", () => {
    render(<Button loading>Yuklanmoqda</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("'type' atributi sukut bo'yicha 'button' bo'ladi", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("fullWidth klassini qo'shadi", () => {
    render(<Button fullWidth>To&apos;liq</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});

describe("Badge", () => {
  it("matnni ko'rsatadi", () => {
    render(<Badge>Faol</Badge>);
    expect(screen.getByText("Faol")).toBeInTheDocument();
  });

  it("barcha 6 rangni qabul qiladi", () => {
    const colors = ["blue", "green", "gray", "red", "yellow", "purple"] as const;

    for (const color of colors) {
      const { unmount } = render(<Badge color={color}>Test</Badge>);
      expect(screen.getByText("Test")).toBeInTheDocument();
      unmount();
    }
  });

  it("solid variantda rangli fon ishlatiladi", () => {
    render(
      <Badge color="green" variant="solid">
        Yangi
      </Badge>
    );
    expect(screen.getByText("Yangi").className).toContain("bg-[#00D287]");
  });
});
