import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "./FormField/Button";

const handleKeyPress = (e, type) => {
  if (type === "number") {
    const input = e.key;
    const regex = /[0-9]/;
    if (input != "Enter" && !regex.test(input)) {
      e.preventDefault();
    }
  }
};

const ModalComponent = ({
  title = "",
  isOpen = true,
  message = "",
  cancelClick,
  yesClick,
  noClick,
  okClick,
  yesClickButtonTitle = "Yes",
  noClickButtonTitle = "No",
}) => {
  // const [openModal, setOpenModal] = useState(isOpen);

  return (
    <Modal show={isOpen} dialogClassName="my-modal" onEscapeKeyDown={okClick}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row no-gutters">
          <div
            style={{
              padding: "5px",
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: message,
              }}
            ></div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex flex-row justify-content-center">
          {okClick && (
            <Button autoFocus isTable={true} text={"Close"} onClick={okClick} />
          )}
          {noClick && <Button text={noClickButtonTitle} onClick={noClick} />}
          {yesClick && <Button text={yesClickButtonTitle} onClick={yesClick} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;
