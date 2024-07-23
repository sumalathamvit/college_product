import React from "react";
import ReactToPrint from "react-to-print";
// import ReactToPdf from "react-to-pdf";
import DataComponent from "./DataComponent";

class PdfComponent extends React.Component {
  render() {
    // const ref = React.createRef(<DataComponent />);
    return (
      <div>
        <div className="row">
          <DataComponent
            ref={(response) => (this.componentRef = response)}
            data={this.props.data}
          />
        </div>

        <div className="row">
          <div className="col-lg-2"></div>
          <div className="col-lg-6">
            <div className="row prescriptionLetterHeadWidth">
              {this.props.downloadButton && this.props.invoiceButton ? (
                <>
                  <div className="col-lg-4 text-center mt-2">
                    <ReactToPrint
                      content={() => this.componentRef}
                      documentTitle={this.props.docTitle}
                      trigger={() => (
                        <button className="btn btn-primary">
                          <span className="icofont-printer"></span>Print
                        </button>
                      )}
                    />
                  </div>
                  {this.props.downloadButton ? (
                    <div className="col-lg-4 mt-2 text-center">
                      {this.props.downloadButton}
                    </div>
                  ) : null}

                  {this.props.invoiceButton ? (
                    <div className="col-lg-4 mt-2 text-center">
                      {this.props.invoiceButton}
                    </div>
                  ) : null}
                </>
              ) : this.props.downloadButton && !this.props.invoiceButton ? (
                <>
                  <div className="col-lg-2"></div>
                  <div className="col-lg-4 text-center mt-2">
                    <ReactToPrint
                      content={() => this.componentRef}
                      documentTitle={this.props.docTitle}
                      trigger={() => (
                        <button className="btn btn-primary">
                          <span className="icofont-printer"></span>Print
                        </button>
                      )}
                    />
                  </div>
                  <div className="col-lg-4 mt-2 text-center">
                    {this.props.downloadButton}
                  </div>
                  <div className="col-lg-2"></div>
                </>
              ) : this.props.invoiceButton && !this.props.downloadButton ? (
                <>
                  <div className="col-lg-2"></div>
                  <div className="col-lg-4 text-center mt-2">
                    <ReactToPrint
                      content={() => this.componentRef}
                      documentTitle={this.props.docTitle}
                      trigger={() => (
                        <button className="btn btn-primary">
                          <span className="icofont-printer"></span>Print
                        </button>
                      )}
                    />
                  </div>
                  <div className="col-lg-4 mt-2 text-center">
                    {this.props.invoiceButton}
                  </div>
                  <div className="col-lg-2"></div>
                </>
              ) : (
                <>
                  <div className="text-center mt-2">
                    <ReactToPrint
                      content={() => this.componentRef}
                      documentTitle={this.props.docTitle}
                      trigger={() => (
                        <button className="btn btn-primary">
                          <span className="icofont-printer"></span>Print
                        </button>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-lg-4"></div>
        </div>
        {/* <div className="col-2 mt-4">
            <ReactToPdf targetRef={ref} filename={this.props.docTitle}>
              {({ toPdf }) => (
                <button className="btn" onClick={toPdf}>
                  Download pdf
                </button>
              )}
            </ReactToPdf>
          </div> */}
      </div>
    );
  }
}
export default PdfComponent;
