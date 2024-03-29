import React, { useEffect, useState } from "react";
import {Form, Input, TextArea, Button, Message, Dropdown} from "semantic-ui-react";
import {statuses} from "./constants";

const TaskPanel = (props) => {
  const [state, setState] = useState(props.data ? {...props.data} : {status: "To Do"});
  const [formError, setFormError] = useState(false);

  const handleChange = (e, data) => {
    const updatedData = {
      ...state,
      [data.name]: data.value
    };
    setState(updatedData);
    if (formError) {
      validateForm(updatedData);
    }
  }

  const onSave = () => {
    if (!formError) {
      setFormError({})
    }
    const isValid = validateForm(state);
    if (isValid) {
        props.updateTask({
        ...props.data,
        title: state.title,
        description: state.description,
        status: state.status ? state.status : "To Do"
      });
    }
  };

  const validateForm = (data) => {
    const {title, description} = {...data};
    const updatedFormError = {};
    let isValid = true;
    if (!title) {
      updatedFormError["title"] = true;
      isValid = false;
    }
    if (!description) {
      updatedFormError["description"] = true;
      isValid = false;
    }
    setFormError(updatedFormError);
    return isValid;
  }

  const getFormContent = () => {
    const titleError = formError && formError.title ? "This field is mandatory" : null;
    const descriptionError = formError && formError.description ? "This field is mandatory" : null;
    return (
      <Form className="task-form" error={titleError || descriptionError}>
        <Form.Field required error={titleError}>
          <label htmlFor="title">Title</label>
          <Input
            value={state.title}
            name="title"
            onChange={handleChange}
            maxLength={50}
          />
        </Form.Field>
        <Form.Field required error={descriptionError}>
          <label htmlFor="description">Description</label>
          <TextArea
            value={state.description}
            name="description"
            onChange={handleChange}
            maxLength={255}
          />
        </Form.Field>
        {(titleError || descriptionError) && (
          <Message
            error
            content="Please fill the mandatory fields"
          />
        )}
        <Form.Field>
          <label htmlFor="status">Status: </label>
          <Dropdown
            options = {statuses}
            floating
            selection
            selectOnBlur={false}
            selectOnNavigation={false}
            placeholder="Select Status"
            name="status"
            value={state.status}
            onChange={handleChange}
          />
        </Form.Field>
        
        <div className="form-actions">
          <Button onClick={onSave} className="ui button primary">Save</Button>
          <Button onClick={props.closePopup} className="ui button basic">Cancel</Button>
        </div>
      </Form>
    )
  }

  return getFormContent();
}

export default TaskPanel;
