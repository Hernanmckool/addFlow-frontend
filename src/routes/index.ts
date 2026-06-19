import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/root-layout'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { AssetsPage } from '@/pages/assets'
import { AssetCreatePage } from '@/pages/assets/create'
import { AssetEditPage } from '@/pages/assets/edit'
import { AvailabilityPage } from '@/pages/availability'
import { ReservationsPage } from '@/pages/reservations'
import { ReservationCreatePage } from '@/pages/reservations/create'
import { QuotationsPage } from '@/pages/quotations'
import { QuotationCreatePage } from '@/pages/quotations/create'
import { QuotationShowPage } from '@/pages/quotations/show'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets',
  component: AssetsPage,
})

const assetCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets/create',
  component: AssetCreatePage,
})

const assetEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets/$assetId/edit',
  component: AssetEditPage,
})

const availabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disponibilidad',
  component: AvailabilityPage,
})

const reservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reservas',
  component: ReservationsPage,
})

const reservationCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reservas/crear',
  component: ReservationCreatePage,
})

const quotationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cotizaciones',
  component: QuotationsPage,
})

const quotationCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cotizaciones/crear',
  component: QuotationCreatePage,
})

const quotationShowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cotizaciones/$quotationId',
  component: QuotationShowPage,
})

export const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  assetsRoute,
  assetCreateRoute,
  assetEditRoute,
  availabilityRoute,
  reservationsRoute,
  reservationCreateRoute,
  quotationsRoute,
  quotationCreateRoute,
  quotationShowRoute,
])
