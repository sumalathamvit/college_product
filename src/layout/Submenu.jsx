// SubMenu.js

import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import storage from "../auth/storage";
import AuthContext from "../auth/context";
import { Modal } from "react-bootstrap";
import Button from "./../component/FormField/Button";
import { useNavigate } from "react-router-dom";
import Icon from "../component/Icon";

function SubMenu({ data, onClick }) {
  const navigate = useNavigate();
  const { setSubMenu, setUnSavedChanges, subTitle } = useContext(AuthContext);

  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = async (data) => {
    setSubMenu([]);
    storage.storeMenuData(data.subData);
    setSubMenu(data.subData);
    navigate(data.subData[0].link);
  };

  const handleLinkGroupClick = (data, index) => {
    console.log("data", data);
    console.log("save--", JSON.parse(sessionStorage.getItem("unSavedChanges")));
    if (JSON.parse(sessionStorage.getItem("unSavedChanges"))) {
      setOpenModal(true);
      setSelectedIndex(index);
      setLinkToNavigate(data);
      return;
    }
    onClick(index);

    handleSelect(data);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    // Update device type based on media query match
    const handleDeviceChange = (e) => {
      setIsMobile(e.matches);
    };

    // Initial check
    handleDeviceChange(mediaQuery);

    // Listen for changes in the media query
    mediaQuery.addListener(handleDeviceChange);

    // Cleanup
    return () => mediaQuery.removeListener(handleDeviceChange);
  }, []);

  return (
    <>
      {isMobile ? (
        <ul className="sub-menu">
          {data &&
            data.map((item, index) => {
              return (
                <>
                  <li>
                    <a>{item.title}</a>

                    <ul className="sub-sub-menu">
                      {item.subData &&
                        item.subData.map((item, index) => {
                          return (
                            <>
                              <Link
                                to={item.link}
                                className={
                                  location.pathname === item.link
                                    ? "list-group-item list-group-item-action active"
                                    : "list-group-item list-group-item-action "
                                }
                                aria-current="true"
                              >
                                <li>
                                  <a>{item.title}</a>
                                </li>
                              </Link>

                              <hr />
                            </>
                          );
                        })}
                    </ul>
                  </li>
                  <hr />
                </>
              );
            })}
        </ul>
      ) : (
        <ul className="sub-menu" style={{ marginTop: 10 }}>
          {data &&
            data.map((item, index) => {
              return (
                <>
                  <li
                    key={index}
                    onClick={() => {
                      handleLinkGroupClick(item, index);
                    }}
                  >
                    <a
                      className={
                        subTitle === item.subTitleID ? "active-menu" : ""
                      }
                    >
                      {item.title}
                      {item.subData.length > 1 && (
                        <Icon
                          iconName={"KeyboardArrowRight"}
                          color={"#cbd6eb"}
                          fontSize={"small"}
                          style={{ float: "right", marginRight: -5 }}
                        />
                      )}
                    </a>
                  </li>
                  <hr />
                </>
              );
            })}
        </ul>
      )}
      <Modal
        show={openModal}
        dialogClassName="my-modal"
        onEscapeKeyDown={(e) => setOpenModal(false)}
      >
        <Modal.Header>
          <Modal.Title>Leave Page?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="">
            Changes you made may not be saved. Are you sure you want to leave
            this page?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            text="Yes"
            frmButton={false}
            onClick={() => {
              setOpenModal(false);
              setUnSavedChanges(false);
              if (linkToNavigate) {
                sessionStorage.setItem("unSavedChanges", false);
                setUnSavedChanges(false);
                onClick(selectedIndex);
                handleSelect(linkToNavigate); // Navigate to the stored link
              }
            }}
          />
          &nbsp;&nbsp;
          <Button
            autoFocus
            text="No"
            frmButton={false}
            onClick={() => {
              setOpenModal(false);
            }}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SubMenu;
