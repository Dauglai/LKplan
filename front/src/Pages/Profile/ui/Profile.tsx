import { useAppSelector } from 'App/model/hooks.ts';

import {
  selectCurrentUser,
  selectCurrentToken,
} from 'Features/Auth/model/authSlice.ts';

export default function Profile(): JSX.Element {
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectCurrentToken);

  return (
    <>
      <h1>{JSON.stringify(user)}</h1>
      <h1>{token}</h1>
    </>
  );
}
