import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";

import preFunction from "../../component/common/CommonFunction";
import CustomActivityIndicator from "../../component/common/CustomActivityIndicator";
import { showList } from "../../component/common/CommonArray";
import Icon from "../../component/Icon";
import ScreenTitle from "../../component/common/ScreenTitle";

function Learning() {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  return (
    <div className="content-area-report" onClick={preFunction.hideNavbar}>
      <CustomActivityIndicator
        style={{ height: 100, alignSelf: "center" }}
        visible={load}
      />
      <div className="row no-gutters bg-white-report">
        <ScreenTitle titleClass="page-heading-position" />
        <div
          className="row no-gutters mt-1 text-center"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showList.map((item, index) => {
            return (
              <div
                className="col-lg-4 text-center card-learning"
                onClick={() => {
                  // handleSelect(item.subData);
                  navigate(item.link);
                  // handleActiveMenu();
                }}
              >
                <div className="card-learning-icon">
                  <Icon
                    iconName={item.icon}
                    sx={{
                      fontSize: 50,
                      color: "#2455b7",
                    }}
                  />
                </div>
                <text>{item.label}</text>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default Learning;
