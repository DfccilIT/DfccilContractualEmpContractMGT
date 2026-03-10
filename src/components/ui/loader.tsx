import { logo } from '@/assets/image/images';

const Loader = () => {
  return (
    <div className="page-loader">
      <div className="loader">
        <div>
          <img src={logo} className="h-16 w-auto " alt="Logo" />
        </div>
        <div className="loader-container">
          <div className="dot-loader"></div>
          <div className="dot-loader"></div>
          <div className="dot-loader"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
