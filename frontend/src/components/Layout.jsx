import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingBag, TrendingUp, Map, BookOpen, LogOut, Sprout, User } from 'lucide-react';
import Tooltip from './Tooltip';
import styles from './Layout.module.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tooltip: 'Visão geral do seu negócio', end: true },
  { to: '/dashboard/produtos', icon: Package, label: 'Produtos', tooltip: 'Gerencie seus produtos e serviços' },
  { to: '/dashboard/clientes', icon: Users, label: 'Clientes', tooltip: 'Gerencie sua base de clientes' },
  { to: '/dashboard/vendas', icon: ShoppingBag, label: 'Vendas', tooltip: 'Registre vendas e controle fiados' },
  { to: '/dashboard/fluxo', icon: TrendingUp, label: 'Fluxo de Caixa', tooltip: 'Entradas e saídas do seu caixa' },
  { to: '/dashboard/capacitacao', icon: BookOpen, label: 'Capacitação', tooltip: 'Aprenda a gerir melhor seu negócio' },
  { to: '/dashboard/perfil', icon: User, label: 'Meu Perfil', tooltip: 'Edite suas informações e localização' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Sprout size={24} />
          <span>Cultiva</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, tooltip, end }) => (
            <Tooltip key={to} texto={tooltip} posicao="right">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </Tooltip>
          ))}
          <Tooltip texto="Ver sua vitrine pública" posicao="right">
            <NavLink to="/vitrine" target="_blank" className={styles.navItem}>
              <Map size={18} />
              <span>Vitrine</span>
            </NavLink>
          </Tooltip>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nome_negocio || usuario?.nome}</span>
            <span className={styles.userEmail}>{usuario?.email}</span>
          </div>
          <Tooltip texto="Sair da conta" posicao="right">
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={16} />
            </button>
          </Tooltip>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}