import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingBag, TrendingUp, Map, BookOpen, LogOut, Sprout } from 'lucide-react';
import styles from './Layout.module.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/vendas', icon: ShoppingBag, label: 'Vendas' },
  { to: '/fluxo', icon: TrendingUp, label: 'Fluxo de Caixa' },
  { to: '/capacitacao', icon: BookOpen, label: 'Capacitação' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Sprout size={24} />
          <span>Cultiva</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/vitrine" target="_blank" className={styles.navItem}>
            <Map size={18} />
            <span>Vitrine</span>
          </NavLink>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nome_negocio || usuario?.nome}</span>
            <span className={styles.userEmail}>{usuario?.email}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}