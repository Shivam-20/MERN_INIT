import { NavLink as RouterNavLink } from 'react-router-dom';

const NavLink = ({
  to,
  children,
  className = '',
  activeClassName = '',
  inactiveClassName = '',
  exact = false,
  ...props
}) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `${className} ${isActive ? activeClassName : inactiveClassName}`
      }
      end={exact}
      {...props}
    >
      {children}
    </RouterNavLink>
  );
};

export default NavLink;
