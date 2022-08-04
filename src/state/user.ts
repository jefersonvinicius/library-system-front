import { User } from 'app/user';
import { atom, useRecoilState } from 'recoil';

const user = atom<User | null>({
  key: 'user',
  default: null,
});

export function useUser() {
  return useRecoilState(user);
}
