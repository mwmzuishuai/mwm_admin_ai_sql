import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/',
    children: [
      {
        name: 'Alarms',
        path: '/alarms',
        component: () => import('#/views/data-download/alarm/index.vue'),
        meta: {
          affixTab: true,
          icon: 'bx:bookmark-plus',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Sqldata',
        path: '/sqldata',
        component: () => import('#/views/data-download/sql-data/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
