import { baseRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  if (data.username === 'mwmshuaibi' && data.password === 'mwmshuaibi') {
    // 测试账号
    localStorage.setItem('id', '0');
    return {
      accessToken: 'admin',
    };
  } else {
    let accessToken = '';
    await fetch('https://ems-api.szslxn.com/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginId: data.username,
        plaintextPassword: data.password,
      }),
    })
      .then((response) => response.json())
      .then((res) => (accessToken = res.token));
    localStorage.setItem('id', '1');
    return {
      accessToken,
    };
  }
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  // return requestClient.get<string[]>('/auth/codes');
  return ['admin'];
}
