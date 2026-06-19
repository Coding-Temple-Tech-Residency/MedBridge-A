interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 60 }) => {
  return (
    <img
      src="/logo.png"
      alt="MedBridge logo"
      width={size}
      height={size}
      style={{
        objectFit: 'contain',
        mixBlendMode: 'multiply',
      }}
      className="select-none"
    />
  );
};

export default Logo;
