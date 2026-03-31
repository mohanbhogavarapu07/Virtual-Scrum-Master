import { useNavigate } from "react-router-dom";

export const useActionHandler = () => {
  const navigate = useNavigate();

  const handleAction = (action?: string, target?: string, highlight?: string) => {
    if (action === "NAVIGATE" && target) {
      navigate(target);
    }
    
    if (highlight) {
      // Small delay to ensure navigation finishes if both are present
      setTimeout(() => {
        const element = document.getElementById(highlight) || document.querySelector(`.${highlight}`);
        if (element) {
          element.classList.add("highlight-glow");
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            element.classList.remove("highlight-glow");
          }, 3000); // Remove after 3s
        }
      }, 300);
    }
  };

  return { handleAction };
};
