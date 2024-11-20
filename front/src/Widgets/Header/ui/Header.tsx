import './Header.scss';

import LogoIcon from 'assets/LogoIcon.svg?react';

export default function Header(): JSX.Element {
  return (
    <div className="GlobalHeader">
      <LogoIcon />
    </div>
  );
}
