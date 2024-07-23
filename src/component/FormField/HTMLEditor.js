import React, { useEffect, useState } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useFormikContext } from "formik";

const HTMLEditor = ({
  id,
  label,
  labelSize = 5,
  style,
  tabIndex,
  onChange,
  value,
  editorRef,
  mandatory = 0,
  ...otherProps
}) => {
  const [editorState, setEditorState] = useState();

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const convertEditorStateToHTML = (state) => {
    if (state) return draftToHtml(convertToRaw(state.getCurrentContent()));
  };

  const createEditorStateFromHTML = (html) => {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const test = EditorState.createWithContent(contentState);
      setEditorState(test);
      return test;
    }
  };

  const handleSetEditorState = () => {
    if (value) {
      let state = createEditorStateFromHTML(value);
      setEditorState(state);
    } else {
      setEditorState(EditorState.createEmpty());
    }
  };
  useEffect(() => {
    onChange(convertEditorStateToHTML(editorState));
  }, [editorState]);

  useEffect(() => {
    handleSetEditorState();
  }, []);
  const { errors, touched, values } = useFormikContext();

  return (
    <div className="row no-gutters mt-2" id={`c${id}`}>
      {label && label != "" && (
        <div
          className={`col-lg-${labelSize} ${
            window.innerWidth > 992 ? "text-right" : ""
          } pe-3 mt-2`}
        >
          <label>
            {document.getElementById(id)?.alt
              ? document.getElementById(id)?.alt
              : label}
          </label>
        </div>
      )}
      <div className={label ? `col-lg-${12 - labelSize}` : "col-lg-12"}>
        <div style={style}>
          <Editor
            id={id}
            ref={editorRef}
            editorState={editorState}
            wrapperClassName={
              mandatory === 1 ? "wrapper-class" : "wrapper-class-non-mandatory"
            }
            editorClassName={
              mandatory === 1
                ? "editor-class"
                : "editor-class-non-mandatory non-mandatory-input"
            }
            toolbarClassName="toolbar-class"
            onEditorStateChange={handleEditorChange}
            tabIndex={tabIndex}
            {...otherProps}
          />
        </div>
        {touched[id] && errors[id] && (
          <div className="error-message">{errors[id]}</div>
        )}
      </div>
    </div>
  );
};

export default HTMLEditor;
