import { User } from 'app/user';
import { atom, useRecoilState, AtomEffect } from 'recoil';

const localStorageSync: AtomEffect<User | null> = ({ onSet, setSelf }) => {
  const savedUser = localStorage.getItem('@user');
  if (savedUser) setSelf(User.fromPlainObject(JSON.parse(savedUser)));

  onSet((newValue, _, isReset) => {
    if (isReset) localStorage.removeItem('@user');
    else localStorage.setItem('@user', JSON.stringify(newValue));
  });
};

const user = atom<User | null>({
  key: 'user',
  default: null,
  effects: [localStorageSync],
});

export function useUser() {
  return useRecoilState(user);
}
