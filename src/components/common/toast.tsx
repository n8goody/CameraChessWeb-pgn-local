import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { gameSelect, gameSetError } from "../../slices/gameSlice";
import { Game } from "../../types";

const Toast = () => {
  const game: Game = gameSelect();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(gameSetError(null));
      setShow(false);
    }, 300);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (game.error) {
      setShow(true);
      setVisible(true);
      timer = setTimeout(dismiss, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [game.error]);

  if (!show || !game.error) return null;

  return (
    <div
      className="position-fixed top-0 end-0 m-3"
      style={{ zIndex: 9999 }}
    >
      <div
        className="toast show"
        role="alert"
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div className="toast-body d-flex justify-content-between align-items-center">
          {game.error}
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={dismiss}
            style={{ filter: "invert(1)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;