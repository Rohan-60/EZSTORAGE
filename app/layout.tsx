import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { Providers } from './providers'

export const metadata: Metadata = {
    title: 'EZSTORAGE - Operations Management System',
    description: 'Professional logistics and storage operations management platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: '#fff',
                                    color: '#262626',
                                    border: '1px solid #FDB913',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10B981',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </AuthProvider>
                </Providers>
            </body>
        </html>
    )
}
