import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import "./globals.css";
import styles from "./page.module.css";
import Navbar from "./components/Navbar";
import AuthProvider from "./context/AuthProvider";
//import "../../public/fonts/VerminVibes.ttf";

const inter = Inter({ subsets: ["latin"] });

// Font files can be colocated inside of `pages`
const myFont = localFont({ src: "../../public/fonts/TinyIslanders.ttf" });

export const metadata: Metadata = {
  title: "Arkanoid",
  description: "Just an Arkanoid game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${myFont.className}`}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <Navbar />
              <main className={styles.main}>{children}</main>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
