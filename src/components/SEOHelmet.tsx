import { Helmet } from "react-helmet-async";

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHelmet = ({ 
  title = "BexMatch - Find Your Perfect Match",
  description = "Discover meaningful connections with people who share your interests. Swipe, match, and start conversations that could last a lifetime. Join millions finding love on BexMatch.",
  keywords = "dating app, find love, relationships, singles, matchmaking, meet people, online dating, BexMatch",
  image = "https://bexmatch.com/og-image.png",
  url = "https://bexmatch.com",
  type = "website"
}: SEOHelmetProps) => {
  const fullTitle = title.includes("BexMatch") ? title : `${title} | BexMatch`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="BexMatch" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BexMatch" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHelmet;
