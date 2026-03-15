import { useState } from "react";
import Modal from "./components/modal/Modal";

function App() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <button onClick={()=> setOpen(true)}>Open modal </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        The modal is open
      </Modal>
    </>
  );
}

export default App;
