import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
    <Link to="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
  </div>
);

export default NotFound;