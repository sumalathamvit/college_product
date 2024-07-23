import React from "react";
//import { ReactHtmlParser } from "react-html-parser";
const thStyle = {
  fontFamily: "Anton",
  fontWeight: "normal",
  fontStyle: "normal",
};
class DataComponent extends React.Component {
  render() {
    return this.props.data;
  }
}
export default DataComponent;
