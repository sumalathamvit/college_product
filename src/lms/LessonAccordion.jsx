import React, { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap";

import LinkGroup from "../component/common/LinkGroup";
import storage from "../auth/storage";
import AuthContext from "../auth/context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../component/Icon";
import Button from "../component/FormField/Button";
import string from "../string";
import { useDispatch, useSelector } from "react-redux";

function LessonAccordion() {
  const { subMenu } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [linkToNavigate, setLinkToNavigate] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focusIndex, setFocusIndex] = useState(-1);
  const dispatch = useDispatch();

  const { unSavedChanges, setUnSavedChanges } = useContext(AuthContext);
  const collegeConfig = useSelector((state) => state.web.college);

  //   const getData = async () => {
  //     try {
  //       const storedMenuData = storage.getMenuData();
  //       setData(storedMenuData);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   const handleLinkGroupClick = (link) => {
  //     if (
  //       JSON.parse(sessionStorage.getItem("unSavedChanges")) &&
  //       link !== location.pathname
  //     ) {
  //       setOpenModal(true);
  //       setLinkToNavigate(link);
  //       return;
  //     }
  //   };

  //   useEffect(() => {
  //     getData();
  //   }, [subMenu]);

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
      <div className="p-3 text-center">
        <a href="/">
          <img
            src={
              sessionStorage.getItem("HEADER_LOGO") ??
              require("../assests/png/header-logo.png")
            }
            alt={string.INSTITUTE_NAME}
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
    </div>
  );
}

export default LessonAccordion;
