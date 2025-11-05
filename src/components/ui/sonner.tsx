import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = "light";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--green-3)",
          "--success-text": "var(--green-11)",
          "--success-border": "var(--green-7)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
