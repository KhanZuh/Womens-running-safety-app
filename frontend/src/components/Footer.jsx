import logo from '../assets/logo-light-grey-just-shoe.png';

const Footer = () => {

    return (

        <footer className="footer footer-center bg-base-100 text-base-content p-4">
            <aside className="flex items-center gap-2">
                <img src={logo} alt="SafeRun logo" className="w-6" />
                <p className='text-xs'>Copyright © {new Date().getFullYear()} - All right reserved by SAFERUN Ltd</p>
            </aside>
        </footer>

    );
};

export default Footer;