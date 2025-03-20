import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'arcticons:openai-chatgpt',
      title: $t('page.ai.title'),
    },
    name: 'Ai',
    path: '/ai',
    redirect: '/ai/index',
    children: [
      {
        name: 'AiIndex',
        path: '/ai/index',
        component: () => import('#/views/ai/index.vue'),
        meta: {
          icon: 'carbon:3d-print-mesh',
          title: $t('page.ai.chat'),
        },
      },
    ],
  },
];

export default routes;
