import './globals.css'; // Sizning CSS faylingiz
import { UserProvider } from "../context/UserContext";

export const metadata = {
  title: 'AppNest Admin Panel',
  description: 'Professional Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>
        {/* Butun ilovani Provider ichiga oldik */}
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}