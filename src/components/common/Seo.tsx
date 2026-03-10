import { Helmet } from 'react-helmet';

interface SeoProps {
  title: string;
  description?: string;
}

const Seo: React.FC<SeoProps> = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default Seo;
