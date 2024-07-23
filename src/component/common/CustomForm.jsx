import React from "react";
import { Formik, Form } from "formik";

function CustomForm({ initialValues, onSubmit, validationSchema, children }) {
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      <Form className="justify-content-center align-items-center form-horizontal">
        {children}
      </Form>
    </Formik>
  );
}

export default CustomForm;
