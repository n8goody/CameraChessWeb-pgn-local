import { useNavigate } from "react-router-dom";
import { userSelect } from "../../slices/userSlice";

interface NavButtonProps {
  text: string;
  tokenRequired: boolean;
  path?: string; 
}

// 1. We now pull 'path' into the component and apply the NavButtonProps type
const NavButton = ({ text, tokenRequired, path }: NavButtonProps) => {
  const navigate = useNavigate();
  const token = userSelect().token;

  const noNavigate = (token === "") && tokenRequired;

  const handleClick = () => {
    if (noNavigate) {
      return;
    }
    
    // 2. This will now successfully read the path property!
    const routeTarget = path ? path : text.toLowerCase();
    navigate(`/${routeTarget}`);
  }

  return (
    <button 
      className="btn btn-dark btn-lg btn-outline-light w-100" 
      onClick={handleClick}
    > 
      {noNavigate ? `${text} (must Login)` : `${text}`}
    </button>
  )
}

export default NavButton;