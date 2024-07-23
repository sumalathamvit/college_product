import React, { useEffect, useState } from "react";
import Icon from "../Icon";
import MenuArrayFunction from "./MenuArrayFunction";
import MenuArrayFunctionSchool from "./MenuArrayFunctionSchool";
import InstituteMenuArrayFunction from "./InstituteMenuArrayFunction";

import { useSelector } from "react-redux";

function ScreenTitle({ titleClass, customTitle = null }) {
  const [titleData, setTitleData] = useState();
  const collegeConfig = useSelector((state) => state.web.college);
  const menuData =
    collegeConfig.institution_type === 1
      ? MenuArrayFunctionSchool()
      : collegeConfig.institution_type === 5
      ? InstituteMenuArrayFunction()
      : MenuArrayFunction();

  useEffect(() => {
    menuData.map((item, index) => {
      item.subMenu.map((subItem, index) => {
        subItem.subData.map((subDataItem, index) => {
          if (subDataItem?.subMenu) {
            subDataItem.subMenu.map((subDataItem, index) => {
              if (window.location.pathname == subDataItem.link) {
                setTitleData(subDataItem);
              }
            });
          } else if (window.location.pathname == subDataItem.link) {
            setTitleData(subDataItem);
          }
        });
      });
    });
  }, [collegeConfig.institution_type]);

  return (
    <div className="row no-gutters">
      <div className="page-heading">
        <div>
          <Icon
            iconName={titleData?.icon ? titleData?.icon : "School"}
            className={titleClass}
            fontSize={"medium"}
          />
          {customTitle ? customTitle : titleData?.title}
        </div>
      </div>
    </div>
  );
}

export default ScreenTitle;
