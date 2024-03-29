import React, { useEffect, useState } from "react"
import "semantic-ui-react"
import "./App.css";
import {Dropdown, Modal, Loader} from "semantic-ui-react";
import { filterOptions, statusKeyMap, statusColorCodeMap } from "./constants"
import TaskPanel from "./TaskPanel";
import { firestore } from "./InitFirebase";
import {addDoc, collection, getDocs, doc, updateDoc, deleteDoc} from "@firebase/firestore";

const App = (props) => {
  const [state, setState] = useState({
    loading: true,
    error: false,
    toDoList: [],
    formattedList: {},
    activeFilter: 0,
    showModalPrompt: false,
    isNewForm: false,
    editTaskData: null,
    user: null
  });

  const dataSet = collection(firestore, "todoList");

  const [statusCount, setStatusCount] = useState({});

  const updateStatusCount = (formattedList) => {
    const statusCount = {};
    let allCount = 0;
    Object.values(statusKeyMap).forEach((item, index) => {
      const itemCount = formattedList[item.value]?.length || 0;
      allCount += itemCount;
      statusCount[index + 1] = itemCount;
    });
    statusCount[0] = allCount;
    setStatusCount(statusCount);
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = (additionalStateChanges) => {
    const query = getDocs(dataSet);
    query.then((resp) => {
      const todoList = resp.docs.map((item) => ({...item.data(), id: item.id}));
      updateData(todoList, additionalStateChanges);
    })
    .catch((e) => {
      setState({
        ...state,
        loading: false,
        error: true
      });
    });
  }

  const updateData = (data, additionalStateChanges = {}) => {
    const toDoList = data;
    const formattedList = {};
    toDoList.forEach((item) => {
      const statusKey = statusKeyMap[item.status].value;
      if (!formattedList[statusKey]) {
        formattedList[statusKey] = [item];
      } else {
        formattedList[statusKey].push(item);
      }
    })
    setState({
      ...state,
      loading: false,
      error: false,
      toDoList,
      formattedList: formattedList,
      ...additionalStateChanges
    });
    updateStatusCount(formattedList);
  }

  const addNewTask = () => {
    setState({
      ...state,
      showModalPrompt: true,
      isNewForm: true
    });
  }

  const deleteTask = (taskData) => {
    setState({
      ...state,
      loading: true
    });
    const todoRef = doc(firestore, 'todoList', taskData.id);
    deleteDoc(todoRef).then(() => {
      loadData();
    })
    .catch((e) => {
      setState({
        ...state,
        error: true,
        loading: false
      });
    });
  }

  const updateTask = (data) => {
    const {toDoList} = {...state};
    setState({
      ...state,
      loading: true
    });
    if (data.id) {
      const todoRef = doc(firestore, 'todoList', data.id);
      updateDoc(todoRef, data).then(() => {
        loadData({
          showModalPrompt: false,
          editTaskData: null
        });
      })
      .catch((e) => {
        setState({
          ...state,
          error: true,
          loading: false,
          showModalPrompt: false,
          editTaskData: null
        });
      })
    } else {
      addDoc(dataSet, data)
      .then(() => {
        loadData({
          showModalPrompt: false,
          editTaskData: null
        });
      })
      .catch((e) => {
        setState({
          ...state,
          error: true,
          loading: false,
          showModalPrompt: false,
          editTaskData: null
        });
      })
    };
  }

  const editTask = (task, index) => {
    setState({
      ...state,
      showModalPrompt: true,
      editTaskData: task,
      isNewForm: false
    })
  }

  const closePopup = () => {
    setState({
      ...state,
      showModalPrompt: false,
      editTaskData: null,
    });
  }

  const renderListGridContainer = () => {
    const {activeFilter, formattedList, loading, error, toDoList} = {...state};
    if (loading) {
      return (
        <div className="list-grid-container">
          <div className="ui active loader" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="list-grid-container error-view">
          "Oops! Something went wrong..."
        </div>
      );
    }
    
    if (!toDoList || toDoList.length === 0) {
      return (
        <div className="list-grid-container error-view">
          {'Your list is empty. Please click on "Add Task" button to add a task'}
        </div>
      )
    }
    const columns = [];
    if (!activeFilter) {
      Object.values(statusKeyMap).forEach((item) => {
        columns.push(item.value);
      })
    } else {
      const item = Object.values(statusKeyMap).find((item) => item.key === activeFilter);
      columns.push(item.value);
    }
    
    return (
      <div className={`list-grid-container ${activeFilter ? "filtered-view" : ""}`}>
        {
          columns.map((item, index) => {
            const list = formattedList[item];
            if (list) {
              return (
                <div className="list-grid-columns" key={`list-grid-column-${index + 1}`}>
                {list.map((list, index2) => (
                  <div className="list-card">
                    <span className="list-title">{list.title}</span>
                    <span className="list-description">{list.description}</span>
                    <span className="list-footer">
                      <span className="action-buttons">
                        <button className="card-button edit" onClick={() => {
                          editTask(list);
                        }}>
                          <i className="edit icon"></i>
                        </button>
                        <button className="card-button delete" onClick={() => {
                          deleteTask(list)
                        }}>
                          <i className="trash icon"></i>
                        </button>
                      </span>
                      <span className="list-status" style={{background: activeFilter ? statusColorCodeMap[activeFilter] : statusColorCodeMap[index + 1]}}>{list.status}</span>
                    </span>
                  </div>
                ))}
                </div>
              )
            } else {
              return "";
            }
          })
        }
      </div>
    )
  }

  return (
    <div className="todo-app-container">
      <div className="app-header">My ToDo App</div>
      <Modal
        open={state.showModalPrompt && !state.loading}
        closeOnDimmerClick={false}
        onClose={closePopup}
      >
        <Modal.Header>{state.isNewForm ? "Add New Task" : state.editTaskData ? state.editTaskData.title : ""}</Modal.Header>
        <Modal.Content>
          {state.showModalPrompt && (
            <TaskPanel data={state.editTaskData} updateTask={updateTask} closePopup={closePopup} />
          )}
        </Modal.Content>
      </Modal>
      <div className="status-cards">
        {filterOptions.map((item) => (
          <div className="status-card" key={`status-card-${item.key}`}>
            <span className="status-name">
              {item.text}
            </span>
            <span className="status-count">{statusCount[item.key]}</span>
          </div>
        ))}
      </div>
      <div className="filter-dropdown">
        <button onClick={addNewTask} className="add-task-btn">Add Task <i className="plus icon"></i></button>
        <label htmlFor="filterDropdown" style={{marginRight: "8px"}}>Filter: </label>
        <Dropdown
          inline
          labeled={true}
          id="filterDropdown"
          selectOnBlur={false}
          selectOnNavigation={false}
          options={filterOptions}
          value={state.activeFilter}
          onChange={(e, data) => setState({
            ...state,
            activeFilter: data.value
          })}
        />
      </div>
      {renderListGridContainer()}
    </div>
  )
}

export default App;
