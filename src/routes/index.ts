import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/root-layout'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { AssetsPage } from '@/pages/assets'
import { AssetCreatePage } from '@/pages/assets/create'
import { AssetEditPage } from '@/pages/assets/edit'
import { AvailabilityPage } from '@/pages/availability'

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

export const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  assetsRoute,
  assetCreateRoute,
  assetEditRoute,
  availabilityRoute,
])
