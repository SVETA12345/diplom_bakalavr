import './Header.css';
import logo from '../../images/header_logo.jpg'
import { Link } from 'react-router-dom'; 

function Header(props) {
  return (
      <header className={props.isBlue ? 'header header_blue' : 'header'}>
        <div className='header__another-link'>
        <Link className='header__glavn' to ='/'>
            <img src={logo} alt='logo' className='header__logo'></img>
            <p className='header__parag'>Конструктор тестов</p>
        </Link>
        {props.children}
        </div>
      </header>
  );
}

export default Header;