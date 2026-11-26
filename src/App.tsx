import { Route, Routes } from 'react-router'
import { AuthProvider } from '@/auth/AuthProvider'
import { HomeRedirect, PublicOnly, RequireAuth, RequireRole } from '@/auth/guards'
import { Layout } from '@/components/Layout'
import { ToastProvider } from '@/components/ToastProvider'
import { AdminPage } from '@/pages/AdminPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'

// El <BrowserRouter> vive en main.tsx (y los tests usan MemoryRouter).
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomeRedirect />} />
            <Route element={<PublicOnly />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegisterPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="perfil" element={<ProfilePage />} />
              <Route element={<RequireRole role="ADMIN" />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
