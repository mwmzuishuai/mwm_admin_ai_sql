import { requestClient } from '#/api/request';

export async function getSnList(params: any) {
  const res = await requestClient.get('/devices/ess', { params });
  return res;
}
export async function getAlarm(params: any) {
  const res = await requestClient.get('/ess/alarm', { params });
  return res;
}
