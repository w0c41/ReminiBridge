// next_service/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Logo from "./components/Logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Remini Bridge",
  description: "Remini API Management and Proxy",
  icons: {
    icon: "/bridge.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body className={inter.className}>           
          <Logo className="logo" />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
