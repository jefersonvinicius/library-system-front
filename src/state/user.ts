import { User } from 'app/user';
import { atom, useRecoilState, AtomEffect, useRecoilValue, selector } from 'recoil';

const localStorageSync: AtomEffect<User | null> = ({ onSet, setSelf }) => {
  const savedUser = localStorage.getItem('@user');
  if (savedUser) setSelf(User.fromPlainObject(JSON.parse(savedUser)));

  onSet((newValue, _, isReset) => {
    if (isReset) localStorage.removeItem('@user');
    else localStorage.setItem('@user', JSON.stringify(newValue));
  });
};

const userAtom = atom<User | null>({
  key: 'user',
  default: null,
  effects: [localStorageSync],
});

export function useUser() {
  return useRecoilState(userAtom);
}

export function useUserGetter() {
  return useRecoilValue(userAtom);
}

const isLoggedInSelector = selector({
  key: 'isLoggedIn',
  get: ({ get }) => {
    const user = get(userAtom);
    return !!user;
  },
});

export function useIsUserLoggedIn() {
  const isUserLoggedIn = useRecoilValue(isLoggedInSelector);
  return { isUserLoggedIn };
}
