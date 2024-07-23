import React from "react";

//get content from the parent component and print it
export class ComponentToPrint extends React.PureComponent {
  render() {
    return <div>{this.props.content}</div>;
  }
}
