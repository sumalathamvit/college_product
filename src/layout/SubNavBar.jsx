import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

import storage from "../auth/storage";
import AuthContext from "../auth/context";

import LinkGroup from "../component/common/LinkGroup";
import Icon from "../component/Icon";
import Button from "../component/FormField/Button";

import string from "../string";

function SubNavBar() {
  const { subMenu } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focusIndex, setFocusIndex] = useState(-1);

  const collegeConfig = useSelector((state) => state.web.college);

  const { unSavedChanges, setUnSavedChanges, collegeId, instituteArray, role } =
    useContext(AuthContext);

  const billAccess = sessionStorage.getItem("BILL_ACCESS");

  const getData = async () => {
    try {
      const storedMenuData = storage.getMenuData();
      setData(storedMenuData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLinkGroupClick = (link) => {
    if (
      JSON.parse(sessionStorage.getItem("unSavedChanges")) &&
      link !== location.pathname
    ) {
      setOpenModal(true);
      setLinkToNavigate(link);
      return;
    }
  };

  useEffect(() => {
    getData();
  }, [subMenu]);

  const mainMenuFocus = () => {
    data.forEach((item) => {
      if (item.subMenu) {
        item.subMenu.forEach((subItem) => {
          if (subItem.link === location.pathname) {
            setFocusIndex(data.indexOf(item));
            setSelectedIndex(data.indexOf(item));
          }
        });
      }
    });
  };

  useEffect(() => {
    mainMenuFocus();
  }, [location.pathname, data]);

  return (
    <div id="SideNavBar" className="menulistshow navbarvertical">
      {/* <div style={{ backgroundColor: "#2455b7", height: "100%" }}> */}
      <div className="p-3 text-center">
        <a href="/">
          <img
            src={
              instituteArray.length > 0
                ? (collegeConfig.common_cashier == 1 && billAccess == 1) ||
                  role == "SuperAdmin"
                  ? instituteArray.find((obj) => obj.collegeID == 0)
                      ?.header_logo
                  : instituteArray.find((obj) => obj.collegeID == collegeId)
                      ?.header_logo
                : require("../assests/png/header-logo.png")
            }
            alt={
              instituteArray.length > 0
                ? instituteArray.find((obj) => obj.collegeID == collegeId)?.name
                : string.INSTITUTE_NAME
            }
            width={"100%"}
          />
        </a>
      </div>
      <div className="row no-gutters">
        {data &&
          data.map((item, index) => {
            return (
              <>
                {item.noMenu ? null : (
                  <>
                    {item.subMenu && item.subMenu.length > 0 ? (
                      <>
                        <ul
                          className="list-group"
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className={
                              focusIndex == index
                                ? "list-group-item list-group-item-action active"
                                : "list-group-item list-group-item-action"
                            }
                            onClick={() => {
                              handleLinkGroupClick(item.link);
                              setSelectedIndex(
                                selectedIndex == index ? -1 : index
                              );
                            }}
                          >
                            <Icon iconName={item.icon} fontSize={"small"} />
                            &nbsp; {item.title}
                            <Icon
                              iconName={
                                selectedIndex == index
                                  ? "KeyboardArrowUp"
                                  : "KeyboardArrowDown"
                              }
                              color={"#cbd6eb"}
                              fontSize={"small"}
                              style={{ float: "right" }}
                            />
                          </div>
                        </ul>
                        {selectedIndex == index
                          ? item.subMenu &&
                            item.subMenu.length > 0 && (
                              <div className="row no-gutters ps-3">
                                {item.subMenu.map((item, index) => {
                                  return (
                                    <LinkGroup
                                      key={index}
                                      to={unSavedChanges ? null : item.link}
                                      link={item.link}
                                      preTitle={">>"}
                                      title={item.title}
                                      icon={
                                        <Icon
                                          iconName={item.icon}
                                          fontSize={"small"}
                                        />
                                      }
                                      onClick={() => {
                                        handleLinkGroupClick(item.link);
                                        // setSelectedIndex(index);
                                      }}
                                      onMenuFocus={(isFocused) => {
                                        console.log("isFocused", isFocused);
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )
                          : null}
                      </>
                    ) : item.link ? (
                      <LinkGroup
                        key={index}
                        to={unSavedChanges ? null : item.link}
                        link={item.link}
                        title={item.title}
                        icon={<Icon iconName={item.icon} fontSize={"small"} />}
                        onClick={() => {
                          handleLinkGroupClick(item.link);
                          setSelectedIndex(index);
                          setFocusIndex(index);
                        }}
                      />
                    ) : null}
                  </>
                )}
              </>
            );
          })}
      </div>
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
                navigate(linkToNavigate); // Navigate to the stored link
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
    </div>
  );
}

export default SubNavBar;
