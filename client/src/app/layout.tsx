import { ApolloClientProvider } from '@/lib/apollo-client';
import { ProjectProvider } from '@/contexts/ProjectContext';
import './globals.css';

export const metadata = {
  title: 'Team Flow',
  description: 'Team collaboration and project management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloClientProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
