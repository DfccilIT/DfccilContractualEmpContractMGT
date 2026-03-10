import classNames from 'clsx';

type HeadingType = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  type?: HeadingType;
  className?: string;
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ type = 1, children, className }) => {
  switch (type) {
    case 1:
      return (
        <h1
          className={classNames(
            className,
            'font-heading scroll-m-20 text-2xl font-bold tracking-tight dark:text-white sm:text-3xl '
          )}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={classNames(
            'font-heading scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0 sm:text-2xl',
            className
          )}
        >
          {children}
        </h2>
      );
    case 3:
      return (
        <h3
          className={classNames(
            'font-heading scroll-m-20 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl',
            className
          )}
        >
          {children}
        </h3>
      );
    case 4:
      return (
        <h4
          className={classNames(
            'font-heading scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl',
            className
          )}
        >
          {children}
        </h4>
      );
    case 5:
      return (
        <h5 className={classNames('scroll-m-20 font-heading text-lg font-medium sm:text-xl md:text-2xl', className)}>
          {children}
        </h5>
      );
    case 6:
      return (
        <h6 className={classNames('scroll-m-20 font-heading text-base font-medium sm:text-lg md:text-xl', className)}>
          {children}
        </h6>
      );
    default:
      return (
        <h1
          className={classNames(
            'font-heading scroll-m-20 text-4xl font-bold tracking-tight dark:text-white sm:text-5xl md:text-6xl',
            className
          )}
        >
          {children}
        </h1>
      );
  }
};

export default Heading;
