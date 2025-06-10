/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  // return requestClient.get<UserInfo>('/user/info');
  const id = localStorage.getItem('id');
  const result =
    id === '1'
      ? {
          /**
           * 用户描述
           */
          desc: 'admin',
          /**
           * 首页地址
           */
          homePath: '',
          /**
           * 用户ID
           */
          id: '1',
          /**
           * 权限列表
           */
          permissions: ['admin', 'user'],
          /**
           * 角色列表
           */
          roles: ['admin', 'user'],
          /**
           * accessToken
           */
          token: 'wwwwwwwww',
        }
      : {
          /**
           * 用户描述
           */
          desc: 'admin',
          /**
           * 首页地址
           */
          homePath: '',
          /**
           * 用户ID
           */
          id: '1',
          /**
           * 权限列表
           */
          permissions: [],
          /**
           * 角色列表
           */
          roles: [],
          /**
           * accessToken
           */
          token: 'wwwwwwwww',
        };
  return result;
  return {
    /**
     * 用户描述
     */
    desc: 'admin',
    /**
     * 首页地址
     */
    homePath: '',
    /**
     * 用户ID
     */
    id: '1',
    /**
     * 权限列表
     */
    permissions: ['admin', 'user'],
    /**
     * 角色列表
     */
    roles: ['admin', 'user'],
    /**
     * accessToken
     */
    token: 'wwwwwwwww',
  };
  // 由于缺少对应的 if 语句，这里无法直接保留 else，暂时注释掉
  // } else {
  return {
    /**
     * 用户描述
     */
    desc: 'admin',
    /**
     * 首页地址
     */
    homePath: '',
    /**
     * 用户ID
     */
    id: '1',
    /**
     * 权限列表
     */
    permissions: [],
    /**
     * 角色列表
     */
    roles: [],
    /**
     * accessToken
     */
    token: 'wwwwwwwww',
  };
}
