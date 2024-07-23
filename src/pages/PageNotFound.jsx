import Lottie from "lottie-react";
import React from "react";
import Error404 from "../assests/json/pagenotfound.json";

const PageNotFound = () => {
  return (
    <>
      <div
        className="row"
        style={{ backgroundColor: "white", display: "flex", height: "100vh" }}
      >
        <div className="col-3"></div>
        <div className="col-6 text-center">
          <Lottie
            style={styles.animation}
            animationData={Error404}
            loop={true}
          />
          <h2
            className=""
            //   style={{ marginTop: "-90px", padding: "0px" }}
          >
            Something's wrong here
          </h2>
          <h6>
            This is a 404 error, which means you've clicked on a bad link or
            entered an invalid URL.
          </h6>
          <h6>Please contact Support Engineer.</h6>
        </div>
      </div>
    </>
  );
};

const styles = {
  animation: {
    height: "80%",
    textAlign: "center",
  },
};

export default PageNotFound;
